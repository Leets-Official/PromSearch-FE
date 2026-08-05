import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useAuthStatus } from "@/hooks/use-auth-status";

/**
 * `isAdmin` 판정.
 *
 * ⚠️ 지금은 **임시로 계정 이름**("admin")으로 연다. 원래는 access token 의 `role` 클레임이
 * 맞는데, 발급되는 어드민 토큰의 role 이 `USER` 라 그걸로는 화면에 들어갈 수가 없다.
 * 서버가 실제로 어떻게 응답하는지 확인하려면 화면은 열려야 해서 임시로 뚫어 둔 것.
 * BE 가 role 을 올려 주면 role 판정으로 되돌리고 이 테스트도 함께 고친다.
 */

/** 서명 없이 페이로드만 있는 JWT 형태 문자열 — 우리는 검증하지 않고 읽기만 한다. */
function fakeJwt(claims: Record<string, unknown>): string {
  const b64 = Buffer.from(JSON.stringify(claims))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `header.${b64}.signature`;
}

function setToken(token: string | null, profileName?: string) {
  vi.doMock("@/lib/api", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@/lib/api")>()),
    getAccessToken: () => token,
  }));
  // 프로필 조회는 이 테스트의 관심사가 아니다(react-query Provider 도 필요 없어진다)
  vi.doMock("@/hooks/use-my-profile", () => ({
    useMyProfile: () => ({ data: profileName ? { nickname: profileName } : undefined }),
  }));
}

/** 모듈 캐시를 비우고 다시 불러온다 — 스냅샷 캐시가 테스트 간 새지 않게 */
async function renderWith(token: string | null, profileName?: string) {
  vi.resetModules();
  setToken(token, profileName);
  const { useAuthStatus: hook } = await import("@/hooks/use-auth-status");
  return renderHook(() => hook()).result.current;
}

describe("useAuthStatus.isAdmin", () => {
  afterEach(() => {
    vi.doUnmock("@/lib/api");
    vi.doUnmock("@/hooks/use-my-profile");
    vi.resetModules();
  });

  it("어드민 계정(admin)이면 어드민이다", async () => {
    const status = await renderWith(fakeJwt({ userId: 3, role: "USER" }), "admin");
    expect(status.isAdmin).toBe(true);
  });

  it("일반 계정이면 어드민이 아니다 — 로그인은 되어 있다", async () => {
    const status = await renderWith(fakeJwt({ userId: 3, role: "USER" }), "프롬프트장인");
    expect(status.isAdmin).toBe(false);
    expect(status.isAuthenticated).toBe(true);
  });

  it("프로필이 아직 안 왔으면 어드민이 아니다(판정 보류)", async () => {
    const status = await renderWith(fakeJwt({ userId: 3, role: "USER" }));
    expect(status.isAdmin).toBe(false);
    expect(status.isAuthenticated).toBe(true);
  });

  it("토큰이 없으면 비회원", async () => {
    const status = await renderWith(null);
    expect(status.isAuthenticated).toBe(false);
    expect(status.isAdmin).toBe(false);
  });

  it("JWT 형식이 아니어도 죽지 않는다", async () => {
    const status = await renderWith("not-a-jwt");
    expect(status.isAuthenticated).toBe(true);
    expect(status.isAdmin).toBe(false);
  });
});

// 타입만 참조해 lint 의 미사용 import 경고를 피한다(위에서는 동적 import 로 쓴다)
void useAuthStatus;

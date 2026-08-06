import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useAuthStatus } from "@/hooks/use-auth-status";

/**
 * `isAdmin` 은 access token 의 `role` 클레임으로 정해진다.
 * (한때 상수에 `false` 로 박혀 있어 어드민 화면에 아무도 못 들어갔고,
 *  BE 가 role 을 내려주기 전에는 계정 이름으로 임시 개방해 두기도 했다 — 둘 다 정리됨)
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

  it("role 이 ADMIN 이면 어드민이다", async () => {
    expect((await renderWith(fakeJwt({ userId: 3, role: "ADMIN" }))).isAdmin).toBe(true);
  });

  it("role 이 USER 면 어드민이 아니다 — 로그인은 되어 있다", async () => {
    const status = await renderWith(fakeJwt({ userId: 3, role: "USER" }));
    expect(status.isAdmin).toBe(false);
    expect(status.isAuthenticated).toBe(true);
  });

  it("role 클레임이 없어도 죽지 않는다", async () => {
    expect((await renderWith(fakeJwt({ userId: 3 }))).isAdmin).toBe(false);
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

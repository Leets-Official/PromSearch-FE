import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/api/auth-cookie";

import { config, proxy } from "./proxy";

const ORIGIN = "http://localhost:3000";

function requestFor(path: string, cookies: Record<string, string> = {}) {
  const request = new NextRequest(`${ORIGIN}${path}`);
  for (const [name, value] of Object.entries(cookies)) {
    request.cookies.set(name, value);
  }
  return request;
}

/** 리다이렉트 응답이면 Location URL, 통과면 null */
function redirectTarget(response: Response): URL | null {
  const location = response.headers.get("location");
  return location ? new URL(location) : null;
}

describe("보호 라우트", () => {
  it("비로그인은 홈으로 보내고, 원래 경로를 redirect 파라미터로 남긴다", () => {
    const target = redirectTarget(proxy(requestFor("/upload")));

    expect(target?.pathname).toBe("/home");
    expect(target?.searchParams.get("login")).toBe("required");
    expect(target?.searchParams.get("redirect")).toBe("/upload");
  });

  it("쿼리스트링까지 포함해 복귀 경로를 보존한다", () => {
    const target = redirectTarget(proxy(requestFor("/upload?draft=1")));

    expect(target?.searchParams.get("redirect")).toBe("/upload?draft=1");
  });

  it("하위 경로도 함께 보호한다", () => {
    const target = redirectTarget(proxy(requestFor("/upload/step-2")));

    expect(target?.pathname).toBe("/home");
    expect(target?.searchParams.get("redirect")).toBe("/upload/step-2");
  });

  it("accessToken 이 있으면 통과시킨다", () => {
    const response = proxy(requestFor("/upload", { [ACCESS_TOKEN_COOKIE]: "access-1" }));

    expect(redirectTarget(response)).toBeNull();
  });

  it("accessToken 이 만료돼 사라져도 refreshToken 이 있으면 통과시킨다(인터셉터가 재발급)", () => {
    const response = proxy(requestFor("/upload", { [REFRESH_TOKEN_COOKIE]: "refresh-1" }));

    expect(redirectTarget(response)).toBeNull();
  });
});

describe("dev 프리뷰 인증", () => {
  // 실제 auth 전까지 화면의 로그인 상태는 dev 툴바 쿠키로 결정된다.
  // 툴바가 꺼진 환경(테스트 기본)에서는 쿠키가 있어도 무시돼야 한다 — 프로덕션 보호가 풀리면 안 되므로.
  it("툴바가 꺼져 있으면 dev 프리뷰 쿠키는 무시한다", () => {
    const target = redirectTarget(
      proxy(requestFor("/upload", { ps_dev_preview: "authenticated.default.normal.seeded" })),
    );

    expect(target?.pathname).toBe("/home");
  });
});

describe("guest-only 라우트", () => {
  it("로그인 상태로 회원가입에 들어가면 홈으로 되돌린다", () => {
    const target = redirectTarget(
      proxy(requestFor("/signup", { [ACCESS_TOKEN_COOKIE]: "access-1" })),
    );

    expect(target?.pathname).toBe("/home");
    expect(target?.searchParams.get("login")).toBeNull();
  });

  it("비로그인은 회원가입에 그대로 들어간다", () => {
    expect(redirectTarget(proxy(requestFor("/signup")))).toBeNull();
  });
});

describe("matcher", () => {
  // matcher 는 리터럴이어야 해서 auth-routes 목록과 수동 동기화한다 — 빠뜨리면 보호가 조용히 풀린다.
  it("보호/guest-only 라우트가 모두 matcher 에 등록돼 있다", () => {
    expect(config.matcher).toEqual(
      expect.arrayContaining(["/upload", "/upload/:path*", "/signup", "/signup/:path*"]),
    );
  });
});

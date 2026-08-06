/**
 * 라우트 보호 — 페이지가 렌더되기 전에 서버(엣지)에서 인증 여부를 확인한다.
 *
 * Next 16 에서 `middleware.ts` 는 **`proxy.ts` 로 이름이 바뀌었다**(middleware 컨벤션은 deprecated).
 * export 하는 함수명도 `middleware` 가 아니라 `proxy` 다.
 *
 * 판정 근거는 인증 쿠키의 **존재 여부**뿐이다. 서버는 토큰을 검증하지 않는다.
 * - 쿠키가 위조/만료여도 통과할 수 있지만, 실제 데이터는 BE 가 JWT 를 검증해 401 을 준다.
 *   즉 여기는 "보안 경계"가 아니라 **UX 가드**다(비로그인이 빈 화면을 보지 않게).
 * - accessToken 이 만료됐어도 refreshToken 이 있으면 통과시킨다. 페이지 진입 후 첫 API 호출이
 *   401 을 받고 인터셉터가 재발급하기 때문이다(여기서 튕기면 멀쩡한 세션이 로그아웃된다).
 *
 * 보호 대상 추가는 {@link file://./lib/auth-routes.ts} 와 아래 `config.matcher` **두 곳**에.
 */

import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/api/auth-cookie";
import {
  AUTHENTICATED_HOME_PATH,
  GUEST_ONLY_ROUTES,
  LOGIN_REDIRECT_PATH,
  LOGIN_REQUIRED_PARAM,
  LOGIN_REQUIRED_VALUE,
  matchesRoute,
  PROTECTED_ROUTES,
  REDIRECT_PARAM,
} from "@/lib/auth-routes";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 인증 쿠키 존재 여부만 본다 — 토큰을 검증하지는 않는다(보안 경계가 아니라 UX 가드).
  const hasSession = Boolean(
    request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ??
    request.cookies.get(REFRESH_TOKEN_COOKIE)?.value,
  );

  // 비로그인 → 보호 라우트: 로그인 모달이 있는 홈으로. 원래 가려던 경로를 실어 보내 로그인 후 복귀시킨다.
  if (!hasSession && matchesRoute(pathname, PROTECTED_ROUTES)) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_REDIRECT_PATH;
    url.search = "";
    url.searchParams.set(LOGIN_REQUIRED_PARAM, LOGIN_REQUIRED_VALUE);
    url.searchParams.set(REDIRECT_PARAM, `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  // 로그인 → guest-only 라우트(회원가입 등): 홈으로 되돌린다.
  if (hasSession && matchesRoute(pathname, GUEST_ONLY_ROUTES)) {
    const url = request.nextUrl.clone();
    url.pathname = AUTHENTICATED_HOME_PATH;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

/**
 * matcher 는 빌드 타임에 정적 분석되므로 **리터럴이어야 한다**(변수/배열 전개 불가).
 * 그래서 `lib/auth-routes.ts` 의 목록과 수동으로 맞춰 준다 — 새 보호 라우트는 양쪽 모두에 추가.
 */
export const config = {
  matcher: ["/upload", "/upload/:path*", "/signup", "/signup/:path*", "/mypage", "/mypage/:path*"],
};

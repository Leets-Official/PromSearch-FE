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
import { DEV_PREVIEW_COOKIE, DEV_TOOLBAR_ENABLED, parseDevPreview } from "@/lib/dev-preview";
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

/**
 * dev 전용 가짜 로그인 판정.
 *
 * 실제 auth 가 붙기 전까지 화면의 로그인 상태는 dev 툴바(쿠키 `ps_dev_preview`)나
 * `NEXT_PUBLIC_MOCK_AUTH` 로만 결정된다. 이 프록시는 인증 **쿠키**만 봤기 때문에,
 * 화면상 로그인 상태여도 `/upload` 진입이 `?login=required` 로 튕기는 문제가 있었다.
 * 툴바가 켜진 환경(dev/preview)에서만 동일한 소스를 함께 본다 — 프로덕션에선 영향 없다.
 */
function hasMockSession(request: NextRequest): boolean {
  if (!DEV_TOOLBAR_ENABLED) return process.env.NEXT_PUBLIC_MOCK_AUTH != null;
  const preview = parseDevPreview(request.cookies.get(DEV_PREVIEW_COOKIE)?.value);
  if (preview.auth !== "anonymous") return true;
  // 툴바 쿠키가 아직 없으면(첫 방문) env 폴백 — useAuthStatus 의 폴백 규칙과 동일하게 맞춘다.
  return !request.cookies.has(DEV_PREVIEW_COOKIE) && process.env.NEXT_PUBLIC_MOCK_AUTH != null;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const hasSession =
    Boolean(
      request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ??
      request.cookies.get(REFRESH_TOKEN_COOKIE)?.value,
    ) || hasMockSession(request);

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
  matcher: ["/upload", "/upload/:path*", "/signup", "/signup/:path*"],
};

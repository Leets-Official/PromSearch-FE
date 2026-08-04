/**
 * 라우트 보호 정책 — `src/proxy.ts`(서버)와 로그인 UI(클라이언트)가 함께 보는 상수.
 *
 * 순수 상수/함수만 둔다(엣지 런타임에서 import 되므로 DOM·Node API 금지).
 */

/**
 * 로그인해야 볼 수 있는 경로. 하위 경로까지 함께 보호된다(`/upload/step-2` 포함).
 *
 * ⚠️ 새 보호 페이지를 만든 담당자는 **여기와 `src/proxy.ts` 의 `config.matcher` 두 곳**에 추가해야 한다.
 * matcher 는 빌드 타임에 정적 분석되어야 해서 이 배열로부터 자동 생성할 수 없다(Next 제약).
 * 예: 마이페이지를 만들면 → 여기에 `"/mypage"`, matcher 에 `"/mypage/:path*"`.
 */
export const PROTECTED_ROUTES = ["/upload"] as const;

/**
 * 로그인한 사용자는 들어갈 이유가 없는 경로(회원가입 등). 진입 시 홈으로 되돌린다.
 * 로그인 페이지가 별도 라우트로 생기면 여기에 추가한다(현재 로그인은 홈의 모달).
 */
export const GUEST_ONLY_ROUTES = ["/signup"] as const;

/** 비로그인 사용자가 보호 라우트에 접근했을 때 보내는 곳. 로그인 모달이 있는 화면. */
export const LOGIN_REDIRECT_PATH = "/home";

/** 로그인한 사용자가 guest-only 라우트에 접근했을 때 보내는 곳. */
export const AUTHENTICATED_HOME_PATH = "/home";

/** `?login=required` — 로그인 모달을 자동으로 열어야 한다는 신호(로그인 담당자가 읽어 처리). */
export const LOGIN_REQUIRED_PARAM = "login";
export const LOGIN_REQUIRED_VALUE = "required";

/** `?redirect=/upload` — 로그인 성공 후 돌아갈 원래 경로. */
export const REDIRECT_PARAM = "redirect";

/** 경로가 목록 중 하나에 속하는가(정확히 일치하거나 하위 경로). */
export function matchesRoute(pathname: string, routes: readonly string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/**
 * 인증 쿠키 상수 — 브라우저(token-store)와 서버(proxy)가 **같은 값을 보게** 하는 단일 소스.
 *
 * 이 파일은 순수 상수만 담는다(DOM·Node API 없음). 엣지 런타임에서 도는 `src/proxy.ts` 가
 * import 해도 안전해야 하기 때문이다.
 *
 * 왜 쿠키인가: BE 가 토큰을 응답 **본문**으로 준다(httpOnly 쿠키가 아니다). 저장은 프론트 몫인데,
 * localStorage 에 두면 서버(proxy·서버컴포넌트)에서 읽을 수 없어 라우트 보호가 불가능하다.
 * 쿠키에 두면 axios·proxy·서버컴포넌트가 모두 같은 값을 읽는다.
 *
 * 보안: axios 가 값을 읽어 `Authorization` 헤더에 실어야 하므로 httpOnly 를 쓸 수 없다.
 * 즉 XSS 노출 범위는 localStorage 와 동일하다(더 나빠지지 않는다). BE 가 httpOnly 쿠키 방식으로
 * 바뀌면 이 파일과 `token-store.ts` 만 교체하면 된다.
 */

export const ACCESS_TOKEN_COOKIE = "ps_access_token";
export const REFRESH_TOKEN_COOKIE = "ps_refresh_token";

/**
 * 쿠키 수명. 토큰의 실제 만료는 JWT `exp` 가 결정하고, 쿠키 만료는 "언제까지 들고 있을지"일 뿐이다.
 * access 쿠키가 살아 있어도 토큰이 만료됐으면 API 가 401 → 인터셉터가 재발급한다.
 */
export const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24; // 1일
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 14; // 14일

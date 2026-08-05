/**
 * 토큰 보관소 — 인증 담당 코드와 HTTP 레이어 사이의 유일한 이음새.
 *
 * BE 는 로그인/소셜로그인/재발급 응답 **본문**으로 `accessToken` + `refreshToken` 을 준다.
 * 그래서 저장은 프론트 몫이고, 여기서만 다룬다. 로그인 기능 구현자는 로그인 성공 시 {@link setTokens},
 * 로그아웃 시 {@link clearTokens} 만 호출하면 인터셉터(Authorization 주입·401 재발급)와
 * 라우트 보호(`src/proxy.ts`)가 자동으로 따라온다.
 *
 * 저장 위치는 **쿠키**다. 이유와 보안 트레이드오프는 {@link file://./auth-cookie.ts} 참고.
 */

import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
} from "./auth-cookie";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const entry = document.cookie.split("; ").find((c) => c.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
}

function writeCookie(name: string, value: string, maxAge: number): void {
  if (typeof document === "undefined") return;
  // SameSite=Lax: 외부 사이트에서 넘어온 요청에는 실리지 않아 CSRF 표면을 줄인다(일반 링크 이동은 허용).
  // Secure 는 https 에서만 — localhost(http) 개발을 막지 않기 위함.
  const secure =
    typeof location !== "undefined" && location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax${secure}`;
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

/** 서버(RSC/proxy)에서는 항상 null — 그쪽은 `cookies()` 또는 `request.cookies` 로 직접 읽는다. */
export function getAccessToken(): string | null {
  return readCookie(ACCESS_TOKEN_COOKIE);
}

export function getRefreshToken(): string | null {
  return readCookie(REFRESH_TOKEN_COOKIE);
}

/** 로그인·소셜로그인·재발급 성공 시 호출. 이후 모든 요청에 자동으로 토큰이 실린다. */
/**
 * 토큰 변화 구독 — 로그인/로그아웃 시 화면(헤더·액션 게이팅)이 따라오게 한다.
 * `useSyncExternalStore` 규약에 맞춰 구독 해제 함수를 돌려준다.
 */
const tokenListeners = new Set<() => void>();

export function onTokensChanged(listener: () => void): () => void {
  tokenListeners.add(listener);
  return () => tokenListeners.delete(listener);
}

function notifyTokensChanged(): void {
  tokenListeners.forEach((listener) => listener());
}

export function setTokens(tokens: AuthTokens): void {
  writeCookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, ACCESS_TOKEN_MAX_AGE);
  writeCookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, REFRESH_TOKEN_MAX_AGE);
  notifyTokensChanged();
}

/** 로그아웃 시 호출. proxy 도 같은 쿠키를 보므로 보호 라우트 접근이 즉시 막힌다. */
export function clearTokens(): void {
  deleteCookie(ACCESS_TOKEN_COOKIE);
  deleteCookie(REFRESH_TOKEN_COOKIE);
  notifyTokensChanged();
}

type SessionExpiredHandler = () => void;

const sessionExpiredHandlers = new Set<SessionExpiredHandler>();

/**
 * 세션 만료(재발급까지 실패) 구독. 인증 담당 코드가 여기에 로그인 모달 오픈/리다이렉트를 붙인다.
 * 반환값을 호출하면 구독 해제(useEffect cleanup 용).
 */
export function onSessionExpired(handler: SessionExpiredHandler): () => void {
  sessionExpiredHandlers.add(handler);
  return () => sessionExpiredHandlers.delete(handler);
}

/** 인터셉터 전용 — 토큰을 비우고 구독자에게 만료를 알린다. */
export function notifySessionExpired(): void {
  clearTokens();
  for (const handler of sessionExpiredHandlers) handler();
}

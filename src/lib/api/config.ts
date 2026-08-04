/**
 * API 접속 설정 — baseURL 을 어디로 잡을지 한 곳에서 결정한다.
 *
 * 브라우저에서는 **상대경로**(`/api/v1`)를 쓴다. `next.config.ts` 의 rewrites 가 이를 BE 로
 * 프록시하므로 CORS 설정 없이 동일 출처로 호출되고, MSW 목 핸들러도 같은 경로로 가로챌 수 있다.
 * 서버(RSC/route handler)에서는 상대경로를 해석할 수 없어 절대 URL 을 쓴다.
 */

/** BE 오리진. 배포 환경마다 다르면 `NEXT_PUBLIC_API_ORIGIN` 으로 덮어쓴다. */
export const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN ?? "https://api.promsearch.kr";

/** 모든 엔드포인트 공통 prefix (Swagger 기준 `/api/v1/...`) */
export const API_PREFIX = "/api/v1";

/** 요청 타임아웃(ms). 이미지 업로드처럼 오래 걸리는 요청은 호출부에서 개별 지정한다. */
export const API_TIMEOUT_MS = 15_000;

/** 토큰 재발급 엔드포인트 — 401 인터셉터가 이 경로만 예외 처리한다(무한 루프 방지). */
export const REISSUE_PATH = "/auth/reissue";

/** 인증 없이 호출되는 경로들. 401 이 나도 재발급을 시도하지 않는다. */
export const PUBLIC_AUTH_PATHS = ["/auth/login", "/auth/signup", "/auth/oauth", REISSUE_PATH];

export function resolveBaseURL(): string {
  if (typeof window !== "undefined") return API_PREFIX;
  return `${API_ORIGIN}${API_PREFIX}`;
}

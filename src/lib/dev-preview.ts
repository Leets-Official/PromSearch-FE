/**
 * Dev 프리뷰 상태 — 디자이너/기획자가 배포 URL에서 화면 상태를 직접 갈아끼우는 툴바의 단일 소스.
 *
 * 이 모듈은 **프레임워크/DOM 비의존**(순수 타입 + 파서 + 쿠키 직렬화)이라 서버(RSC)·클라이언트·MSW
 * 어디서든 import 할 수 있다. React 컨텍스트는 {@link file://./../components/dev-toolbar} 참고.
 *
 * 동작 원칙:
 * - 상태는 쿠키(`ps_dev_preview`)에 저장 → 서버 컴포넌트가 읽어 첫 렌더를 시드(hydration 불일치·플래시 없음).
 * - `NEXT_PUBLIC_DEV_TOOLBAR=enabled` 일 때만 활성(프리뷰/dev). 프로덕션에선 완전히 꺼진다.
 * - 실제 auth/BE 가 붙으면 이 파일과 툴바를 통째로 삭제하면 앱 로직엔 흔적이 남지 않는다(이음새만 사용).
 */

/** 툴바 게이트. Vercel Preview 환경 변수로 켜고, Production 에선 끈다(=정적 유지). */
export const DEV_TOOLBAR_ENABLED = process.env.NEXT_PUBLIC_DEV_TOOLBAR === "enabled";

/** 인증 축 — UserStatus 와 1:1 (비로그인/로그인). 프리미엄 잠금은 tier 로 갈리므로 딥링크로 체험. */
export type DevAuth = "anonymous" | "authenticated";
/** 상세 본문 길이 — 설명·레시피·댓글 탭 sticky 고정을 스크롤 유무로 확인 */
export type DevContent = "default" | "short" | "long";
/** 데이터 엣지 상태 — 목록/상세에서 강제 노출 */
export type DevEdge = "normal" | "empty" | "loading" | "error";

export type DevPreview = {
  auth: DevAuth;
  content: DevContent;
  edge: DevEdge;
};

export const DEV_PREVIEW_DEFAULT: DevPreview = {
  auth: "anonymous",
  content: "default",
  edge: "normal",
};

/** 상태 저장 쿠키명(서버 시드 + 클라 지속) */
export const DEV_PREVIEW_COOKIE = "ps_dev_preview";
/** 공유 URL 파라미터명(?dev=...) */
export const DEV_PREVIEW_PARAM = "dev";
/** 콘텐츠 길이 → MSW 전달 헤더(목 전용) */
export const DEV_CONTENT_HEADER = "x-dev-content";
/** 엣지 상태 → MSW 전달 헤더(목 전용) */
export const DEV_EDGE_HEADER = "x-dev-edge";

const AUTH_VALUES: readonly DevAuth[] = ["anonymous", "authenticated"];
const CONTENT_VALUES: readonly DevContent[] = ["default", "short", "long"];
const EDGE_VALUES: readonly DevEdge[] = ["normal", "empty", "loading", "error"];

function coerce<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/**
 * 직렬화 문자열(쿠키/URL) → DevPreview. 잘못된/누락 값은 필드별 기본값으로 방어적 폴백.
 * 포맷은 `auth.content.edge`(위치 기반) — 세 축의 값 집합이 서로 겹치지 않아 순서만으로 파싱된다.
 */
export function parseDevPreview(raw: string | undefined | null): DevPreview {
  if (!raw) return DEV_PREVIEW_DEFAULT;
  const [auth, content, edge] = raw.split(".");
  return {
    auth: coerce(auth, AUTH_VALUES, DEV_PREVIEW_DEFAULT.auth),
    content: coerce(content, CONTENT_VALUES, DEV_PREVIEW_DEFAULT.content),
    edge: coerce(edge, EDGE_VALUES, DEV_PREVIEW_DEFAULT.edge),
  };
}

/**
 * DevPreview → 쿠키/URL 공용 문자열. `authenticated.long.error` 처럼 짧고 읽기 쉬우며,
 * 모두 URL-safe 문자라 URLSearchParams 가 재인코딩하지 않는다(주소창이 깔끔).
 */
export function serializeDevPreview(value: DevPreview): string {
  return `${value.auth}.${value.content}.${value.edge}`;
}

/** 기본값과 동일한가(= 오버라이드 없음). URL 파라미터를 생략해 주소를 깔끔히 유지할 때 사용. */
export function isDefaultDevPreview(value: DevPreview): boolean {
  return (
    value.auth === DEV_PREVIEW_DEFAULT.auth &&
    value.content === DEV_PREVIEW_DEFAULT.content &&
    value.edge === DEV_PREVIEW_DEFAULT.edge
  );
}

/** 클라이언트: 현재 쿠키에서 프리뷰 상태를 읽는다(SSR 환경에선 기본값). */
export function readDevPreviewCookie(): DevPreview {
  if (typeof document === "undefined") return DEV_PREVIEW_DEFAULT;
  const entry = document.cookie.split("; ").find((c) => c.startsWith(`${DEV_PREVIEW_COOKIE}=`));
  return parseDevPreview(entry?.slice(DEV_PREVIEW_COOKIE.length + 1));
}

/** 클라이언트: 프리뷰 상태를 쿠키에 기록(30일, path=/). */
export function writeDevPreviewCookie(value: DevPreview): void {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 30;
  document.cookie = `${DEV_PREVIEW_COOKIE}=${serializeDevPreview(value)}; path=/; max-age=${maxAge}; samesite=lax`;
}

/**
 * 현재 dev 엣지 상태(클라 쿠키 기준). 강제 에러 시 React Query 재시도를 꺼
 * 즉시 에러가 반영되도록 하는 데 쓴다(툴바 꺼져 있으면 항상 normal).
 */
export function currentDevEdge(): DevEdge {
  if (!DEV_TOOLBAR_ENABLED) return "normal";
  return readDevPreviewCookie().edge;
}

/**
 * 클라이언트 fetch 에 실을 dev 헤더(콘텐츠 길이·엣지). MSW 목이 이를 읽어 응답을 바꾼다.
 * 툴바가 꺼져 있거나 기본 상태면 빈 객체(실서버 호출에 흔적 없음).
 */
export function devPreviewFetchHeaders(): Record<string, string> {
  if (!DEV_TOOLBAR_ENABLED) return {};
  const p = readDevPreviewCookie();
  const headers: Record<string, string> = {};
  if (p.content !== "default") headers[DEV_CONTENT_HEADER] = p.content;
  if (p.edge !== "normal") headers[DEV_EDGE_HEADER] = p.edge;
  return headers;
}

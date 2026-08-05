/** 어드민 표 표시 포맷터. */

/** 1200 → "1,200" */
export function formatCount(value: number): string {
  return value.toLocaleString("ko-KR");
}

/**
 * ISO 문자열 → "2026.07.23" (시안 신청일자 형식).
 * 로컬 타임존을 타면 SSR/클라 결과가 갈릴 수 있어 UTC 기준으로 자른다.
 */
export function formatAdminDate(iso: string): string {
  return iso.slice(0, 10).replaceAll("-", ".");
}

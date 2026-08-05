/**
 * 서버 응답의 숫자 정규화.
 *
 * ⚠️ **BE 가 모든 숫자를 문자열로 내려준다**(`{"tagId":"1","totalElements":"0"}`).
 * 확인 내역은 [docs/be-blockers.md](../../../docs/be-blockers.md) 2번 참고.
 *
 * 자바스크립트에서 `+` 는 숫자 덧셈이자 문자열 연결이라 조용히 틀린 값이 된다.
 *
 * ```
 * "0" + 1    // "01"   ← 페이지 번호가 깨진다
 * "32" + 1   // "321"  ← 좋아요 수가 321이 된다
 * "128" / 6  // 21.33  ← 나눗셈은 우연히 맞아서 더 헷갈린다
 * ```
 *
 * 그래서 **응답에서 꺼낸 숫자는 반드시 이 함수를 통과시킨다.**
 * BE 가 숫자로 고쳐 보내도 그대로 동작하므로, 고쳐진 뒤에도 지울 필요는 없다
 * (문자열이 다시 섞여 들어와도 안전하다).
 */
export function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

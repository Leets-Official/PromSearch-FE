/**
 * 잠금 해제 · 복사 기록 API.
 *
 * - `[COMMERCE-001] POST /prompts/{promptId}/unlock` — 포인트로 본문 열람
 * - `[PROMPT-013]   POST /prompts/{promptId}/copies` — 복사 수 증가
 */

import { api, toNumber } from "@/lib/api";

import type { ApiCopyResult } from "./dto";

/**
 * 프리미엄 프롬프트 잠금 해제.
 *
 * **응답이 없다(Void).** 성공하면 화면은 상세를 다시 조회해 열린 본문을 받아야 한다.
 * MVP 정책상 실제 차감 포인트는 0이다(유료 상태만 유지).
 */
export function unlockPrompt(id: string): Promise<void> {
  return api.post(`/prompts/${id}/unlock`);
}

/** 본문 복사 기록. 서버가 확정한 누적 복사 수를 돌려준다. */
export async function recordCopy(id: string): Promise<number> {
  const result = await api.post<ApiCopyResult>(`/prompts/${id}/copies`);
  return toNumber(result.copyCount);
}

/**
 * 프롬프트 상세 API.
 *
 * 현재는 MSW 목(`GET /api/prompts/:id`)을 호출한다. BE 스펙 확정 시 응답 매핑만 교체한다.
 *
 * 뷰어(인증) 상태는 목이 잠금(access)을 계산하는 데 필요해 헤더로 실어 보낸다.
 * 실제 BE 는 세션으로 판정하므로, 교체 시 이 헤더만 제거하면 된다(목 전용).
 */

import type { UserStatus } from "@/analytics/events";
import type { PromptDetail } from "@/features/prompt-detail/types";

/** 목 전용: 뷰어 인증 상태 전달 헤더(BE 전환 시 제거) */
export const MOCK_VIEWER_HEADER = "x-mock-user-status";

export class PromptNotFoundError extends Error {
  constructor(id: string) {
    super(`프롬프트를 찾을 수 없습니다: ${id}`);
    this.name = "PromptNotFoundError";
  }
}

export async function fetchPromptDetail(
  id: string,
  viewerStatus: UserStatus,
): Promise<PromptDetail> {
  const res = await fetch(`/api/prompts/${id}`, {
    headers: { [MOCK_VIEWER_HEADER]: viewerStatus },
  });

  if (res.status === 404) {
    throw new PromptNotFoundError(id);
  }
  if (!res.ok) {
    throw new Error(`프롬프트 상세 조회 실패: ${res.status}`);
  }

  return (await res.json()) as PromptDetail;
}

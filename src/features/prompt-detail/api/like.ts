/**
 * 추천(좋아요) 토글 API.
 *
 * 현재는 MSW 목(`POST /api/prompts/:id/like`)을 호출한다. 서버가 토글된 상태를 돌려주고,
 * 프론트는 낙관적 갱신 후 이 응답으로 확정한다(실패 시 롤백).
 */

import type { LikeToggleResponse } from "@/features/prompt-detail/types";

export async function toggleLike(id: string): Promise<LikeToggleResponse> {
  const res = await fetch(`/api/prompts/${id}/like`, { method: "POST" });

  if (!res.ok) {
    throw new Error(`추천 토글 실패: ${res.status}`);
  }

  return (await res.json()) as LikeToggleResponse;
}

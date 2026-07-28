/**
 * 북마크(저장) 토글 API.
 *
 * 현재는 MSW 목(`POST /api/prompts/:id/bookmark`)을 호출한다. 서버가 토글된 상태를 돌려주고,
 * 프론트는 낙관적 갱신 후 이 응답으로 확정한다(실패 시 롤백).
 */

import type { BookmarkToggleResponse } from "@/features/prompt-detail/types";

export async function toggleBookmark(id: string): Promise<BookmarkToggleResponse> {
  const res = await fetch(`/api/prompts/${id}/bookmark`, { method: "POST" });

  if (!res.ok) {
    throw new Error(`북마크 토글 실패: ${res.status}`);
  }

  return (await res.json()) as BookmarkToggleResponse;
}

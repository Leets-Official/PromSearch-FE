/**
 * 상세 댓글 API(표시 전용).
 *
 * 현재는 MSW 목(`GET /api/prompts/:id/comments`)을 호출한다. 작성/삭제/신고는 후속 범위.
 */

import type { PromptComment } from "@/features/prompt-detail/types";
import { devPreviewFetchHeaders } from "@/lib/dev-preview";

export async function fetchComments(id: string): Promise<PromptComment[]> {
  const res = await fetch(`/api/prompts/${id}/comments`, {
    headers: devPreviewFetchHeaders(),
  });

  if (!res.ok) {
    throw new Error(`댓글 조회 실패: ${res.status}`);
  }

  return (await res.json()) as PromptComment[];
}

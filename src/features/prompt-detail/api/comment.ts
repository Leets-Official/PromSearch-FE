/**
 * 상세 댓글 API(표시 전용).
 *
 * 현재는 MSW 목(`GET /api/prompts/:id/comments`)을 호출한다. 작성/삭제/신고는 후속 범위.
 */

import type { PromptComment } from "@/features/prompt-detail/types";
import { devPreviewFetchHeaders } from "@/lib/dev-preview";

/**
 * 응답 본문 → 댓글 배열.
 *
 * 목은 배열을 그대로 주지만, 실서버/프록시는 `{ data: [...] }`·`{ content: [...] }` 같은
 * 봉투(envelope)로 감싸 준다. 어떤 형태가 오든 **항상 배열**을 반환해 렌더가 깨지지 않게 한다
 * (배열이 아닌 값이 그대로 흘러 `comments.map is not a function` 이 나던 문제).
 */
function toCommentList(payload: unknown): PromptComment[] {
  if (Array.isArray(payload)) return payload as PromptComment[];
  if (payload && typeof payload === "object") {
    for (const key of ["data", "items", "content", "comments"] as const) {
      const nested = (payload as Record<string, unknown>)[key];
      if (Array.isArray(nested)) return nested as PromptComment[];
      // { data: { content: [...] } } 처럼 한 겹 더 감싼 형태
      if (nested && typeof nested === "object") {
        const deep = toCommentList(nested);
        if (deep.length > 0) return deep;
      }
    }
  }
  return [];
}

export async function fetchComments(id: string): Promise<PromptComment[]> {
  const res = await fetch(`/api/prompts/${id}/comments`, {
    headers: devPreviewFetchHeaders(),
  });

  if (!res.ok) {
    throw new Error(`댓글 조회 실패: ${res.status}`);
  }

  return toCommentList(await res.json());
}

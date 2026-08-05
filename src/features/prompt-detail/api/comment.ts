/**
 * 댓글 API — `[COMMENT-001~006]`.
 *
 * 서버 구조상 **최상위 댓글과 대댓글이 분리**돼 있다.
 * - 최상위: `GET /prompts/{promptId}/comments` — 작성 시각 **내림차순**(최신 먼저) 커서 페이지
 * - 대댓글: `GET /comments/{commentId}/replies` — 작성 시각 **오름차순** 커서 페이지
 *
 * 최상위 응답은 대댓글 목록 대신 `replyCount` 만 주므로, 스레드를 펼칠 때 따로 조회한다.
 * 답글의 답글은 만들 수 없다(1-depth).
 */

import { api } from "@/lib/api";

import type { ApiComment, ApiCommentList, ApiReplyList } from "./dto";
import { toCommentPage, toPromptComment, toReplyPage } from "./map";
import type { CommentPage, PromptComment } from "../types";

/** 한 번에 가져올 댓글/대댓글 수 */
export const COMMENT_PAGE_SIZE = 20;

type CursorParams = { cursor?: number | null; size?: number };

function toQuery({ cursor, size = COMMENT_PAGE_SIZE }: CursorParams) {
  // cursor 가 없으면(첫 페이지) 키 자체를 빼야 한다 — axios 는 undefined 를 생략한다.
  return { params: { cursor: cursor ?? undefined, size } };
}

/** [COMMENT-001] 최상위 댓글 목록 */
export async function fetchComments(
  promptId: string,
  params: CursorParams = {},
): Promise<CommentPage> {
  const result = await api.get<ApiCommentList>(`/prompts/${promptId}/comments`, toQuery(params));
  return toCommentPage(result);
}

/** [COMMENT-006] 특정 댓글의 대댓글 목록 */
export async function fetchReplies(
  commentId: string,
  params: CursorParams = {},
): Promise<CommentPage> {
  const result = await api.get<ApiReplyList>(`/comments/${commentId}/replies`, toQuery(params));
  return toReplyPage(result);
}

/** [COMMENT-002] 최상위 댓글 작성 */
export async function createComment(promptId: string, content: string): Promise<PromptComment> {
  const result = await api.post<ApiComment>(`/prompts/${promptId}/comments`, { content });
  return toPromptComment(result);
}

/** [COMMENT-005] 대댓글 작성 */
export async function createReply(commentId: string, content: string): Promise<PromptComment> {
  const result = await api.post<ApiComment>(`/comments/${commentId}/replies`, { content });
  return toPromptComment(result);
}

/** [COMMENT-003] 댓글 수정(본인만) */
export async function updateComment(commentId: string, content: string): Promise<PromptComment> {
  const result = await api.patch<ApiComment>(`/comments/${commentId}`, { content });
  return toPromptComment(result);
}

/** [COMMENT-004] 댓글 삭제(본인만, 논리 삭제) */
export function deleteComment(commentId: string): Promise<void> {
  return api.delete(`/comments/${commentId}`);
}

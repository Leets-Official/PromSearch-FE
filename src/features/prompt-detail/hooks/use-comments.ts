"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { fetchComments, fetchReplies } from "@/features/prompt-detail/api/comment";
import type { CommentPage } from "@/features/prompt-detail/types";

export const commentsKey = (promptId: string) => ["prompt", promptId, "comments"] as const;
export const repliesKey = (commentId: string) => ["comment", commentId, "replies"] as const;

/**
 * 최상위 댓글 목록(커서 페이지네이션).
 *
 * 서버가 한 번에 20개씩 최신순으로 주고 `nextCursor` 로 이어받는다. 화면은 `pages` 를 펼쳐
 * 하나의 리스트로 렌더하고, `hasNextPage` 면 "댓글 더 보기"를 노출한다.
 */
export function useComments(promptId: string) {
  return useInfiniteQuery({
    queryKey: commentsKey(promptId),
    queryFn: ({ pageParam }) => fetchComments(promptId, { cursor: pageParam }),
    initialPageParam: null as number | null,
    getNextPageParam: (last: CommentPage) => (last.hasNext ? last.nextCursor : undefined),
    select: (data) => ({
      comments: data.pages.flatMap((page) => page.comments),
    }),
  });
}

/**
 * 특정 댓글의 대댓글 목록.
 *
 * 최상위 응답에는 `replyCount` 만 오므로 **스레드를 펼칠 때** 비로소 조회한다
 * (`enabled`). 접었다 펴도 캐시가 남아 재요청하지 않는다.
 *
 * 대댓글은 보통 몇 개뿐이라 첫 페이지만 가져온다. 20개를 넘는 스레드가 나오면
 * 최상위와 같은 무한 스크롤로 바꾼다.
 */
export function useCommentReplies(commentId: string, enabled: boolean) {
  return useQuery({
    queryKey: repliesKey(commentId),
    queryFn: () => fetchReplies(commentId),
    enabled,
  });
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createComment,
  createReply,
  deleteComment,
  updateComment,
} from "@/features/prompt-detail/api/comment";

import { commentsKey, repliesKey } from "./use-comments";

// (repliesKey 는 대댓글 작성 시 해당 스레드만 정확히 무효화하는 데 쓴다)

/**
 * 댓글 작성/수정/삭제.
 *
 * 낙관적 갱신은 하지 않는다. 커서 페이지네이션 캐시(`pages` 배열)에 새 항목을 끼워 넣으면
 * 다음 페이지 커서와 어긋나 중복·누락이 생기기 쉬워서, **성공 후 무효화**로 서버 정렬을 그대로 받는다.
 * 댓글은 좋아요와 달리 연타 대상이 아니라 한 번의 왕복 지연이 문제되지 않는다.
 *
 * 무효화 범위
 * - 최상위 작성/수정/삭제 → 댓글 목록
 * - 대댓글 작성 → 해당 스레드 + 댓글 목록(replyCount 가 바뀐다)
 * - 작성/삭제 → 상세(commentCount 가 바뀐다)
 */
export function useCommentMutations(promptId: string) {
  const qc = useQueryClient();

  const invalidateComments = () => qc.invalidateQueries({ queryKey: commentsKey(promptId) });
  // 뷰어 상태 축과 무관하게 같은 프롬프트의 상세 캐시를 모두 잡는다.
  const invalidateDetail = () => qc.invalidateQueries({ queryKey: ["prompt", promptId] });

  const create = useMutation({
    mutationFn: (content: string) => createComment(promptId, content),
    onSuccess: async () => {
      await Promise.all([invalidateComments(), invalidateDetail()]);
    },
  });

  const reply = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      createReply(commentId, content),
    onSuccess: async (_data, { commentId }) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: repliesKey(commentId) }),
        invalidateComments(),
        invalidateDetail(),
      ]);
    },
  });

  // 수정·삭제 대상이 최상위인지 대댓글인지 호출부가 구분해 넘기지 않아도 되도록,
  // 열려 있는 스레드 캐시를 통째로 무효화한다(펼친 스레드만 캐시에 있어 몇 개 안 된다).
  const invalidateAllReplies = () => qc.invalidateQueries({ queryKey: ["comment"] });

  const update = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      updateComment(commentId, content),
    onSuccess: async () => {
      await Promise.all([invalidateComments(), invalidateAllReplies()]);
    },
  });

  const remove = useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: async () => {
      await Promise.all([invalidateComments(), invalidateAllReplies(), invalidateDetail()]);
    },
  });

  return { create, reply, update, remove };
}

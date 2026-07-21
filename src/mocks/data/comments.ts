/**
 * 상세 댓글 목 시드(표시 전용).
 *
 * 피그마(499:2806) 재현: 최상위 댓글(작성자 배지) → 대댓글 목록에 일반/블라인드 혼합.
 * 이번 범위는 표시 전용이라 작성/삭제 없이 결정적 트리만 만든다.
 */

import type { PromptComment } from "@/features/prompt-detail/types";

/** 댓글 트리를 평탄화한 총 개수(블라인드 포함) */
export function countComments(comments: PromptComment[]): number {
  return comments.reduce((sum, c) => sum + 1 + countComments(c.replies), 0);
}

/** id 기준 결정적 댓글 트리 */
export function buildComments(promptId: string): PromptComment[] {
  return [
    {
      id: `${promptId}-c1`,
      author: { name: "악플러" },
      body: "근데 그럼 댓글 기능이 추가되면 댓글 신고 관리도 추가하게 되겠네요?",
      createdAt: "2026-07-12T00:00:00.000Z",
      isAuthor: true,
      isBlinded: false,
      replies: [
        {
          id: `${promptId}-c1-r1`,
          author: { name: "악플러222" },
          body: "대댓글도 달 수 있어요",
          createdAt: "2026-07-12T01:00:00.000Z",
          isAuthor: false,
          isBlinded: false,
          replies: [],
        },
        {
          id: `${promptId}-c1-r2`,
          author: { name: "" },
          body: "",
          createdAt: "2026-07-12T02:00:00.000Z",
          isAuthor: false,
          isBlinded: true,
          replies: [],
        },
        {
          id: `${promptId}-c1-r3`,
          author: { name: "악플러222" },
          body: "대댓글도 달 수 있어요",
          createdAt: "2026-07-12T03:00:00.000Z",
          isAuthor: false,
          isBlinded: false,
          replies: [],
        },
      ],
    },
    {
      id: `${promptId}-c2`,
      author: { name: "지나가던행인" },
      body: "이 프롬프트 잘 쓰고 있어요. 감사합니다!",
      createdAt: "2026-07-13T00:00:00.000Z",
      isAuthor: false,
      isBlinded: false,
      replies: [],
    },
  ];
}

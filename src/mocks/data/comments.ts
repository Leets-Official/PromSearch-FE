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
    {
      id: `${promptId}-c3`,
      author: { name: "직장인A" },
      body: "보고서 초안 잡는 시간이 확 줄었어요. 특히 목차 구성이 깔끔하네요.",
      createdAt: "2026-07-13T05:00:00.000Z",
      isAuthor: false,
      isBlinded: false,
      replies: [],
    },
    {
      id: `${promptId}-c4`,
      author: { name: "기획자B" },
      body: "입력값만 바꾸면 다양한 결과가 나와서 좋네요. 감사합니다!",
      createdAt: "2026-07-14T00:00:00.000Z",
      isAuthor: false,
      isBlinded: false,
      replies: [],
    },
    {
      id: `${promptId}-c5`,
      author: { name: "학생C" },
      body: "과제에 잘 활용했어요. 예시가 있어서 이해하기 쉬웠습니다.",
      createdAt: "2026-07-14T09:00:00.000Z",
      isAuthor: false,
      isBlinded: false,
      replies: [],
    },
    {
      id: `${promptId}-c6`,
      author: { name: "디자이너D" },
      body: "결과물 퀄리티가 좋아서 다른 프롬프트도 찾아보게 되네요.",
      createdAt: "2026-07-15T00:00:00.000Z",
      isAuthor: false,
      isBlinded: false,
      replies: [],
    },
  ];
}

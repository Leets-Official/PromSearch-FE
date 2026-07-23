import type { PromptComment, PromptDetail } from "@/features/prompt-detail/types";

/** 테스트용 상세 팩토리 — 필요한 필드만 덮어쓴다 */
export function makeDetail(overrides: Partial<PromptDetail> = {}): PromptDetail {
  return {
    id: "prompt-001",
    title: "보고서 초안 작성 프롬프트",
    description: "요약 설명",
    outputType: "text",
    model: "chatgpt",
    tasks: ["document"],
    jobCategories: ["student", "worker"],
    tier: "free",
    author: { name: "전업프롬프트업로더" },
    stats: { views: 123, copies: 0, likes: 123 },
    createdAt: "2026-07-12T00:00:00.000Z",
    images: ["a.png", "b.png", "c.png"],
    descriptionBody: "이 프롬프트는 보고서 초안을 대신 작성해줍니다.",
    recipeBody: "레시피 전문",
    access: { locked: false, reason: null },
    liked: false,
    bookmarked: false,
    commentCount: 2,
    ...overrides,
  };
}

/** 테스트용 댓글 팩토리 */
export function makeComment(overrides: Partial<PromptComment> = {}): PromptComment {
  return {
    id: "c1",
    author: { name: "악플러" },
    body: "댓글 내용",
    createdAt: "2026-07-12T00:00:00.000Z",
    isAuthor: false,
    isBlinded: false,
    replies: [],
    ...overrides,
  };
}

import { describe, expect, it } from "vitest";

import { fetchComments } from "@/features/prompt-detail/api/comment";
import { toggleLike } from "@/features/prompt-detail/api/like";
import { fetchPromptDetail, PromptNotFoundError } from "@/features/prompt-detail/api/prompt-detail";

// 시드 규칙(mocks/data/prompts): id 인덱스로 tier/status 가 순환한다.
// prompt-001 → free/active, prompt-002 → premium/active, prompt-005 → hidden, prompt-006 → draft
describe("fetchPromptDetail (MSW 목 연동)", () => {
  it("로그인 + free → 잠금 해제 + 전문·다중 이미지·댓글 수", async () => {
    const detail = await fetchPromptDetail("prompt-001", "authenticated");

    expect(detail.id).toBe("prompt-001");
    expect(detail.access).toEqual({ locked: false, reason: null });
    expect(detail.recipeBody.length).toBeGreaterThan(0);
    expect(detail.images.length).toBeGreaterThanOrEqual(1);
    expect(detail.commentCount).toBeGreaterThan(0);
  });

  it("비로그인 → anonymous 잠금 + recipeBody 미전송", async () => {
    const detail = await fetchPromptDetail("prompt-001", "anonymous");

    expect(detail.access).toEqual({ locked: true, reason: "anonymous" });
    expect(detail.recipeBody).toBe("");
  });

  it("로그인 + premium → premium 잠금 + 프리뷰만", async () => {
    const detail = await fetchPromptDetail("prompt-002", "authenticated");

    expect(detail.access!.locked).toBe(true);
    expect(detail.access!.reason).toBe("premium");
    expect(detail.recipeBody.length).toBe(detail.access!.previewLength);
  });

  it("hidden 게시글은 404 → PromptNotFoundError", async () => {
    await expect(fetchPromptDetail("prompt-005", "authenticated")).rejects.toBeInstanceOf(
      PromptNotFoundError,
    );
  });

  it("없는 id 는 404 → PromptNotFoundError", async () => {
    await expect(fetchPromptDetail("nope", "authenticated")).rejects.toBeInstanceOf(
      PromptNotFoundError,
    );
  });
});

describe("fetchComments (MSW 목 연동)", () => {
  it("댓글 트리를 받고, 블라인드/대댓글/작성자 배지를 포함한다", async () => {
    const comments = await fetchComments("prompt-001");

    expect(comments.length).toBeGreaterThan(0);
    expect(comments.some((c) => c.isAuthor)).toBe(true);

    const replies = comments.flatMap((c) => c.replies);
    expect(replies.length).toBeGreaterThan(0);
    expect(replies.some((r) => r.isBlinded)).toBe(true);
  });
});

describe("toggleLike (MSW 목 연동)", () => {
  it("연속 호출로 추천 상태가 토글되고 카운트가 함께 증감한다", async () => {
    const first = await toggleLike("prompt-010");
    expect(first.liked).toBe(true);

    const second = await toggleLike("prompt-010");
    expect(second.liked).toBe(false);
    expect(second.likeCount).toBe(first.likeCount - 1);
  });
});

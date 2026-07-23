import { describe, expect, it } from "vitest";

import { DEFAULT_PREVIEW_LENGTH } from "@/features/prompt-detail/access";
import type { PromptRecord } from "@/mocks/data/prompts";
import { buildRecipeBody, findPromptDetail } from "@/mocks/prompt-detail-query";

// 테스트용 레코드 팩토리 — 필요한 필드만 덮어쓰고 나머지는 안전한 기본값.
function record(overrides: Partial<PromptRecord> & { id: string }): PromptRecord {
  return {
    title: `제목 ${overrides.id}`,
    description: "설명",
    thumbnailUrl: undefined,
    outputType: "text",
    model: "chatgpt",
    modelEtcName: undefined,
    tasks: ["ppt"],
    jobCategories: ["student"],
    tier: "free",
    author: { name: "작성자" },
    stats: { views: 0, copies: 0, likes: 0 },
    createdAt: "2026-07-01T00:00:00.000Z",
    status: "active",
    ...overrides,
  };
}

describe("findPromptDetail", () => {
  it("없는 id 는 null(404)", () => {
    expect(findPromptDetail([record({ id: "a" })], "zzz", "authenticated")).toBeNull();
  });

  it("status !== active(hidden/draft) 는 null(404)", () => {
    const records = [record({ id: "h", status: "hidden" }), record({ id: "d", status: "draft" })];
    expect(findPromptDetail(records, "h", "authenticated")).toBeNull();
    expect(findPromptDetail(records, "d", "authenticated")).toBeNull();
  });

  it("active 상세를 PromptDetail 로 확장한다(이미지 다중·본문·commentCount)", () => {
    const detail = findPromptDetail([record({ id: "a", tier: "free" })], "a", "authenticated");
    expect(detail).not.toBeNull();
    expect(detail!.id).toBe("a");
    expect(detail!.images.length).toBeGreaterThanOrEqual(1);
    expect(detail!.descriptionBody).not.toBe("");
    expect(detail).not.toHaveProperty("status"); // 내부 필드 누출 방지
    expect(detail!.liked).toBe(false);
    expect(typeof detail!.commentCount).toBe("number");
  });

  it("비로그인 → anonymous 잠금 + 미리보기(previewLength)만 제공", () => {
    const rec = record({ id: "a", tier: "free" });
    const detail = findPromptDetail([rec], "a", "anonymous");
    expect(detail!.access).toEqual({
      locked: true,
      reason: "anonymous",
      previewLength: DEFAULT_PREVIEW_LENGTH,
    });
    expect(detail!.recipeBody).toBe(buildRecipeBody(rec).slice(0, DEFAULT_PREVIEW_LENGTH));
    expect(detail!.recipeBody.length).toBe(DEFAULT_PREVIEW_LENGTH);
  });

  it("로그인 + free → 열람 + 전문 제공", () => {
    const rec = record({ id: "a", tier: "free" });
    const detail = findPromptDetail([rec], "a", "authenticated");
    expect(detail!.access).toEqual({ locked: false, reason: null });
    expect(detail!.recipeBody).toBe(buildRecipeBody(rec));
  });

  it("로그인 + premium → premium 잠금 + recipeBody 전체 미전송(빈 문자열)", () => {
    const rec = record({ id: "a", tier: "premium" });
    const detail = findPromptDetail([rec], "a", "authenticated");
    expect(detail!.access).toEqual({ locked: true, reason: "premium" });
    expect(detail!.recipeBody).toBe("");
  });
});

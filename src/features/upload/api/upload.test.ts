import { describe, expect, it } from "vitest";

import { createPrompt, deleteDraft, fetchDraft, saveDraft } from "@/features/upload/api/upload";
import type { PromptFormValues } from "@/features/upload/types";

function values(overrides: Partial<PromptFormValues> = {}): PromptFormValues {
  return {
    title: "테스트 프롬프트",
    description: "설명",
    outputType: "text",
    jobCategories: ["worker"],
    tasks: ["report"],
    model: "chatgpt",
    modelEtcName: "",
    tier: "free",
    body: "본문",
    images: [],
    ...overrides,
  };
}

describe("createPrompt (MSW 목 연동)", () => {
  it("게시하면 새 프롬프트 id 를 받는다", async () => {
    const res = await createPrompt(values());
    // 서버는 숫자 promptId 를 준다 → 라우팅용 문자열로 변환해 돌려준다
    expect(res.id).toMatch(/^\d+$/);
  });
});

describe("임시저장 라운드트립 (MSW 목 연동)", () => {
  it("저장한 값을 조회하면 그대로 돌려주고 저장 시각이 붙는다", async () => {
    const saved = await saveDraft(values({ title: "임시저장 제목" }));
    expect(saved.title).toBe("임시저장 제목");
    expect(saved.updatedAt).toBeTruthy();

    const { draft } = await fetchDraft();
    expect(draft?.title).toBe("임시저장 제목");
  });

  it("삭제하면 draft 가 null 이 된다", async () => {
    await saveDraft(values());
    await deleteDraft();

    const { draft } = await fetchDraft();
    expect(draft).toBeNull();
  });
});

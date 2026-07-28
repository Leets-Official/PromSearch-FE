import { describe, expect, it } from "vitest";

import { promptFormSchema, TITLE_MAX } from "@/features/upload/schema";
import type { PromptFormValues } from "@/features/upload/types";

function values(overrides: Partial<PromptFormValues> = {}): PromptFormValues {
  return {
    title: "예시 제목",
    description: "",
    outputType: "text",
    jobCategories: [],
    tasks: [],
    models: [],
    modelEtcName: "",
    tier: "free",
    body: "프롬프트 본문",
    images: [],
    ...overrides,
  };
}

describe("promptFormSchema", () => {
  it("필수값이 채워지면 통과한다", () => {
    expect(promptFormSchema.safeParse(values()).success).toBe(true);
  });

  it("제목은 필수다", () => {
    expect(promptFormSchema.safeParse(values({ title: "" })).success).toBe(false);
    expect(promptFormSchema.safeParse(values({ title: "   " })).success).toBe(false);
  });

  it(`제목은 최대 ${TITLE_MAX}자까지 허용한다`, () => {
    expect(promptFormSchema.safeParse(values({ title: "가".repeat(TITLE_MAX) })).success).toBe(
      true,
    );
    expect(promptFormSchema.safeParse(values({ title: "가".repeat(TITLE_MAX + 1) })).success).toBe(
      false,
    );
  });

  it("결과물 타입은 필수(단일)다", () => {
    expect(promptFormSchema.safeParse(values({ outputType: null })).success).toBe(false);
  });

  it("프롬프트 본문은 필수다", () => {
    expect(promptFormSchema.safeParse(values({ body: "" })).success).toBe(false);
  });

  it("AI 모델에 기타(etc)가 있으면 모델명이 필요하다", () => {
    expect(promptFormSchema.safeParse(values({ models: ["etc"], modelEtcName: "" })).success).toBe(
      false,
    );
    expect(
      promptFormSchema.safeParse(values({ models: ["etc"], modelEtcName: "뤼튼" })).success,
    ).toBe(true);
  });

  it("직군/태스크/AI모델은 복수 선택을 허용한다", () => {
    const result = promptFormSchema.safeParse(
      values({
        jobCategories: ["worker", "planner"],
        tasks: ["ppt", "report"],
        models: ["chatgpt", "gemini"],
      }),
    );
    expect(result.success).toBe(true);
  });
});

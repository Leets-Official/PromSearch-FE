import { describe, expect, it } from "vitest";

import { promptFormSchema, TITLE_MAX } from "@/features/upload/schema";

// 유효한 전체 값(모든 필드 필수). 개별 케이스에서 override 로 특정 필드를 비워 실패를 검증한다.
// 잘못된 입력(undefined 등)도 넣어야 하므로 느슨한 타입으로 둔다.
function values(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    title: "예시 제목",
    description: "프롬프트 설명",
    outputType: "text",
    jobCategories: ["worker"],
    tasks: ["report"],
    model: "chatgpt",
    modelEtcName: "",
    tier: "free",
    body: "프롬프트 본문",
    images: [{ imageId: "img-1", status: "ready" }],
    ...overrides,
  };
}

describe("promptFormSchema", () => {
  it("모든 필드가 채워지면 통과한다", () => {
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

  it("프롬프트 설명은 필수다", () => {
    expect(promptFormSchema.safeParse(values({ description: "" })).success).toBe(false);
  });

  it("프롬프트 본문은 필수다", () => {
    expect(promptFormSchema.safeParse(values({ body: "" })).success).toBe(false);
  });

  it("결과물 타입은 필수(단일)다", () => {
    expect(promptFormSchema.safeParse(values({ outputType: undefined })).success).toBe(false);
  });

  it("AI 모델은 필수(단일)다", () => {
    expect(promptFormSchema.safeParse(values({ model: undefined })).success).toBe(false);
  });

  it("직군은 최소 1개 선택해야 한다", () => {
    expect(promptFormSchema.safeParse(values({ jobCategories: [] })).success).toBe(false);
  });

  it("태스크는 최소 1개 선택해야 한다", () => {
    expect(promptFormSchema.safeParse(values({ tasks: [] })).success).toBe(false);
  });

  it("결과물 이미지는 최소 1장 필요하다", () => {
    expect(promptFormSchema.safeParse(values({ images: [] })).success).toBe(false);
  });

  it("AI 모델로 기타(etc)를 고르면 모델명이 필요하다", () => {
    expect(promptFormSchema.safeParse(values({ model: "etc", modelEtcName: "" })).success).toBe(
      false,
    );
    expect(promptFormSchema.safeParse(values({ model: "etc", modelEtcName: "뤼튼" })).success).toBe(
      true,
    );
  });

  it("직군/태스크는 복수 선택을 허용한다", () => {
    const result = promptFormSchema.safeParse(
      values({ jobCategories: ["worker", "planner"], tasks: ["ppt", "report"] }),
    );
    expect(result.success).toBe(true);
  });
});

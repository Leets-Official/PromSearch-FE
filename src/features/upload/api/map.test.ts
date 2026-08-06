import { describe, expect, it } from "vitest";

import { toPromptDraft, toWriteRequest } from "@/features/upload/api/map";
import type { ApiDraftResult } from "@/features/upload/api/dto";
import type { PromptFormValues } from "@/features/upload/types";

function values(overrides: Partial<PromptFormValues> = {}): PromptFormValues {
  return {
    title: "테스트 프롬프트",
    description: "설명",
    outputType: "image",
    jobCategories: ["designer", "planner"],
    tasks: ["ppt", "report"],
    model: "chatgpt",
    modelEtcName: "",
    tier: "premium",
    body: "본문",
    images: [
      { imageId: "a", status: "ready" },
      { imageId: "b", status: "ready" },
    ],
    ...overrides,
  };
}

describe("toWriteRequest", () => {
  it("enum 을 BE 태그 ID·enum 으로 옮긴다", () => {
    const request = toWriteRequest(values());

    expect(request).toMatchObject({
      title: "테스트 프롬프트",
      outputType: "IMAGE",
      contentType: "PREMIUM",
      // 디자이너 5 · 기획자 4 / PPT 7 · 레포트 8 (BE 회신 태그 ID)
      jobTagIds: [5, 4],
      taskTagIds: [7, 8],
      aiModelTagId: 13,
      visibility: "PUBLIC",
    });
  });

  it("이미지는 순서를 sortOrder 로 굳히고 첫 장을 대표로 지정한다", () => {
    expect(toWriteRequest(values()).images).toEqual([
      { imageId: "a", sortOrder: 0, thumbnail: true },
      { imageId: "b", sortOrder: 1, thumbnail: false },
    ]);
  });

  /*
    임시저장은 스키마 검증을 거치지 않아 처리 중·실패 이미지가 그대로 실려 나갔다.
    그렇게 저장된 imageId 는 워터마크 결과물이 없어서, 복원 때 상태 조회를 통째로 실패시킨다.
  */
  it("READY 가 아닌 이미지는 요청에서 뺀다", () => {
    const request = toWriteRequest(
      values({
        images: [
          { imageId: "a", status: "ready" },
          { imageId: "b", status: "processing" },
          { imageId: "c", status: "failed" },
          { imageId: "d", status: "uploading" },
        ],
      }),
    );

    expect(request.images).toEqual([{ imageId: "a", sortOrder: 0, thumbnail: true }]);
  });

  it("걸러낸 뒤의 순서로 sortOrder·대표를 다시 매긴다", () => {
    const request = toWriteRequest(
      values({
        images: [
          // 첫 장이 실패했으므로 대표는 그다음 성공한 이미지가 되어야 한다
          { imageId: "a", status: "failed" },
          { imageId: "b", status: "ready" },
          { imageId: "c", status: "ready" },
        ],
      }),
    );

    expect(request.images).toEqual([
      { imageId: "b", sortOrder: 0, thumbnail: true },
      { imageId: "c", sortOrder: 1, thumbnail: false },
    ]);
  });

  // BE 가 단수 전환을 배포하기 전이라 양쪽 이름을 함께 보낸다(요청서 7-4)
  it("AI 모델 태그를 단수·복수 두 이름으로 함께 보낸다", () => {
    const request = toWriteRequest(values({ model: "claude" }));

    expect(request.aiModelTagId).toBe(15);
    expect(request.aiModelTagIds).toEqual([15]);
  });

  it("기타 모델은 태그를 빼고 customAiModel 로만 보낸다", () => {
    const request = toWriteRequest(values({ model: "etc", modelEtcName: " GPT 4.1 Mini " }));

    expect(request.aiModelTagId).toBeUndefined();
    expect(request.aiModelTagIds).toBeUndefined();
    expect(request.customAiModel).toBe("GPT 4.1 Mini");
  });

  it("임시저장처럼 값이 비어 있어도 요청을 만든다(제목 외 전부 생략 가능)", () => {
    const request = toWriteRequest({ title: "제목만" });

    expect(request.title).toBe("제목만");
    expect(request.outputType).toBeUndefined();
    expect(request.jobTagIds).toEqual([]);
    expect(request.images).toEqual([]);
  });
});

describe("toPromptDraft", () => {
  function draft(overrides: Partial<ApiDraftResult> = {}): ApiDraftResult {
    return {
      promptId: 1,
      title: "임시저장",
      description: "설명",
      outputType: "TEXT",
      jobTagIds: [2],
      taskTagIds: [11],
      aiModelTagId: 14,
      customAiModel: null,
      contentType: "FREE",
      promptBody: "본문",
      visibility: "PUBLIC",
      images: [
        { imageId: "b", sortOrder: 1, thumbnail: false },
        { imageId: "a", sortOrder: 0, thumbnail: true },
      ],
      status: "DRAFT",
      pricePoint: 0,
      updatedAt: "2026-08-05T10:00:00Z",
      ...overrides,
    };
  }

  it("태그 ID 를 폼 enum 으로 되돌린다", () => {
    expect(toPromptDraft(draft())).toMatchObject({
      outputType: "text",
      jobCategories: ["worker"],
      tasks: ["meeting_notes"],
      model: "gemini",
      tier: "free",
      body: "본문",
    });
  });

  /*
    초안 응답에는 상태가 없다. 이 값은 상태 조회(PROMPT-004)가 실패했을 때만 화면에 남으므로,
    확인하지 못한 이미지를 ready 라고 말하면 안 된다 — 깨진 이미지가 멀쩡한 얼굴로 복원된다.
  */
  it("이미지는 sortOrder 순으로 복원하고, 확인 전이므로 failed 로 둔다", () => {
    expect(toPromptDraft(draft()).images).toEqual([
      { imageId: "a", status: "failed" },
      { imageId: "b", status: "failed" },
    ]);
  });

  it("모델 태그 없이 customAiModel 만 있으면 기타로 복원한다", () => {
    const restored = toPromptDraft(
      draft({ aiModelTagId: undefined, customAiModel: "GPT 4.1 Mini" }),
    );

    expect(restored.model).toBe("etc");
    expect(restored.modelEtcName).toBe("GPT 4.1 Mini");
  });
});

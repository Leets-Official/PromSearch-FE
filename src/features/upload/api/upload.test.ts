import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/mocks/server";

import { createPrompt, deleteDraft, fetchDraft, saveDraft } from "@/features/upload/api/upload";
import type { PromptFormValues } from "@/features/upload/types";

function envelope<T>(result: T) {
  return HttpResponse.json({ success: true, code: "COMMON-200", message: "성공했습니다.", result });
}

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

describe("createPrompt", () => {
  it("게시하면 새 프롬프트 id 를 받는다", async () => {
    server.use(
      http.post("/api/v1/prompts", () =>
        envelope({
          promptId: 42,
          status: "ACTIVE",
          visibility: "PUBLIC",
          pricePoint: 0,
          updatedAt: "2026-08-05T10:00:00Z",
        }),
      ),
    );

    // 서버는 숫자 promptId 를 준다 → 라우팅용 문자열로 변환해 돌려준다
    await expect(createPrompt(values())).resolves.toEqual({ id: "42" });
  });
});

describe("임시저장", () => {
  it("저장하면 보낸 값에 서버 시각을 붙여 돌려준다", async () => {
    server.use(
      http.put("/api/v1/prompts/draft", () =>
        envelope({
          promptId: 1,
          status: "DRAFT",
          visibility: "PUBLIC",
          pricePoint: 0,
          updatedAt: "2026-08-05T10:00:00Z",
        }),
      ),
    );

    const saved = await saveDraft(values({ title: "임시저장 제목" }));

    expect(saved.title).toBe("임시저장 제목");
    expect(saved.updatedAt).toBe("2026-08-05T10:00:00Z");
  });

  // 초안이 없으면 서버가 404 를 준다 — 오류가 아니라 "없음"이라 화면이 에러로 빠지면 안 된다
  it("초안이 없으면(404) draft: null 로 정리한다", async () => {
    server.use(
      http.get("/api/v1/prompts/draft", () =>
        HttpResponse.json(
          { success: false, code: "COMMON-404", message: "임시저장이 없습니다." },
          { status: 404 },
        ),
      ),
    );

    await expect(fetchDraft()).resolves.toEqual({ draft: null });
  });

  it("삭제 요청을 보낸다", async () => {
    let called = false;
    server.use(
      http.delete("/api/v1/prompts/draft", () => {
        called = true;
        return envelope("삭제되었습니다.");
      }),
    );

    await deleteDraft();

    expect(called).toBe(true);
  });
});

describe("임시저장 이미지 미리보기 (요청서 U-1)", () => {
  it("초안 응답에 없는 imageUrl 을 상태 API 로 채운다", async () => {
    server.use(
      http.get("/api/v1/prompts/draft", () =>
        envelope({
          promptId: 1,
          title: "이미지가 있는 초안",
          images: [
            { imageId: "img-b", sortOrder: 1, thumbnail: false },
            { imageId: "img-a", sortOrder: 0, thumbnail: true },
          ],
          status: "DRAFT",
          pricePoint: 0,
          updatedAt: "2026-08-05T10:00:00Z",
        }),
      ),
      http.get("/api/v1/prompt-images/statuses", ({ request }) => {
        const ids = (new URL(request.url).searchParams.get("imageIds") ?? "").split(",");
        return envelope({
          images: ids.map((imageId) => ({
            imageId,
            status: "READY",
            failureCode: null,
            imageUrl: `https://cdn/${imageId}.jpg`,
          })),
        });
      }),
    );

    const { draft } = await fetchDraft();

    // sortOrder 순으로 복원되고 미리보기가 채워진다
    expect(draft?.images).toEqual([
      { imageId: "img-a", previewUrl: "https://cdn/img-a.jpg", status: "ready" },
      { imageId: "img-b", previewUrl: "https://cdn/img-b.jpg", status: "ready" },
    ]);
  });

  it("상태 조회가 실패해도 초안 복원 자체는 막지 않는다", async () => {
    server.use(
      http.get("/api/v1/prompts/draft", () =>
        envelope({
          promptId: 1,
          title: "초안",
          images: [{ imageId: "img-a", sortOrder: 0, thumbnail: true }],
          status: "DRAFT",
          pricePoint: 0,
          updatedAt: "2026-08-05T10:00:00Z",
        }),
      ),
      http.get("/api/v1/prompt-images/statuses", () => new HttpResponse(null, { status: 500 })),
    );

    const { draft } = await fetchDraft();

    expect(draft?.title).toBe("초안");
    /*
      미리보기 없이 자리표시 타일로 뜨되, 상태는 **failed** 다.
      상태를 확인하지 못했는데 ready 라고 하면 깨진 이미지가 멀쩡한 얼굴로 복원되고,
      그대로 게시하면 서버가 "워터마크 처리가 완료되지 않은 이미지입니다" 로 거절한다.
      failed 면 타일에 "실패"가 뜨고 저장·게시가 막혀 사용자가 지우고 다시 올릴 수 있다.
    */
    expect(draft?.images).toEqual([{ imageId: "img-a", status: "failed" }]);
  });
});

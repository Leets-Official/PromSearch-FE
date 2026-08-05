import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { fetchPromptDetail, PromptNotFoundError } from "@/features/prompt-detail/api/prompt-detail";
import { toggleLike } from "@/features/prompt-detail/api/like";
import { fetchComments, fetchReplies } from "@/features/prompt-detail/api/comment";
import type { ApiComment, ApiPromptDetail } from "@/features/prompt-detail/api/dto";
import { server } from "@/mocks/server";

function envelope<T>(result: T, status = 200) {
  return HttpResponse.json(
    { success: true, code: "COMMON-200", message: "성공했습니다.", result },
    { status },
  );
}

function detail(overrides: Partial<ApiPromptDetail> = {}): ApiPromptDetail {
  return {
    promptId: 10,
    title: "먹음직스러운 파스타 사진 생성",
    author: { userId: 12, nickname: "프롬프트장인", profileImageUrl: null },
    outputType: "IMAGE",
    contentType: "PREMIUM",
    pricePoint: 500,
    promptBody: "cinematic food photography of pasta...",
    description: "파스타의 결감을 살린 이미지 생성 프롬프트입니다.",
    access: { locked: false, reason: "FREE" },
    viewerInteraction: { liked: true, bookmarked: false },
    images: [
      { imageId: "b", imageUrl: "https://cdn/2.jpg", sortOrder: 1, thumbnail: false },
      { imageId: "a", imageUrl: "https://cdn/1.jpg", sortOrder: 0, thumbnail: true },
    ],
    tags: [
      { tagId: 5, tagType: "JOB", name: "디자이너" },
      { tagId: 7, tagType: "TASK", name: "PPT" },
      { tagId: 13, tagType: "AI_MODEL", name: "ChatGPT" },
    ],
    statistics: { viewCount: 120, copyCount: 15, commentCount: 7, likeCount: 32 },
    customAiModel: null,
    createdAt: "2026-07-23T10:30:00+09:00",
    updatedAt: "2026-07-23T11:00:00+09:00",
    ...overrides,
  };
}

function comment(overrides: Partial<ApiComment> = {}): ApiComment {
  return {
    commentId: 103,
    parentCommentId: null,
    author: { userId: 10, nickname: "이영희", profileImageUrl: null },
    content: "저도 잘 사용했습니다.",
    status: "ACTIVE",
    mine: false,
    promptAuthor: true,
    createdAt: "2026-07-23T04:00:00Z",
    updatedAt: "2026-07-23T04:00:00Z",
    replyCount: 3,
    ...overrides,
  };
}

describe("fetchPromptDetail", () => {
  it("서버 응답을 도메인 모양으로 옮긴다(이미지는 sortOrder 순)", async () => {
    server.use(http.get("/api/v1/prompts/:id", () => envelope(detail())));

    const result = await fetchPromptDetail("10");

    expect(result).toMatchObject({
      id: "10",
      outputType: "image",
      tier: "premium",
      model: "chatgpt",
      tasks: ["ppt"],
      jobCategories: ["designer"],
      authorId: 12,
      pricePoint: 500,
      liked: true,
      bookmarked: false,
      commentCount: 7,
      descriptionBody: "파스타의 결감을 살린 이미지 생성 프롬프트입니다.",
      recipeBody: "cinematic food photography of pasta...",
    });
    // sortOrder 오름차순으로 정렬해 캐러셀 순서를 서버 의도대로 맞춘다
    expect(result.images).toEqual(["https://cdn/1.jpg", "https://cdn/2.jpg"]);
    expect(result.stats.likes).toBe(32);
  });

  it("잠금 사유를 FE enum 으로 옮긴다", async () => {
    server.use(
      http.get("/api/v1/prompts/:id", () =>
        envelope(detail({ access: { locked: true, reason: "ANONYMOUS" }, promptBody: "" })),
      ),
    );

    const result = await fetchPromptDetail("10");

    expect(result.access).toEqual({ locked: true, reason: "anonymous" });
  });

  it("열람 가능 사유(UNLOCKED 등)는 잠금 해제로 본다", async () => {
    server.use(
      http.get("/api/v1/prompts/:id", () =>
        envelope(detail({ access: { locked: false, reason: "UNLOCKED" } })),
      ),
    );

    expect((await fetchPromptDetail("10")).access).toEqual({ locked: false, reason: null });
  });

  // 좋아요 네이밍 통일(요청서 7-1) 배포 전까지 구 필드도 받아야 화면이 0 으로 깨지지 않는다
  it("구 필드명(recommendCount/recommended)도 수용한다", async () => {
    server.use(
      http.get("/api/v1/prompts/:id", () =>
        envelope({
          ...detail(),
          statistics: { viewCount: 1, copyCount: 2, commentCount: 3, recommendCount: 42 },
          viewerInteraction: { bookmarked: false, recommended: true },
        }),
      ),
    );

    const result = await fetchPromptDetail("10");

    expect(result.stats.likes).toBe(42);
    expect(result.liked).toBe(true);
  });

  it("404 는 PromptNotFoundError 로 바꿔 화면이 분기할 수 있게 한다", async () => {
    server.use(
      http.get("/api/v1/prompts/:id", () =>
        HttpResponse.json(
          { success: false, code: "COMMON-404", message: "요청한 리소스를 찾을 수 없습니다." },
          { status: 404 },
        ),
      ),
    );

    await expect(fetchPromptDetail("999")).rejects.toBeInstanceOf(PromptNotFoundError);
  });
});

describe("toggleLike", () => {
  it("현재 상태에 따라 등록(POST)/취소(DELETE)를 고른다", async () => {
    const called: string[] = [];
    server.use(
      http.post("/api/v1/prompts/:id/likes", () => {
        called.push("POST");
        return envelope({ promptId: 10, liked: true, likeCount: 33 }, 201);
      }),
      http.delete("/api/v1/prompts/:id/likes", () => {
        called.push("DELETE");
        return envelope({ promptId: 10, liked: false, likeCount: 32 });
      }),
    );

    await expect(toggleLike("10", false)).resolves.toEqual({ liked: true, likeCount: 33 });
    await expect(toggleLike("10", true)).resolves.toEqual({ liked: false, likeCount: 32 });
    expect(called).toEqual(["POST", "DELETE"]);
  });
});

describe("fetchComments / fetchReplies", () => {
  it("커서·크기를 쿼리로 넘기고 목록을 도메인 모양으로 돌려준다", async () => {
    let sent: URLSearchParams | null = null;
    server.use(
      http.get("/api/v1/prompts/:id/comments", ({ request }) => {
        sent = new URL(request.url).searchParams;
        return envelope({ comments: [comment()], nextCursor: 103, hasNext: true });
      }),
    );

    const page = await fetchComments("10", { cursor: 200, size: 5 });

    expect(sent!.get("cursor")).toBe("200");
    expect(sent!.get("size")).toBe("5");
    expect(page.nextCursor).toBe(103);
    expect(page.comments[0]).toMatchObject({
      id: "103",
      status: "active",
      isAuthor: true,
      isMine: false,
      replyCount: 3,
      author: { name: "이영희" },
    });
  });

  it("첫 페이지는 cursor 를 아예 보내지 않는다", async () => {
    let sent: URLSearchParams | null = null;
    server.use(
      http.get("/api/v1/prompts/:id/comments", ({ request }) => {
        sent = new URL(request.url).searchParams;
        return envelope({ comments: [], nextCursor: null, hasNext: false });
      }),
    );

    await fetchComments("10");

    expect(sent!.has("cursor")).toBe(false);
  });

  it("블라인드·삭제 댓글의 상태를 그대로 옮긴다(본문은 화면에서 감춘다)", async () => {
    server.use(
      http.get("/api/v1/prompts/:id/comments", () =>
        envelope({
          comments: [
            comment({ commentId: 1, status: "HIDDEN", author: null }),
            comment({ commentId: 2, status: "DELETED", author: null }),
          ],
          nextCursor: null,
          hasNext: false,
        }),
      ),
    );

    const page = await fetchComments("10");

    expect(page.comments.map((c) => c.status)).toEqual(["hidden", "deleted"]);
  });

  it("대댓글은 replies 키에서 꺼낸다", async () => {
    server.use(
      http.get("/api/v1/comments/:commentId/replies", () =>
        envelope({
          replies: [comment({ commentId: 104, parentCommentId: 103, replyCount: undefined })],
          nextCursor: null,
          hasNext: false,
        }),
      ),
    );

    const page = await fetchReplies("103");

    expect(page.comments).toHaveLength(1);
    expect(page.comments[0].id).toBe("104");
    // 대댓글에는 replyCount 가 오지 않는다 → 0
    expect(page.comments[0].replyCount).toBe(0);
  });
});

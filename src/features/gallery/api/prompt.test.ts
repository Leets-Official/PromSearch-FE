import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import type { ApiPromptCard } from "@/features/gallery/api/dto";
import { toPromptSummary } from "@/features/gallery/api/map";
import { fetchPrompts, toQueryParams } from "@/features/gallery/api/prompt";
import type { GalleryQuery } from "@/features/gallery/types";
import { server } from "@/mocks/server";

function query(overrides: Partial<GalleryQuery> = {}): GalleryQuery {
  return {
    nav: "home",
    job: null,
    tasks: [],
    models: [],
    outputTypes: [],
    q: "",
    page: 1,
    ...overrides,
  };
}

/** Swagger HOME-001 예시 형태의 카드 1장 */
function card(overrides: Partial<ApiPromptCard> = {}): ApiPromptCard {
  return {
    promptId: 10,
    title: "금융 대시보드 UI 프롬프트",
    thumbnailImageUrl: "https://cdn.promsearch.com/prompts/10/thumb.webp",
    outputType: "IMAGE",
    contentType: "PREMIUM",
    pricePoint: 500,
    author: { userId: 12, nickname: "prompt-maker", profileImageUrl: null },
    statistics: { viewCount: 120, likeCount: 32, commentCount: 7, copyCount: 15 },
    viewerInteraction: { liked: true, bookmarked: false },
    tags: [
      { tagId: 5, tagType: "JOB", name: "디자이너" },
      { tagId: 7, tagType: "TASK", name: "PPT" },
      { tagId: 13, tagType: "AI_MODEL", name: "ChatGPT" },
    ],
    customAiModel: null,
    createdAt: "2026-07-23T12:00:00Z",
    ...overrides,
  };
}

function envelope(
  cards: ApiPromptCard[],
  page: unknown = 0,
  size: unknown = 6,
  total: unknown = 1,
) {
  return HttpResponse.json({
    success: true,
    code: "COMMON-200",
    message: "성공했습니다.",
    result: { prompts: cards, page: { page, size, totalElements: total, hasNext: false } },
  });
}

describe("toPromptSummary", () => {
  it("서버 enum·태그를 FE 도메인 값으로 옮긴다", () => {
    expect(toPromptSummary(card())).toMatchObject({
      id: "10",
      outputType: "image",
      tier: "premium",
      model: "chatgpt",
      tasks: ["ppt"],
      jobCategories: ["designer"],
      author: { name: "prompt-maker" },
      stats: { views: 120, copies: 15, likes: 32 },
    });
  });

  it("null 필드는 undefined 로 접어 옵셔널 프로퍼티와 맞춘다", () => {
    const summary = toPromptSummary(card({ thumbnailImageUrl: null }));

    expect(summary.thumbnailUrl).toBeUndefined();
    expect(summary.author.avatarUrl).toBeUndefined();
  });

  // 서버가 숫자를 문자열로 내려주는 문제 (docs/be-blockers.md 2번)
  it("통계가 문자열로 와도 숫자로 정규화한다", () => {
    const summary = toPromptSummary(
      card({
        statistics: {
          viewCount: "120",
          copyCount: "15",
          likeCount: "32",
          commentCount: "7",
        } as unknown as ApiPromptCard["statistics"],
      }),
    );

    expect(summary.stats).toEqual({ views: 120, copies: 15, likes: 32 });
  });

  it("AI_MODEL 태그가 없으면 etc + customAiModel 을 표시명으로 쓴다", () => {
    const summary = toPromptSummary(
      card({ tags: [{ tagId: 4, tagType: "JOB", name: "기획자" }], customAiModel: "GPT 4.1 Mini" }),
    );

    expect(summary.model).toBe("etc");
    expect(summary.modelEtcName).toBe("GPT 4.1 Mini");
  });

  it("모르는 태그 이름은 조용히 버린다(BE 태그 추가로 화면이 깨지지 않게)", () => {
    expect(
      toPromptSummary(card({ tags: [{ tagId: 99, tagType: "TASK", name: "아직-없는-태스크" }] }))
        .tasks,
    ).toEqual([]);
  });
});

describe("toQueryParams", () => {
  it("기본 상태는 최신순 + 0페이지, 나머지 축은 생략한다", () => {
    expect(toQueryParams(query())).toEqual({
      sort: "LATEST",
      jobTagId: undefined,
      taskTagIds: undefined,
      aiModelTagIds: undefined,
      outputTypes: undefined,
      q: undefined,
      page: 0,
      size: 6,
    });
  });

  it("인기 탭만 POPULAR 로 정렬한다", () => {
    expect(toQueryParams(query({ nav: "popular" })).sort).toBe("POPULAR");
    // 직군별은 최신순
    expect(toQueryParams(query({ nav: "job", job: "designer" })).sort).toBe("LATEST");
  });

  it("멀티 축은 태그 ID 를 콤마로 이어 보낸다", () => {
    const params = toQueryParams(
      query({ tasks: ["ppt", "report"], models: ["chatgpt"], outputTypes: ["image", "text"] }),
    );

    expect(params.taskTagIds).toBe("7,8");
    expect(params.aiModelTagIds).toBe("13");
    expect(params.outputTypes).toBe("IMAGE,TEXT");
  });

  // "기타"는 BE 에 태그 행이 없어 ID 로 필터할 수 없다
  it("기타 모델만 고르면 aiModelTagIds 를 아예 보내지 않는다", () => {
    expect(toQueryParams(query({ models: ["etc"] })).aiModelTagIds).toBeUndefined();
  });

  it("직군은 태그 ID 로, 검색어는 trim 해서 보낸다", () => {
    const params = toQueryParams(query({ nav: "job", job: "designer", q: "  대시보드 " }));

    expect(params.jobTagId).toBe(5);
    expect(params.q).toBe("대시보드");
  });

  it("공백뿐인 검색어는 생략한다", () => {
    expect(toQueryParams(query({ q: "   " })).q).toBeUndefined();
  });

  it("화면 page(1-based) 를 서버 page(0-based) 로 바꾼다", () => {
    expect(toQueryParams(query({ page: 3 })).page).toBe(2);
  });
});

describe("fetchPrompts", () => {
  it("서버 페이지 메타를 화면 메타로 옮긴다", async () => {
    server.use(http.get("/api/v1/home/prompts", () => envelope([card()], 2, 6, 128)));

    const res = await fetchPrompts(query({ page: 3 }));

    expect(res.page).toBe(3);
    expect(res.totalCount).toBe(128);
    expect(res.totalPages).toBe(Math.ceil(128 / 6));
    expect(res.items[0].id).toBe("10");
  });

  // 서버가 page/size/totalElements 를 문자열로 준다 → "0" + 1 = "01" 방지
  it("페이지 메타가 문자열로 와도 숫자로 계산한다", async () => {
    server.use(http.get("/api/v1/home/prompts", () => envelope([card()], "0", "6", "128")));

    const res = await fetchPrompts(query());

    expect(res.page).toBe(1);
    expect(res.totalCount).toBe(128);
    expect(res.totalPages).toBe(22);
  });

  it("결과가 없으면 빈 목록에 1페이지로 정리한다", async () => {
    server.use(http.get("/api/v1/home/prompts", () => envelope([], 0, 6, 0)));

    const res = await fetchPrompts(query());

    expect(res.items).toEqual([]);
    expect(res.totalPages).toBe(1);
    expect(res.totalCount).toBe(0);
  });
});

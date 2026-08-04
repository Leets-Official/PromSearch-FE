import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import type { ApiPromptCard } from "@/features/gallery/api/dto";
import { toPromptSummary } from "@/features/gallery/api/map";
import { applyClientFilters, fetchPrompts, hasClientFilters } from "@/features/gallery/api/prompt";
import { JOB_TAG_ID } from "@/features/gallery/tag-ids";
import type { GalleryQuery, PromptSummary } from "@/features/gallery/types";
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
      { tagId: 4, tagType: "JOB", name: "디자이너" },
      { tagId: 10, tagType: "TASK", name: "PPT" },
      { tagId: 20, tagType: "AI_MODEL", name: "ChatGPT" },
    ],
    customAiModel: null,
    createdAt: "2026-07-23T12:00:00Z",
    ...overrides,
  };
}

function envelope(cards: ApiPromptCard[], page = 0, size = 6, totalElements = cards.length) {
  return HttpResponse.json({
    success: true,
    code: "COMMON-200",
    message: "성공했습니다.",
    result: { prompts: cards, page: { page, size, totalElements, hasNext: false } },
  });
}

describe("toPromptSummary", () => {
  it("서버 enum·태그를 FE 도메인 값으로 옮긴다", () => {
    const summary = toPromptSummary(card());

    expect(summary).toMatchObject({
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

  // "기타"는 BE 에 태그 행이 없어 tags 에 AI_MODEL 이 아예 안 온다 → customAiModel 이 유일한 표시 수단
  it("AI_MODEL 태그가 없으면 etc + customAiModel 을 표시명으로 쓴다", () => {
    const summary = toPromptSummary(
      card({
        tags: [{ tagId: 4, tagType: "JOB", name: "기획자" }],
        customAiModel: "GPT 4.1 Mini",
      }),
    );

    expect(summary.model).toBe("etc");
    expect(summary.modelEtcName).toBe("GPT 4.1 Mini");
  });

  it("customAiModel 이 비어 있으면(BE 배포 전) 표시명 없이 etc 로만 둔다", () => {
    const summary = toPromptSummary(card({ tags: [], customAiModel: null }));

    expect(summary.model).toBe("etc");
    expect(summary.modelEtcName).toBeUndefined();
  });

  it("매핑에 없는 AI 모델 태그명은 etc + 태그 원문으로 폴백한다", () => {
    const summary = toPromptSummary(
      card({ tags: [{ tagId: 21, tagType: "AI_MODEL", name: "뤼튼" }] }),
    );

    expect(summary.model).toBe("etc");
    expect(summary.modelEtcName).toBe("뤼튼");
  });

  it("모르는 태그 이름은 조용히 버린다(BE 태그 추가로 화면이 깨지지 않게)", () => {
    const summary = toPromptSummary(
      card({ tags: [{ tagId: 99, tagType: "TASK", name: "아직-없는-태스크" }] }),
    );

    expect(summary.tasks).toEqual([]);
  });
});

describe("hasClientFilters", () => {
  it("서버가 못 거르는 축(태스크·모델·결과물·검색어)에만 반응한다", () => {
    expect(hasClientFilters(query())).toBe(false);
    // 직군/페이지는 서버가 처리하므로 클라이언트 필터 경로가 아니다
    expect(hasClientFilters(query({ nav: "job", job: "designer", page: 3 }))).toBe(false);
    // 공백뿐인 검색어도 필터가 아니다
    expect(hasClientFilters(query({ q: "   " }))).toBe(false);

    expect(hasClientFilters(query({ tasks: ["ppt"] }))).toBe(true);
    expect(hasClientFilters(query({ models: ["claude"] }))).toBe(true);
    expect(hasClientFilters(query({ outputTypes: ["text"] }))).toBe(true);
    expect(hasClientFilters(query({ q: "  보고서 " }))).toBe(true);
  });
});

describe("applyClientFilters", () => {
  const items: PromptSummary[] = [
    toPromptSummary(card({ promptId: 1, title: "PPT 표지 만들기" })),
    toPromptSummary(
      card({
        promptId: 2,
        title: "회의록 요약",
        outputType: "TEXT",
        tags: [
          { tagId: 11, tagType: "TASK", name: "회의록" },
          { tagId: 22, tagType: "AI_MODEL", name: "Claude" },
        ],
      }),
    ),
  ];

  it("축 내부는 OR — 선택한 태스크 중 하나만 걸려도 통과", () => {
    const result = applyClientFilters(items, query({ tasks: ["ppt", "email"] }));
    expect(result.map((i) => i.id)).toEqual(["1"]);
  });

  it("축 간은 AND — 한 축이라도 어긋나면 제외", () => {
    // 2번은 태스크(회의록)는 맞지만 결과물이 text 라 image 조건에서 탈락
    const result = applyClientFilters(
      items,
      query({ tasks: ["meeting_notes"], outputTypes: ["image"] }),
    );
    expect(result).toEqual([]);
  });

  it("검색어는 제목에 대소문자 무시 부분일치", () => {
    expect(applyClientFilters(items, query({ q: "ppt" })).map((i) => i.id)).toEqual(["1"]);
    expect(applyClientFilters(items, query({ q: " 회의록 " })).map((i) => i.id)).toEqual(["2"]);
    expect(applyClientFilters(items, query({ q: "없는말" }))).toEqual([]);
  });
});

describe("fetchPrompts", () => {
  it("필터가 없으면 서버 페이지네이션을 그대로 쓴다(page 는 1-based 로 변환)", async () => {
    let sent: URLSearchParams | null = null;
    server.use(
      http.get("/api/v1/home/prompts/popular", ({ request }) => {
        sent = new URL(request.url).searchParams;
        return envelope([card()], 2, 6, 128);
      }),
    );

    const res = await fetchPrompts(query({ page: 3 }));

    // 화면 page=3 → 서버 page=2
    expect(sent!.get("page")).toBe("2");
    expect(sent!.get("size")).toBe("6");
    expect(res.page).toBe(3);
    expect(res.totalCount).toBe(128);
    expect(res.totalPages).toBe(Math.ceil(128 / 6));
    expect(res.items[0].id).toBe("10");
  });

  it("nav=job 이면 하드코딩된 태그 ID 로 직군 엔드포인트를 호출한다", async () => {
    let called = "";
    server.use(
      http.get("/api/v1/home/prompts/jobs/:jobTagId", ({ params }) => {
        called = String(params.jobTagId);
        return envelope([card()]);
      }),
    );

    await fetchPrompts(query({ nav: "job", job: "designer" }));

    expect(called).toBe(String(JOB_TAG_ID.designer));
  });

  it("필터가 걸리면 최대치를 한 번에 받아 거른 뒤 직접 페이지를 자른다", async () => {
    // 이미지 8장 + 텍스트 2장 → outputTypes=image 필터 시 8장 = 2페이지
    const cards = [
      ...Array.from({ length: 8 }, (_, i) => card({ promptId: i + 1 })),
      ...Array.from({ length: 2 }, (_, i) => card({ promptId: 100 + i, outputType: "TEXT" })),
    ];

    let sent: URLSearchParams | null = null;
    server.use(
      http.get("/api/v1/home/prompts/popular", ({ request }) => {
        sent = new URL(request.url).searchParams;
        return envelope(cards, 0, 50, cards.length);
      }),
    );

    const res = await fetchPrompts(query({ outputTypes: ["image"], page: 2 }));

    // 필터 경로에서는 항상 0페이지 + 최대 size 로 받아온다
    expect(sent!.get("page")).toBe("0");
    expect(sent!.get("size")).toBe("50");
    expect(res.totalCount).toBe(8);
    expect(res.totalPages).toBe(2);
    expect(res.page).toBe(2);
    expect(res.items).toHaveLength(2); // 8장 중 두 번째 페이지
  });

  it("필터 결과 범위를 넘는 page 는 마지막 페이지로 접는다", async () => {
    server.use(http.get("/api/v1/home/prompts/popular", () => envelope([card()], 0, 50, 1)));

    const res = await fetchPrompts(query({ q: "금융", page: 9 }));

    expect(res.page).toBe(1);
    expect(res.items).toHaveLength(1);
  });
});

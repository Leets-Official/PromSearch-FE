import { describe, expect, it } from "vitest";

import type { PromptRecord } from "@/mocks/data/prompts";
import { DEFAULT_PAGE_SIZE, queryPrompts, type PromptQueryParams } from "@/mocks/prompt-query";

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

// 필터 미적용 기본 파라미터
function params(overrides: Partial<PromptQueryParams> = {}): PromptQueryParams {
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

function ids(result: { items: { id: string }[] }): string[] {
  return result.items.map((i) => i.id);
}

describe("queryPrompts", () => {
  describe("status=ACTIVE 만 노출", () => {
    it("draft/hidden 은 필터 조건과 무관하게 제외한다", () => {
      const records = [
        record({ id: "a", status: "active" }),
        record({ id: "d", status: "draft" }),
        record({ id: "h", status: "hidden" }),
      ];

      const result = queryPrompts(records, params());

      expect(ids(result)).toEqual(["a"]);
      // 부정: draft/hidden 이 절대 섞이면 안 된다
      expect(ids(result)).not.toContain("d");
      expect(ids(result)).not.toContain("h");
      expect(result.totalCount).toBe(1);
    });
  });

  describe("직군(job) 필터 — 단일, 포함 매칭", () => {
    it("jobCategories 에 선택 직군이 포함된 것만 통과한다", () => {
      const records = [
        record({ id: "dev", jobCategories: ["developer", "student"] }),
        record({ id: "plan", jobCategories: ["planner"] }),
      ];

      const result = queryPrompts(records, params({ nav: "job", job: "developer" }));

      expect(ids(result)).toEqual(["dev"]);
      expect(ids(result)).not.toContain("plan");
    });
  });

  describe("멀티 필터 — 축 내부 OR, 축 간 AND", () => {
    it("태스크는 교집합이 있으면 통과한다(OR)", () => {
      const records = [
        record({ id: "ppt", tasks: ["ppt"] }),
        record({ id: "email", tasks: ["email"] }),
        record({ id: "doc", tasks: ["document"] }),
      ];

      const result = queryPrompts(records, params({ tasks: ["ppt", "email"] }));

      expect(ids(result).sort()).toEqual(["email", "ppt"]);
      expect(ids(result)).not.toContain("doc");
    });

    it("카드가 태스크 여러 개를 가져도 교집합만 있으면 통과한다", () => {
      const records = [
        record({ id: "multi", tasks: ["ppt", "document"] }), // ppt 포함 → 통과
        record({ id: "none", tasks: ["email", "report"] }), // ppt 없음 → 탈락
      ];

      const result = queryPrompts(records, params({ tasks: ["ppt"] }));

      expect(ids(result)).toEqual(["multi"]);
      expect(ids(result)).not.toContain("none");
    });

    it("서로 다른 축은 AND — 태스크는 맞지만 모델이 어긋나면 제외한다", () => {
      const records = [
        // 태스크 O, 모델 O → 통과
        record({ id: "match", tasks: ["ppt"], model: "chatgpt" }),
        // 태스크 O, 모델 X → 제외 (동어반복 방지: OR 로 잘못 짜면 여기서 깨짐)
        record({ id: "task-only", tasks: ["ppt"], model: "gemini" }),
        // 태스크 X, 모델 O → 제외
        record({ id: "model-only", tasks: ["email"], model: "chatgpt" }),
      ];

      const result = queryPrompts(records, params({ tasks: ["ppt"], models: ["chatgpt"] }));

      expect(ids(result)).toEqual(["match"]);
      expect(ids(result)).not.toContain("task-only");
      expect(ids(result)).not.toContain("model-only");
    });

    it("결과물타입(outputType)은 선택값에 포함되어야 통과한다", () => {
      const records = [
        record({ id: "img", outputType: "image" }),
        record({ id: "txt", outputType: "text" }),
      ];

      const result = queryPrompts(records, params({ outputTypes: ["image"] }));

      expect(ids(result)).toEqual(["img"]);
      expect(ids(result)).not.toContain("txt");
    });

    it("필터 미선택 시 전체 ACTIVE 를 반환한다", () => {
      const records = [
        record({ id: "a", tasks: ["ppt"], model: "chatgpt", outputType: "image" }),
        record({ id: "b", tasks: ["email"], model: "gemini", outputType: "text" }),
      ];

      const result = queryPrompts(records, params());

      expect(ids(result).sort()).toEqual(["a", "b"]);
    });
  });

  describe("검색어(q) — 제목/설명 부분일치, 대소문자 무시", () => {
    it("제목 또는 설명에 포함되면 통과한다", () => {
      const records = [
        record({ id: "hit-title", title: "ChatGPT 보고서", description: "설명" }),
        record({ id: "hit-desc", title: "무관", description: "GPT 활용 팁" }),
        record({ id: "miss", title: "무관", description: "관련 없음" }),
      ];

      const result = queryPrompts(records, params({ q: "gpt" }));

      expect(ids(result).sort()).toEqual(["hit-desc", "hit-title"]);
      expect(ids(result)).not.toContain("miss");
    });
  });

  describe("정렬", () => {
    it("기본(home)은 최신순(createdAt 내림차순)", () => {
      const records = [
        record({ id: "old", createdAt: "2026-07-01T00:00:00.000Z" }),
        record({ id: "new", createdAt: "2026-07-10T00:00:00.000Z" }),
        record({ id: "mid", createdAt: "2026-07-05T00:00:00.000Z" }),
      ];

      const result = queryPrompts(records, params({ nav: "home" }));

      expect(ids(result)).toEqual(["new", "mid", "old"]);
    });

    it("popular 은 좋아요(likes) 내림차순 — 오래됐어도 좋아요 많으면 먼저", () => {
      const records = [
        // 최신이지만 좋아요 적음
        record({
          id: "new-few-likes",
          createdAt: "2026-07-10T00:00:00.000Z",
          stats: { views: 0, copies: 0, likes: 3 },
        }),
        // 오래됐지만 좋아요 많음 → popular 정렬에서 먼저 와야 함
        record({
          id: "old-many-likes",
          createdAt: "2026-07-01T00:00:00.000Z",
          stats: { views: 0, copies: 0, likes: 30 },
        }),
      ];

      const result = queryPrompts(records, params({ nav: "popular" }));

      expect(ids(result)).toEqual(["old-many-likes", "new-few-likes"]);
    });

    it("popular 은 복사수/조회수의 영향을 받지 않는다 — 좋아요만 기준", () => {
      const records = [
        // 복사수·조회수는 압도적이지만 좋아요는 적음 → 뒤로 가야 함
        record({
          id: "many-copies-few-likes",
          createdAt: "2026-07-01T00:00:00.000Z",
          stats: { views: 9999, copies: 999, likes: 2 },
        }),
        // 복사수·조회수는 적지만 좋아요가 많음 → 앞에 와야 함
        record({
          id: "few-copies-many-likes",
          createdAt: "2026-07-01T00:00:00.000Z",
          stats: { views: 1, copies: 0, likes: 10 },
        }),
      ];

      const result = queryPrompts(records, params({ nav: "popular" }));

      // 동어반복 방지: (copies+likes) 로 잘못 짜면 many-copies 가 먼저 와서 실패
      expect(ids(result)).toEqual(["few-copies-many-likes", "many-copies-few-likes"]);
    });
  });

  describe("페이지네이션", () => {
    const many = Array.from({ length: 30 }, (_, i) =>
      record({
        id: `p-${String(i).padStart(2, "0")}`,
        // createdAt 을 인덱스로 내림차순 정렬되게 부여
        createdAt: new Date(Date.parse("2026-07-31T00:00:00.000Z") - i * 86_400_000).toISOString(),
      }),
    );

    it("기본 size(12) 로 첫 페이지를 자른다", () => {
      const result = queryPrompts(many, params({ page: 1 }));

      expect(result.items).toHaveLength(DEFAULT_PAGE_SIZE);
      expect(result.page).toBe(1);
      expect(result.totalCount).toBe(30);
      expect(result.totalPages).toBe(3); // ceil(30/12)
      expect(result.items[0].id).toBe("p-00"); // 최신
    });

    it("2페이지는 다음 구간을 반환한다", () => {
      const page1 = queryPrompts(many, params({ page: 1 }));
      const page2 = queryPrompts(many, params({ page: 2 }));

      expect(page2.page).toBe(2);
      expect(page2.items).toHaveLength(DEFAULT_PAGE_SIZE);
      // 1페이지와 겹치지 않아야 한다
      const overlap = page2.items.filter((i) => page1.items.some((p) => p.id === i.id));
      expect(overlap).toHaveLength(0);
    });

    it("범위를 넘는 page 는 마지막 페이지로 클램프한다", () => {
      const result = queryPrompts(many, params({ page: 999 }));

      expect(result.page).toBe(3);
      expect(result.items).toHaveLength(30 - DEFAULT_PAGE_SIZE * 2); // 마지막 6개
    });

    it("결과가 없어도 totalPages 는 최소 1", () => {
      const result = queryPrompts([], params());

      expect(result.totalCount).toBe(0);
      expect(result.totalPages).toBe(1);
      expect(result.items).toHaveLength(0);
    });
  });
});

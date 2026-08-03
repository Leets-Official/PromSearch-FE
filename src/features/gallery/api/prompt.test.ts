import { describe, expect, it } from "vitest";

import { fetchPrompts, toSearchParams } from "@/features/gallery/api/prompt";
import type { GalleryQuery } from "@/features/gallery/types";

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

describe("toSearchParams", () => {
  it("기본값은 모두 생략한다(빈 쿼리스트링)", () => {
    expect(toSearchParams(query()).toString()).toBe("");
  });

  it("멀티 필터는 콤마로, 결과물타입은 `types` 키로 직렬화한다", () => {
    const params = toSearchParams(
      query({ tasks: ["ppt", "report"], models: ["chatgpt"], outputTypes: ["image"] }),
    );

    expect(params.get("tasks")).toBe("ppt,report");
    expect(params.get("models")).toBe("chatgpt");
    expect(params.get("types")).toBe("image");
  });

  it("nav/job/q/page 를 반영하되 기본값(home, page 1)은 생략한다", () => {
    const params = toSearchParams(query({ nav: "job", job: "designer", q: " 보고서 ", page: 2 }));

    expect(params.get("nav")).toBe("job");
    expect(params.get("job")).toBe("designer");
    expect(params.get("q")).toBe("보고서"); // trim
    expect(params.get("page")).toBe("2");
  });

  it("nav=home, page=1 은 URL 에서 생략된다", () => {
    const params = toSearchParams(query({ nav: "home", page: 1 }));
    expect(params.has("nav")).toBe(false);
    expect(params.has("page")).toBe(false);
  });
});

describe("fetchPrompts (MSW 목 연동)", () => {
  it("목 핸들러로부터 ACTIVE 목록을 페이지네이션해 받는다", async () => {
    const res = await fetchPrompts(query());

    expect(res.items.length).toBeGreaterThan(0);
    expect(res.page).toBe(1);
    expect(res.totalPages).toBeGreaterThanOrEqual(1);
    // 목 시드의 draft/hidden 이 섞이면 안 됨 → totalCount 는 전체(48)보다 작다
    expect(res.totalCount).toBeLessThan(48);
  });

  it("결과물타입 필터가 응답에 반영된다", async () => {
    const res = await fetchPrompts(query({ outputTypes: ["image"] }));

    expect(res.items.every((i) => i.outputType === "image")).toBe(true);
  });
});

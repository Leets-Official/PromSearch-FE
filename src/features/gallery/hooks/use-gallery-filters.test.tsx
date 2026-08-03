import { act, renderHook, waitFor } from "@testing-library/react";
import { withNuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";

import { useGalleryFilters } from "@/features/gallery/hooks/use-gallery-filters";

function renderFilters(initialSearchParams = "") {
  const onUrlUpdate = vi.fn<(e: UrlUpdateEvent) => void>();
  const view = renderHook(() => useGalleryFilters(), {
    wrapper: withNuqsTestingAdapter({ searchParams: initialSearchParams, onUrlUpdate }),
  });
  return { ...view, onUrlUpdate };
}

// 마지막 URL 업데이트의 searchParams 를 반환
function lastParams(onUrlUpdate: ReturnType<typeof vi.fn>): URLSearchParams {
  const calls = onUrlUpdate.mock.calls;
  return (calls[calls.length - 1][0] as UrlUpdateEvent).searchParams;
}

describe("useGalleryFilters", () => {
  it("기본값 — nav=home, 빈 필터, page=1", () => {
    const { result } = renderFilters();

    expect(result.current.query).toMatchObject({
      nav: "home",
      job: null,
      tasks: [],
      models: [],
      outputTypes: [],
      q: "",
      page: 1,
    });
  });

  it("URL 쿼리를 초기 상태로 반영한다", () => {
    const { result } = renderFilters("?nav=job&job=designer&tasks=ppt,report&types=image&page=2");

    expect(result.current.query).toMatchObject({
      nav: "job",
      job: "designer",
      tasks: ["ppt", "report"],
      outputTypes: ["image"],
      page: 2,
    });
  });

  it("태스크 토글은 목록에 추가하고 page 를 1로 리셋한다", () => {
    // 3페이지에서 시작 — 필터 변경 시 반드시 1로 돌아와야 한다
    const { result } = renderFilters("?tasks=email&page=3");

    act(() => result.current.toggleTask("ppt"));

    expect(result.current.query.tasks.sort()).toEqual(["email", "ppt"]);
    // 핵심(동어반복 방지): page 리셋이 없으면 여기서 깨진다
    expect(result.current.query.page).toBe(1);
  });

  it("이미 선택된 태스크를 다시 토글하면 제거한다", () => {
    const { result } = renderFilters("?tasks=email,ppt");

    act(() => result.current.toggleTask("email"));

    expect(result.current.query.tasks).toEqual(["ppt"]);
  });

  it("직군 선택은 nav=job 으로 바꾸고 page 를 리셋한다", () => {
    const { result } = renderFilters("?page=5");

    act(() => result.current.selectJob("developer"));

    expect(result.current.query).toMatchObject({ nav: "job", job: "developer", page: 1 });
  });

  it("홈/인기로 nav 변경 시 직군을 해제한다", () => {
    const { result } = renderFilters("?nav=job&job=planner&page=2");

    act(() => result.current.setNav("popular"));

    expect(result.current.query).toMatchObject({ nav: "popular", job: null, page: 1 });
  });

  it("검색어 변경도 page 를 리셋한다", () => {
    const { result } = renderFilters("?page=4");

    act(() => result.current.setSearch("보고서"));

    expect(result.current.query).toMatchObject({ q: "보고서", page: 1 });
  });

  it("setPage 는 필터를 건드리지 않고 페이지만 바꾼다(리셋 대상 아님)", () => {
    const { result } = renderFilters("?tasks=ppt&models=chatgpt");

    act(() => result.current.setPage(3));

    expect(result.current.query.page).toBe(3);
    // 부정: 페이지 이동이 필터를 지우면 안 된다
    expect(result.current.query.tasks).toEqual(["ppt"]);
    expect(result.current.query.models).toEqual(["chatgpt"]);
  });

  it("결과물타입은 URL 상 `types` 키로 직렬화된다", async () => {
    const { result, onUrlUpdate } = renderFilters();

    act(() => result.current.toggleOutputType("image"));

    // nuqs URL 반영은 throttle 되므로 flush 를 기다린다
    await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());

    const params = lastParams(onUrlUpdate);
    expect(params.get("types")).toBe("image");
    expect(params.has("outputTypes")).toBe(false);
  });
});

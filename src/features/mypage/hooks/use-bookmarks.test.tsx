import { renderHook } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";

import { useBookmarks } from "@/features/mypage/hooks/use-bookmarks";

// 갤러리 필터 훅을 케이스별로 제어 (query 값을 바꿔가며 검증)
let mockQuery = {
  tasks: [] as string[],
  models: [] as string[],
  outputTypes: [] as string[],
  page: 1,
};
vi.mock("@/features/gallery/hooks/use-gallery-filters", () => ({
  useGalleryFilters: () => ({ query: mockQuery }),
}));

describe("useBookmarks", () => {
  beforeEach(() => {
    mockQuery = { tasks: [], models: [], outputTypes: [], page: 1 };
  });

  it("필터가 비어 있으면 첫 페이지(6개)를 반환한다", () => {
    const { result } = renderHook(() => useBookmarks());

    expect(result.current.prompts).toHaveLength(6); // PAGE_SIZE
    expect(result.current.totalPages).toBeGreaterThan(1); // 목 30개 → 5페이지
  });

  it("page 를 바꾸면 다른 슬라이스를 반환한다", () => {
    mockQuery = { ...mockQuery, page: 1 };
    const { result: p1 } = renderHook(() => useBookmarks());
    const firstOfPage1 = p1.current.prompts[0]?.id;

    mockQuery = { ...mockQuery, page: 2 };
    const { result: p2 } = renderHook(() => useBookmarks());

    // 부정: 2페이지 첫 항목은 1페이지 첫 항목과 다르다
    expect(p2.current.prompts[0]?.id).not.toBe(firstOfPage1);
  });

  it("모델 필터를 걸면 해당 모델만 남는다(AND 축)", () => {
    // 목 데이터에 존재하는 모델 하나로 필터 (첫 항목의 model 사용)
    const { result: all } = renderHook(() => useBookmarks());
    const someModel = all.current.prompts[0]!.model;

    mockQuery = { ...mockQuery, models: [someModel] };
    const { result } = renderHook(() => useBookmarks());

    expect(result.current.prompts.length).toBeGreaterThan(0);
    // 긍정: 남은 건 전부 그 모델이다
    expect(result.current.prompts.every((p) => p.model === someModel)).toBe(true);
  });
});

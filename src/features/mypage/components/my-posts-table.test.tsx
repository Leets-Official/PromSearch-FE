import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { ReactNode } from "react";

import { useBookmarks } from "@/features/mypage/hooks/use-bookmarks";
import type { PromptSummary } from "@/features/gallery/types";

let mockQuery = {
  tasks: [] as string[],
  models: [] as string[],
  outputTypes: [] as string[],
  page: 1,
};

vi.mock("@/features/gallery/hooks/use-gallery-filters", () => ({
  useGalleryFilters: () => ({ query: mockQuery }),
}));

interface MockBookmarkResponse {
  prompts: PromptSummary[];
  page: {
    totalElements: number;
  };
}

interface FetchMyBookmarksParams {
  taskTagIds: string[];
  aiModelTagIds: string[];
  outputTypes: string[];
  page: number;
  size: number;
}

// 목 데이터: 30개
const ALL_PROMPTS: PromptSummary[] = Array.from({ length: 30 }, (_, i) => ({
  id: `prompt-${i + 1}`,
  model: ["model-a", "model-b", "model-c"][i % 3],
  title: `Prompt ${i + 1}`,
})) as PromptSummary[];

vi.mock("@/features/mypage/api/bookmarks", () => ({
  fetchMyBookmarks: vi.fn(
    async ({ page, size }: FetchMyBookmarksParams): Promise<MockBookmarkResponse> => {
      const start = page * size;
      const end = start + size;
      const prompts = ALL_PROMPTS.slice(start, end);

      return {
        prompts,
        page: {
          totalElements: ALL_PROMPTS.length,
        },
      };
    },
  ),
  tasksToTagIds: (tasks: string[]) => tasks,
  aiModelsToTagIds: (models: string[]) => models,
  toPromptSummary: (p: PromptSummary) => p,
}));

describe("useBookmarks", () => {
  beforeEach(() => {
    mockQuery = { tasks: [], models: [], outputTypes: [], page: 1 };
  });

  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    const Wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    Wrapper.displayName = "QueryClientWrapper";

    return Wrapper;
  };

  it("필터가 비어 있으면 첫 페이지(6개)를 반환한다", async () => {
    const { result } = renderHook(() => useBookmarks(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.prompts).toHaveLength(6);
    expect(result.current.totalPages).toBeGreaterThan(1);
  });

  it("page 를 바꾸면 다른 슬라이스를 반환한다", async () => {
    mockQuery = { ...mockQuery, page: 1 };
    const { result: p1 } = renderHook(() => useBookmarks(), { wrapper: createWrapper() });
    await waitFor(() => expect(p1.current.isLoading).toBe(false));
    const firstOfPage1 = p1.current.prompts[0]?.id;

    mockQuery = { ...mockQuery, page: 2 };
    const { result: p2 } = renderHook(() => useBookmarks(), { wrapper: createWrapper() });
    await waitFor(() => expect(p2.current.isLoading).toBe(false));

    expect(p2.current.prompts[0]?.id).not.toBe(firstOfPage1);
  });
});

"use client";

import { useQuery } from "@tanstack/react-query";

import { useGalleryFilters } from "@/features/gallery/hooks/use-gallery-filters";
import type { PromptSummary } from "@/features/gallery/types";
import {
  fetchMyBookmarks,
  tasksToTagIds,
  aiModelsToTagIds,
  toPromptSummary,
} from "@/features/mypage/api/bookmarks";

const PAGE_SIZE = 6; // 시안 기준(3열 × 2행)

interface UseBookmarksResult {
  prompts: PromptSummary[];
  totalPages: number;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * [COMMUNITY-005] 내 북마크 목록 — 갤러리와 동일한 필터 축(태스크/모델/결과물) + 페이지 상태를 공유한다.
 * 필터는 BE 스펙상 콤마 구분 배열이라 멀티 선택을 그대로 지원한다.
 */
export function useBookmarks(): UseBookmarksResult {
  const { query } = useGalleryFilters();

  const taskTagIds = tasksToTagIds(query.tasks);
  const aiModelTagIds = aiModelsToTagIds(query.models);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["my-bookmarks", taskTagIds, aiModelTagIds, query.outputTypes, query.page],
    queryFn: () =>
      fetchMyBookmarks({
        taskTagIds,
        aiModelTagIds,
        outputTypes: query.outputTypes,
        page: query.page - 1, // API 는 0-based
        size: PAGE_SIZE,
      }),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.page.totalElements / PAGE_SIZE)) : 1;

  return {
    prompts: data?.prompts.map(toPromptSummary) ?? [],
    totalPages,
    isLoading,
    isError,
    refetch,
  };
}

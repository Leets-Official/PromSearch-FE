"use client";

import { useMemo } from "react";

import { useGalleryFilters } from "@/features/gallery/hooks/use-gallery-filters";
import type { PromptSummary } from "@/features/gallery/types";
import { BOOKMARKED_PROMPTS } from "@/mocks/data/mypage";

const PAGE_SIZE = 6; // 시안 기준(3열 × 2행). 갤러리와 페이지 크기를 맞추려면 조정.

interface UseBookmarksResult {
  prompts: PromptSummary[];
  totalPages: number;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * 북마크 목록 — 갤러리와 동일한 필터 축(태스크/모델/결과물) + 페이지 상태를 공유한다.
 * 지금은 목데이터를 클라이언트에서 필터링하지만, 실제로는 아래 필터 조건을 쿼리스트링으로
 * 넘겨 GET /bookmarks 를 호출하도록 교체한다.
 */
export function useBookmarks(): UseBookmarksResult {
  const { query } = useGalleryFilters();

  const { prompts, totalPages } = useMemo(() => {
    // TODO: GET /bookmarks?tasks=&models=&outputTypes=&page= 로 대체
    const filtered = BOOKMARKED_PROMPTS.filter((p) => {
      const taskOk = query.tasks.length === 0 || p.tasks.some((t) => query.tasks.includes(t));
      const modelOk = query.models.length === 0 || query.models.includes(p.model);
      const outputOk = query.outputTypes.length === 0 || query.outputTypes.includes(p.outputType);
      return taskOk && modelOk && outputOk;
    });

    const total = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const start = (query.page - 1) * PAGE_SIZE;
    return { prompts: filtered.slice(start, start + PAGE_SIZE), totalPages: total };
  }, [query.tasks, query.models, query.outputTypes, query.page]);

  return { prompts, totalPages, isLoading: false, isError: false, refetch: () => {} };
}

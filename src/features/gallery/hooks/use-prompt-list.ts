"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { fetchPrompts } from "@/features/gallery/api/prompt";
import type { GalleryQuery } from "@/features/gallery/types";
import { currentDevEdge } from "@/lib/dev-preview";

/**
 * 홈 갤러리 목록 조회.
 *
 * - queryKey 에 필터/페이지 전체를 포함 → 조건 변경 시 자동 리페치·캐싱
 * - keepPreviousData: 페이지 이동 시 이전 페이지를 유지해 깜빡임을 줄임
 */
export function usePromptList(query: GalleryQuery) {
  return useQuery({
    queryKey: ["prompts", query],
    queryFn: () => fetchPrompts(query),
    placeholderData: keepPreviousData,
    // dev 툴바 강제 에러는 재시도(기본 3회·백오프)를 건너뛰고 즉시 에러를 반영한다.
    retry: (failureCount) => currentDevEdge() !== "error" && failureCount < 3,
  });
}

"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { fetchPrompts } from "@/features/gallery/api/prompt";
import type { GalleryQuery } from "@/features/gallery/types";

/**
 * 홈 갤러리 목록 조회.
 *
 * - queryKey 에 필터/페이지 전체를 포함 → 조건 변경 시 자동 리페치·캐싱
 * - keepPreviousData: 페이지 이동 시 이전 페이지를 유지해 깜빡임을 줄임
 * - retry 는 지정하지 않는다 — `lib/query-client.ts` 전역 정책(4xx 재시도 안 함, 그 외 2회)을 따른다.
 */
export function usePromptList(query: GalleryQuery) {
  return useQuery({
    queryKey: ["prompts", query],
    queryFn: () => fetchPrompts(query),
    placeholderData: keepPreviousData,
  });
}

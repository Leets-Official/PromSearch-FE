"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchDraft } from "../api/upload";

/** 임시저장 조회 캐시 키 — 단일 슬롯이라 id 없음 */
export const PROMPT_DRAFT_KEY = ["prompt-draft"] as const;

/**
 * 임시저장 존재 여부/내용 조회.
 * 업로드 페이지 진입 시 1회 조회 → draft 가 있으면 불러오기/새로작성 모달을 띄운다.
 * (staleTime 무한: 진입 시점 스냅샷을 유지하고, 저장/삭제 시 캐시를 직접 갱신한다)
 */
export function usePromptDraft() {
  return useQuery({
    queryKey: PROMPT_DRAFT_KEY,
    queryFn: fetchDraft,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

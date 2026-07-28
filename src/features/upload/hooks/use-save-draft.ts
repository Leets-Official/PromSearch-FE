"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { saveDraft } from "../api/upload";
import type { DraftResponse, PromptFormValues } from "../types";
import { PROMPT_DRAFT_KEY } from "./use-prompt-draft";

/**
 * 임시저장(단일 슬롯 덮어쓰기). 성공 시 조회 캐시를 갱신해 다음 진입에서 바로 반영된다.
 */
export function useSaveDraft() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (values: PromptFormValues) => saveDraft(values),
    onSuccess: (draft) => {
      qc.setQueryData<DraftResponse>(PROMPT_DRAFT_KEY, { draft });
    },
  });
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteDraft } from "../api/upload";
import type { DraftResponse } from "../types";
import { PROMPT_DRAFT_KEY } from "./use-prompt-draft";

/**
 * 임시저장 삭제("새로 작성하기" 선택 또는 게시 완료 후 정리).
 * 성공 시 조회 캐시를 draft: null 로 비운다.
 */
export function useDeleteDraft() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => deleteDraft(),
    onSuccess: () => {
      qc.setQueryData<DraftResponse>(PROMPT_DRAFT_KEY, { draft: null });
    },
  });
}

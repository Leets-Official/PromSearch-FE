"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createPrompt } from "../api/upload";
import type { CreatePromptRequest } from "../types";

/**
 * 프롬프트 게시(생성). 성공 시 홈 목록 캐시를 무효화해 새 글이 반영되게 한다.
 * (임시저장 정리·상세 이동은 호출부에서 처리)
 */
export function useCreatePrompt() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: CreatePromptRequest) => createPrompt(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prompts"] });
    },
  });
}

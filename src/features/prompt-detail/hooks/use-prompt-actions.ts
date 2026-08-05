"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { recordCopy, unlockPrompt } from "@/features/prompt-detail/api/commerce";
import { createReport, type ReportTargetType } from "@/features/prompt-detail/api/report";
import type { ApiReportReason } from "@/features/prompt-detail/api/dto";
import type { PromptDetail } from "@/features/prompt-detail/types";

const detailFilter = (id: string) => ({ queryKey: ["prompt", id] as const });

/**
 * 프리미엄 잠금 해제.
 *
 * 응답이 비어 있어(Void) 열린 본문을 받으려면 **상세를 다시 조회**해야 한다.
 * 그래서 성공 후 무효화만 하고 캐시를 직접 건드리지 않는다.
 */
export function useUnlockPrompt(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => unlockPrompt(id),
    onSuccess: () => qc.invalidateQueries(detailFilter(id)),
  });
}

/**
 * 본문 복사 기록.
 *
 * 복사 자체는 클립보드에서 이미 끝났고 이건 집계일 뿐이라, **실패해도 사용자에게 알리지 않는다**
 * (복사는 됐는데 에러가 뜨면 더 혼란스럽다). 성공 시 카운트만 캐시에 반영한다.
 */
export function useRecordCopy(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => recordCopy(id),
    onSuccess: (copyCount) => {
      qc.setQueriesData<PromptDetail>(detailFilter(id), (old) =>
        old ? { ...old, stats: { ...old.stats, copies: copyCount } } : old,
      );
    },
  });
}

/** 신고 접수 — 게시글/댓글이 경로로 갈린다. */
export function useCreateReport() {
  return useMutation({
    mutationFn: (vars: {
      target: ReportTargetType;
      targetId: string;
      reason: ApiReportReason;
      description: string;
    }) => createReport(vars.target, vars.targetId, vars.reason, vars.description),
  });
}

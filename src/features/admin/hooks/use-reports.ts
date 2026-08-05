"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchReports, updateReportStatus } from "@/features/admin/api/admin";
import type {
  AdminListQuery,
  ModerationStatus,
  ReportTab,
  ReportTarget,
} from "@/features/admin/types";

/** 신고 목록 조회. 탭/검색/페이지가 queryKey 에 들어가 조건이 바뀌면 자동 리페치된다. */
export function useReportList(target: ReportTarget, query: AdminListQuery<ReportTab>) {
  return useQuery({
    queryKey: ["admin", "reports", target, query],
    queryFn: () => fetchReports(target, query),
    // 페이지 이동 시 이전 페이지를 유지해 표가 깜빡이지 않게 한다.
    placeholderData: keepPreviousData,
  });
}

/**
 * 신고 처리(숨김/유지). 성공 시 해당 대상의 목록 쿼리를 통째로 무효화한다
 * — 탭 필터가 걸려 있으면 처리된 행이 목록에서 빠져야 하므로 부분 갱신이 아니라 리페치가 맞다.
 */
export function useUpdateReportStatus(target: ReportTarget) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Exclude<ModerationStatus, "pending"> }) =>
      updateReportStatus(target, id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "reports", target] });
    },
  });
}

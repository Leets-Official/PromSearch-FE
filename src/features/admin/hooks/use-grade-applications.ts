"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { approveGradeApplication, fetchGradeApplications } from "@/features/admin/api/admin";
import type { AdminListQuery, GradeTab } from "@/features/admin/types";
import { currentDevEdge } from "@/lib/dev-preview";

/** 유저 등급 신청 목록 조회. */
export function useGradeApplicationList(query: AdminListQuery<GradeTab>) {
  return useQuery({
    queryKey: ["admin", "grade-applications", query],
    queryFn: () => fetchGradeApplications(query),
    placeholderData: keepPreviousData,
    retry: (failureCount) => currentDevEdge() !== "error" && failureCount < 3,
  });
}

/** 등급 승인. 승인되면 "심사 대기중" 탭에서 빠지므로 목록 전체를 무효화한다. */
export function useApproveGradeApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveGradeApplication(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "grade-applications"] });
    },
  });
}

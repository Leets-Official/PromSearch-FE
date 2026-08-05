"use client";

import { PaginationRoot } from "@/components/ui/pagination";
import {
  AdminEmpty,
  AdminError,
  AdminTableSkeleton,
} from "@/features/admin/components/admin-states";
import {
  AdminRowAction,
  AdminRowStatus,
  AdminTable,
  AdminTableActionCell,
  AdminTableActionHead,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/features/admin/components/admin-table";
import { AdminTabs } from "@/features/admin/components/admin-tabs";
import { GRADE_TABS, GRADE_TAB_VALUES } from "@/features/admin/constants";
import { formatAdminDate, formatCount } from "@/features/admin/format";
import {
  useApproveGradeApplication,
  useGradeApplicationList,
} from "@/features/admin/hooks/use-grade-applications";
import { useAdminFilters } from "@/features/admin/hooks/use-admin-filters";

/**
 * 유저 등급 관리 화면 (시안 1434:5839).
 * 탭(심사 대기중 / 승인 완료) → 표 → 페이지네이션. (검색은 서버 미지원 — 아래 주석 참고)
 * 승인 액션은 "심사 대기중" 행에만 있고, 승인 완료 행은 상태 라벨로 표시한다.
 */
export function GradeApplicationView() {
  const { query, setTab, setPage } = useAdminFilters(GRADE_TAB_VALUES, "pending");
  const { data, isPending, isError, refetch } = useGradeApplicationList(query);
  const approve = useApproveGradeApplication();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-heading-1 text-text-primary">유저 등급 관리</h1>

      {/*
        유저 검색은 **의도적으로 빼 둔다**(2026-08-06 BE 결정: 서버 미지원 → 미구현으로 남김).

        시안(1434:5839)에는 검색바가 있지만, 서버가 `q` 를 모르는 상태에서 붙여 두면
        받아 온 앞쪽 100건 안에서만 걸러진다 → 실제로 존재하는 유저를 "없음"으로 보여 준다.
        조용히 틀린 결과를 주느니 없는 편이 낫다. 서버 검색이 붙으면 되살릴 것
        (`fetchGradeApplications` 의 클라이언트 필터 경로는 그대로 남아 있다).
      */}
      <AdminTabs label="등급 신청 상태" tabs={GRADE_TABS} value={query.tab} onChange={setTab} />

      {isError ? (
        <AdminError onRetry={() => void refetch()} />
      ) : isPending ? (
        <AdminTableSkeleton />
      ) : data.items.length === 0 ? (
        <AdminEmpty message="해당 조건의 신청 내역이 없어요" />
      ) : (
        <>
          <AdminTable>
            <AdminTableHeader>
              <AdminTableRow>
                <AdminTableHead className="w-[20%]">아이디</AdminTableHead>
                <AdminTableHead className="w-[20%]">게시글</AdminTableHead>
                <AdminTableHead className="w-[20%]">누적 추천</AdminTableHead>
                <AdminTableHead className="w-[30%]">신청일자</AdminTableHead>
                {/* 승인 버튼은 오른쪽 끝에 고정된다 */}
                <AdminTableActionHead />
              </AdminTableRow>
            </AdminTableHeader>

            <AdminTableBody>
              {data.items.map((item) => (
                <AdminTableRow key={item.id}>
                  <AdminTableCell className="text-text-primary">{item.userId}</AdminTableCell>
                  <AdminTableCell>{formatCount(item.postCount)}</AdminTableCell>
                  <AdminTableCell>{formatCount(item.likeCount)}</AdminTableCell>
                  <AdminTableCell>{formatAdminDate(item.appliedAt)}</AdminTableCell>
                  <AdminTableActionCell>
                    {item.status === "approved" ? (
                      <AdminRowStatus>승인 완료</AdminRowStatus>
                    ) : (
                      <AdminRowAction
                        tone="brand"
                        disabled={approve.isPending}
                        aria-label={`${item.userId} 등급 승인`}
                        onClick={() => approve.mutate(item.id)}
                      >
                        승인
                      </AdminRowAction>
                    )}
                  </AdminTableActionCell>
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminTable>

          {data.totalPages > 1 ? (
            <PaginationRoot
              page={data.page}
              pageCount={data.totalPages}
              onPageChange={setPage}
              className="mt-8"
            />
          ) : null}
        </>
      )}
    </div>
  );
}

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
import { AdminSearch } from "@/features/admin/components/admin-search";
import { AdminTabs } from "@/features/admin/components/admin-tabs";
import { GRADE_TABS, GRADE_TAB_VALUES } from "@/features/admin/constants";
import { formatAdminDate, formatCount } from "@/features/admin/format";
import {
  useApproveGradeApplication,
  useGradeApplicationList,
} from "@/features/admin/hooks/use-grade-applications";
import { useAdminFilters } from "@/features/admin/hooks/use-admin-filters";
import { useToast } from "@/components/ui/toast";

/**
 * 유저 등급 관리 화면 (시안 1434:5839).
 * 탭(심사 대기중 / 승인 완료) → 검색 → 표 → 페이지네이션.
 * 승인 액션은 "심사 대기중" 행에만 있고, 승인 완료 행은 상태 라벨로 표시한다.
 */
export function GradeApplicationView() {
  const { query, setTab, setSearch, setPage } = useAdminFilters(GRADE_TAB_VALUES, "pending");
  const { data, isPending, isError, refetch } = useGradeApplicationList(query);
  const approve = useApproveGradeApplication();
  const { toastSuccess, toastApiError } = useToast();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-heading-1 text-text-primary">유저 등급 관리</h1>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <AdminTabs label="등급 신청 상태" tabs={GRADE_TABS} value={query.tab} onChange={setTab} />
        {/*
          시안(1434:5839)의 검색바. 서버 `q` 가 붙어(2026-08-06) 되살렸다 —
          신청자 아이디(이메일) 또는 닉네임 부분일치를 **서버가** 걸러 준다.
        */}
        <AdminSearch
          value={query.q}
          onSearch={setSearch}
          placeholder="아이디·닉네임 검색"
          label="등급 신청자 검색"
        />
      </div>

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
                        onClick={() =>
                          approve.mutate(item.id, {
                            onSuccess: () => toastSuccess("등급을 승인했어요."),
                            onError: toastApiError,
                          })
                        }
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

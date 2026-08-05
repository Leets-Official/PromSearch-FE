"use client";

import { PaginationRoot } from "@/components/ui/pagination";
import { AdminTabs } from "@/features/admin/components/admin-tabs";
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
  AdminTableTruncatedCell,
} from "@/features/admin/components/admin-table";
import { AdminSearch } from "@/features/admin/components/admin-search";
import {
  MODERATION_ACTIONS,
  REPORT_REASON_LABELS,
  REPORT_TABS,
  REPORT_TAB_VALUES,
  REPORT_TARGET_COPY,
} from "@/features/admin/constants";
import { useAdminFilters } from "@/features/admin/hooks/use-admin-filters";
import { useReportList, useUpdateReportStatus } from "@/features/admin/hooks/use-reports";
import type { ReportTarget } from "@/features/admin/types";
import { useToast } from "@/components/ui/toast";

/**
 * 신고 게시글/댓글 관리 화면 (시안 551:3669 · 1434:6473).
 *
 * 두 화면은 제목과 첫 컬럼 라벨만 다르고 구조(탭 → 표 → 페이지네이션)와 처리 액션이 같아
 * `target` 으로 갈라 한 컴포넌트를 공유한다.
 *
 * 행 액션: [숨김][유지] 중 **현재 처리 상태와 같은 쪽은 버튼이 아니라 상태 라벨**로 보여준다
 * (전체 탭에서 어떤 행이 어떻게 처리됐는지 별도 컬럼 없이 읽히게).
 */
export function ReportedContentView({ target }: { target: ReportTarget }) {
  const copy = REPORT_TARGET_COPY[target];
  const { query, setTab, setSearch, setPage } = useAdminFilters(REPORT_TAB_VALUES, "all");
  const { data, isPending, isError, refetch } = useReportList(target, query);
  const updateStatus = useUpdateReportStatus(target);
  // 표 안의 버튼 하나로 끝나는 액션이라 결과를 적을 자리가 없다 → 토스트.
  const { toastSuccess, toastApiError } = useToast();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-heading-1 text-text-primary">{copy.heading}</h1>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <AdminTabs
          label={`${copy.heading} 처리 상태`}
          tabs={REPORT_TABS}
          value={query.tab}
          onChange={setTab}
        />
        {/* 서버 검색(q): 대상 내용(제목/본문) 또는 작성자 닉네임 부분일치 */}
        <AdminSearch
          value={query.q}
          onSearch={setSearch}
          placeholder={`${copy.contentColumn}·작성자 검색`}
          label={`${copy.heading} 검색`}
        />
      </div>

      {isError ? (
        <AdminError onRetry={() => void refetch()} />
      ) : isPending ? (
        <AdminTableSkeleton />
      ) : data.items.length === 0 ? (
        <AdminEmpty message="해당 조건의 신고 내역이 없어요" />
      ) : (
        <>
          <AdminTable>
            <AdminTableHeader>
              <AdminTableRow>
                <AdminTableHead className="w-[40%]">{copy.contentColumn}</AdminTableHead>
                <AdminTableHead className="w-[15%]">작성자</AdminTableHead>
                <AdminTableHead className="w-[35%]">신고 사유</AdminTableHead>
                {/* 시안엔 액션 컬럼 헤더 텍스트가 없다(빈 셀). 오른쪽 끝에 고정된다 */}
                <AdminTableActionHead />
              </AdminTableRow>
            </AdminTableHeader>

            <AdminTableBody>
              {data.items.map((item) => (
                <AdminTableRow key={item.id}>
                  <AdminTableTruncatedCell strong>{item.content}</AdminTableTruncatedCell>
                  <AdminTableCell>{item.author}</AdminTableCell>
                  <AdminTableTruncatedCell>
                    {/* 서버에 없는 코드가 새로 생겨도 화면이 비지 않게 코드 자체를 보여준다 */}
                    {REPORT_REASON_LABELS[item.reason] ?? item.reason}
                  </AdminTableTruncatedCell>
                  <AdminTableActionCell>
                    {MODERATION_ACTIONS.map((action) =>
                      item.status === action.value ? (
                        <AdminRowStatus key={action.value}>{action.label}</AdminRowStatus>
                      ) : (
                        <AdminRowAction
                          key={action.value}
                          disabled={updateStatus.isPending}
                          aria-label={`${item.content} ${action.label} 처리`}
                          onClick={() =>
                            updateStatus.mutate(
                              { id: item.id, status: action.value },
                              {
                                onSuccess: () => toastSuccess(`${action.label} 처리했어요.`),
                                onError: toastApiError,
                              },
                            )
                          }
                        >
                          {action.label}
                        </AdminRowAction>
                      ),
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

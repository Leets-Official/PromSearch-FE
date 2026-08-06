"use client";

import { parseAsInteger, useQueryState } from "nuqs";

import { PaginationRoot } from "@/components/ui/pagination";
import {
  AdminEmpty,
  AdminError,
  AdminTableSkeleton,
} from "@/features/admin/components/admin-states";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/features/admin/components/admin-table";
import { useOriginUserList } from "@/features/admin/hooks/use-origin-users";

/**
 * Origin 등급 유저 목록 ([ADMIN-GRADE-003]).
 *
 * 사이드바 네 번째 메뉴 자리다. **시안이 없다** — 서버가 주는 필드가 `userId`·`username`
 * 둘뿐이라 다른 어드민 표와 같은 골격(표 → 페이지네이션)으로 최소 형태만 만들었다.
 * 조회 전용이다: 등급 회수(Origin → 하향) 엔드포인트가 서버에 없다.
 *
 * 승인은 [유저 등급 관리](/admin/users)에서 하고, 여기는 승인된 결과를 확인하는 화면이다.
 */
export function OriginUserView() {
  // 탭·검색이 없어 페이지 하나만 URL 에 싣는다(다른 어드민 화면과 같은 규칙).
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const { data, isPending, isError, refetch } = useOriginUserList(page);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-heading-1 text-text-primary">Origin 유저 관리</h1>
      <p className="text-body-2 text-text-secondary">
        현재 Origin 등급인 유저 목록입니다. 승인은 유저 등급 관리에서 처리합니다.
      </p>

      {isError ? (
        <AdminError onRetry={() => void refetch()} />
      ) : isPending ? (
        <AdminTableSkeleton />
      ) : data.items.length === 0 ? (
        <AdminEmpty message="아직 Origin 등급 유저가 없어요" />
      ) : (
        <>
          <AdminTable>
            <AdminTableHeader>
              <AdminTableRow>
                <AdminTableHead className="w-[30%]">유저 ID</AdminTableHead>
                <AdminTableHead>닉네임</AdminTableHead>
              </AdminTableRow>
            </AdminTableHeader>

            <AdminTableBody>
              {data.items.map((user) => (
                <AdminTableRow key={user.id}>
                  <AdminTableCell>{user.id}</AdminTableCell>
                  <AdminTableCell className="text-text-primary">{user.nickname}</AdminTableCell>
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminTable>

          {data.totalPages > 1 ? (
            <PaginationRoot
              page={data.page}
              pageCount={data.totalPages}
              onPageChange={(next) => void setPage(next)}
              className="mt-8"
            />
          ) : null}
        </>
      )}
    </div>
  );
}

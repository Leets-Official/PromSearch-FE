/**
 * 어드민 API.
 *
 * - `[ADMIN-REPORT-001/002]` 신고 목록 조회 · 처리(숨김/유지)
 * - `[ADMIN-GRADE-001/002]`  등급업 신청 목록 조회 · 승인
 *
 * ⚠️ 네 API 모두 BE **미구현**이다(계약만 존재). 구현되면 그대로 붙도록 계약대로 작성했고,
 * 그때까지는 같은 경로의 임시 목이 응답한다.
 *
 * 서버가 지원하지 않는 축이 둘 있다(요청서 A-1 · A-3).
 * - 검색어(`q`) 파라미터가 없다 → 받아온 페이지 안에서 클라이언트 필터
 * - 신고 목록에 대상 내용/작성자가 없다 → 표에 자리표시(`map.ts`)
 */

import { ADMIN_PAGE_SIZE } from "@/features/admin/constants";
import type {
  AdminListQuery,
  GradeListResponse,
  GradeTab,
  ModerationStatus,
  ReportListResponse,
  ReportTab,
  ReportTarget,
} from "@/features/admin/types";
import { api } from "@/lib/api";

import type { ApiAdminPage, ApiGradeRequest, ApiReport, ApiReportTargetType } from "./dto";
import {
  gradeStatusParam,
  reportStatusParam,
  toAdminListResponse,
  toApiReportStatus,
  toGradeApplication,
  toReportedItem,
} from "./map";

/** 신고 대상 → 서버 targetType */
const TARGET_TYPE: Record<ReportTarget, ApiReportTargetType> = {
  post: "POST",
  comment: "COMMENT",
};

/**
 * 검색어가 걸려 있으면 서버 페이지네이션을 쓸 수 없다(서버가 q 를 모른다).
 * 한 번에 넉넉히 받아 클라이언트에서 거르고 잘라야 페이지 수가 맞는다.
 * 서버 검색(A-3)이 붙으면 이 경로는 사라진다.
 */
const CLIENT_SEARCH_SIZE = 100;

function hasSearch(query: { q: string }): boolean {
  return query.q.trim().length > 0;
}

/** 받아온 목록을 검색어로 거른 뒤 화면 페이지 크기로 자른다. */
function sliceBySearch<Item>(
  items: Item[],
  query: { q: string; page: number },
  matches: (item: Item, keyword: string) => boolean,
) {
  const keyword = query.q.trim().toLowerCase();
  const filtered = items.filter((item) => matches(item, keyword));
  const totalPages = Math.max(1, Math.ceil(filtered.length / ADMIN_PAGE_SIZE));
  const page = Math.min(Math.max(query.page, 1), totalPages);
  const start = (page - 1) * ADMIN_PAGE_SIZE;

  return {
    items: filtered.slice(start, start + ADMIN_PAGE_SIZE),
    page,
    totalPages,
    totalCount: filtered.length,
  };
}

/** [ADMIN-REPORT-001] 신고 게시글/댓글 목록 */
export async function fetchReports(
  target: ReportTarget,
  query: AdminListQuery<ReportTab>,
): Promise<ReportListResponse> {
  const searching = hasSearch(query);

  const result = await api.get<ApiAdminPage<ApiReport>>("/admin/reports", {
    params: {
      targetType: TARGET_TYPE[target],
      status: reportStatusParam(query.tab),
      page: searching ? 0 : query.page - 1,
      size: searching ? CLIENT_SEARCH_SIZE : ADMIN_PAGE_SIZE,
    },
  });

  const mapped = toAdminListResponse(result, toReportedItem);
  if (!searching) return mapped;

  // 내용·작성자로 찾는다(표에 보이는 두 컬럼).
  return sliceBySearch(
    mapped.items,
    query,
    (item, keyword) =>
      item.content.toLowerCase().includes(keyword) || item.author.toLowerCase().includes(keyword),
  );
}

/** [ADMIN-REPORT-002] 신고 처리(숨김/유지) */
export async function updateReportStatus(
  _target: ReportTarget,
  id: string,
  status: Exclude<ModerationStatus, "pending">,
): Promise<void> {
  // 처리 경로는 대상 종류와 무관하게 reportId 하나로 갈린다(서버가 신고 단위로 처리).
  await api.patch(`/admin/reports/${id}`, { status: toApiReportStatus(status) });
}

/** [ADMIN-GRADE-001] 유저 등급 신청 목록 */
export async function fetchGradeApplications(
  query: AdminListQuery<GradeTab>,
): Promise<GradeListResponse> {
  const searching = hasSearch(query);

  const result = await api.get<ApiAdminPage<ApiGradeRequest>>("/admin/grade-requests", {
    params: {
      status: gradeStatusParam(query.tab),
      page: searching ? 0 : query.page - 1,
      size: searching ? CLIENT_SEARCH_SIZE : ADMIN_PAGE_SIZE,
    },
  });

  const mapped = toAdminListResponse(result, toGradeApplication);
  if (!searching) return mapped;

  // 아이디 또는 닉네임으로 찾는다(시안 문구 기준).
  return sliceBySearch(
    mapped.items,
    query,
    (item, keyword) =>
      item.userId.toLowerCase().includes(keyword) || item.nickname.toLowerCase().includes(keyword),
  );
}

/** [ADMIN-GRADE-002] 등급 신청 승인 */
export async function approveGradeApplication(id: string): Promise<void> {
  await api.patch(`/admin/grade-requests/${id}`, { decision: "APPROVED" });
}

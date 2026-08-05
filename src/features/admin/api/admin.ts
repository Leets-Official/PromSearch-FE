/**
 * 어드민 API.
 *
 * - `[ADMIN-REPORT-001/002]` 신고 목록 조회 · 처리(숨김/유지)
 * - `[ADMIN-GRADE-001/002]`  등급업 신청 목록 조회 · 승인
 * - `[ADMIN-GRADE-003]`      Origin 등급 유저 목록
 *
 * 2026-08-06 Swagger 기준 **전부 구현 완료**다. 검색(`q`)·대상 요약·승인 지표가 모두
 * 서버에 붙어서, 예전에 FE 가 메꾸던 임시 경로(100건 받아 클라이언트 필터)는 걷어냈다.
 *
 * 남은 전제: `/admin/*` 은 ADMIN 권한 토큰이어야 200 이 온다(아니면 403).
 */

import { ADMIN_PAGE_SIZE } from "@/features/admin/constants";
import type {
  AdminListQuery,
  GradeListResponse,
  GradeTab,
  ModerationStatus,
  OriginUserListResponse,
  ReportListResponse,
  ReportTab,
  ReportTarget,
} from "@/features/admin/types";
import { api } from "@/lib/api";

import type { ApiAdminPage, ApiGradeRequest, ApiOriginUser, ApiReport } from "./dto";
import {
  gradeStatusParam,
  reportTargetTypeParam,
  reportStatusParam,
  toAdminListResponse,
  toApiReportStatus,
  toGradeApplication,
  toOriginUser,
  toReportedItem,
} from "./map";

/** 빈 검색어는 파라미터 자체를 빼야 한다(서버가 빈 문자열로 거르지 않도록) */
function searchParam(q: string): string | undefined {
  const keyword = q.trim();
  return keyword.length > 0 ? keyword : undefined;
}

/** [ADMIN-REPORT-001] 신고 게시글/댓글 목록 */
export async function fetchReports(
  target: ReportTarget,
  query: AdminListQuery<ReportTab>,
): Promise<ReportListResponse> {
  const result = await api.get<ApiAdminPage<ApiReport>>("/admin/reports", {
    params: {
      targetType: reportTargetTypeParam(target),
      status: reportStatusParam(query.tab),
      // 서버가 대상 내용(제목/본문)·작성자 닉네임 부분일치로 걸러 준다.
      q: searchParam(query.q),
      page: query.page - 1,
      size: ADMIN_PAGE_SIZE,
    },
  });

  return toAdminListResponse(result, toReportedItem);
}

/**
 * [ADMIN-REPORT-002] 신고 처리(숨김/유지)
 *
 * `targetType` 은 **필수**다 — 게시글 신고와 댓글 신고가 별도 테이블이라
 * reportId 만으로는 대상을 찾지 못한다(Swagger `UpdateReportStatusRequest`).
 */
export async function updateReportStatus(
  target: ReportTarget,
  id: string,
  status: Exclude<ModerationStatus, "pending">,
): Promise<void> {
  await api.patch(`/admin/reports/${id}`, {
    targetType: reportTargetTypeParam(target),
    status: toApiReportStatus(status),
  });
}

/** [ADMIN-GRADE-001] 유저 등급 신청 목록 */
export async function fetchGradeApplications(
  query: AdminListQuery<GradeTab>,
): Promise<GradeListResponse> {
  const result = await api.get<ApiAdminPage<ApiGradeRequest>>("/admin/grade-requests", {
    params: {
      status: gradeStatusParam(query.tab),
      // 서버가 신청자 아이디(이메일)·닉네임 부분일치로 걸러 준다.
      q: searchParam(query.q),
      page: query.page - 1,
      size: ADMIN_PAGE_SIZE,
    },
  });

  return toAdminListResponse(result, toGradeApplication);
}

/** [ADMIN-GRADE-002] 등급 신청 승인 */
export async function approveGradeApplication(id: string): Promise<void> {
  await api.patch(`/admin/grade-requests/${id}`, { decision: "APPROVED" });
}

/**
 * [ADMIN-GRADE-003] Origin 등급 유저 목록
 *
 * 서버가 검색·정렬을 지원하지 않아 페이지만 받는다(파라미터는 page·size 뿐).
 */
export async function fetchOriginUsers(page: number): Promise<OriginUserListResponse> {
  const result = await api.get<ApiAdminPage<ApiOriginUser>>("/admin/origin-users", {
    params: { page: page - 1, size: ADMIN_PAGE_SIZE },
  });

  return toAdminListResponse(result, toOriginUser);
}

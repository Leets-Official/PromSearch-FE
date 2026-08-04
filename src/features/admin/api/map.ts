/**
 * BE 응답 → 어드민 도메인 변환. 순수 함수라 단독 테스트가 가능하다.
 */

import type {
  AdminListResponse,
  GradeApplication,
  GradeTab,
  ModerationStatus,
  ReportedItem,
  ReportTab,
} from "@/features/admin/types";

import type {
  ApiAdminPage,
  ApiGradeRequest,
  ApiGradeRequestStatus,
  ApiReport,
  ApiReportStatus,
} from "./dto";

/**
 * 신고 상태 매핑 (요청서 A-1b 로 확인 요청 중인 해석).
 *
 * 표의 액션이 [숨김]/[유지] 두 개라, 신고를 인용해 대상을 감춘 것(RESOLVED)을 "숨김",
 * 기각한 것(REJECTED)을 "유지"로 본다.
 */
const REPORT_STATUS_BY_API: Record<ApiReportStatus, ModerationStatus> = {
  PENDING: "pending",
  RESOLVED: "hidden",
  REJECTED: "kept",
};

const API_BY_REPORT_STATUS: Record<Exclude<ModerationStatus, "pending">, ApiReportStatus> = {
  hidden: "RESOLVED",
  kept: "REJECTED",
};

/** FE 탭 → 서버 status 필터. "전체"는 필터 없음. */
export function reportStatusParam(tab: ReportTab): ApiReportStatus | undefined {
  return tab === "all" ? undefined : API_BY_REPORT_STATUS[tab];
}

/** 처리 액션(숨김/유지) → 서버 status */
export function toApiReportStatus(status: Exclude<ModerationStatus, "pending">): ApiReportStatus {
  return API_BY_REPORT_STATUS[status];
}

const GRADE_STATUS_BY_API: Record<ApiGradeRequestStatus, GradeTab> = {
  PENDING: "pending",
  APPROVED: "approved",
  // 반려는 FE 탭에 없다. 승인 완료 쪽에 묶어 두면 오해를 부르므로 대기로 남긴다.
  REJECTED: "pending",
};

/** FE 탭 → 서버 status 필터 */
export function gradeStatusParam(tab: GradeTab): ApiGradeRequestStatus {
  return tab === "approved" ? "APPROVED" : "PENDING";
}

export function toReportedItem(report: ApiReport): ReportedItem {
  const summary = report.targetSummary;

  return {
    id: String(report.reportId),
    // 대상 요약이 아직 응답에 없다(요청서 A-1). 그때까지는 식별자만이라도 보여준다.
    content: summary?.content ?? `#${report.targetId}`,
    author: summary?.authorNickname ?? "-",
    reason: report.reason,
    status: REPORT_STATUS_BY_API[report.status] ?? "pending",
    reportedAt: report.createdAt,
  };
}

export function toGradeApplication(request: ApiGradeRequest): GradeApplication {
  return {
    id: String(request.gradeRequestId),
    userId: String(request.userId),
    nickname: request.nickname ?? request.username,
    // 승인 판단 지표도 아직 없다(요청서 A-2) → 0 으로 두고 표에 그대로 노출한다.
    postCount: request.postCount ?? 0,
    likeCount: request.totalLikeCount ?? 0,
    appliedAt: request.requestedAt,
    status: GRADE_STATUS_BY_API[request.status] ?? "pending",
  };
}

/** 서버 페이지(0-based) → 화면 페이지(1-based) */
export function toAdminListResponse<Api, Item>(
  page: ApiAdminPage<Api>,
  map: (item: Api) => Item,
): AdminListResponse<Item> {
  return {
    items: page.content.map(map),
    page: page.page + 1,
    totalPages: Math.max(1, page.totalPages),
    totalCount: page.totalElements,
  };
}

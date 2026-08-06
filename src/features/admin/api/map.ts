/**
 * BE 응답 → 어드민 도메인 변환. 순수 함수라 단독 테스트가 가능하다.
 */

import type {
  AdminListResponse,
  GradeApplication,
  GradeTab,
  ModerationStatus,
  OriginUser,
  ReportedItem,
  ReportTab,
  ReportTarget,
} from "@/features/admin/types";

import { toNumber } from "@/lib/api";
import type {
  ApiAdminPage,
  ApiGradeRequest,
  ApiGradeRequestStatus,
  ApiOriginUser,
  ApiReport,
  ApiReportStatus,
  ApiReportTargetType,
} from "./dto";

/** 신고 대상 → 서버 targetType. 목록 필터와 처리 요청 본문에 모두 쓰인다. */
const TARGET_TYPE: Record<ReportTarget, ApiReportTargetType> = {
  post: "POST",
  comment: "COMMENT",
};

export function reportTargetTypeParam(target: ReportTarget): ApiReportTargetType {
  return TARGET_TYPE[target];
}

/**
 * 신고 상태 매핑.
 *
 * 표의 액션이 [숨김]/[유지] 두 개라, 신고를 인용해 대상을 감춘 것(RESOLVED)을 "숨김",
 * 기각한 것(REJECTED)을 "유지"로 본다.
 * (Swagger: RESOLVED 로 바꾸면 대상 게시글/댓글이 실제로 블라인드된다 — 해석이 맞다)
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
    // 대상이 이미 지워졌으면 요약이 비어 올 수 있다 → 식별자만이라도 보여준다.
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
    // 지표가 비어 오는 계정(게시글 0개 등)은 0 으로 둔다.
    postCount: toNumber(request.postCount),
    likeCount: toNumber(request.totalLikeCount),
    appliedAt: request.requestedAt,
    status: GRADE_STATUS_BY_API[request.status] ?? "pending",
  };
}

export function toOriginUser(user: ApiOriginUser): OriginUser {
  return {
    id: String(user.userId),
    // 필드 이름은 username 이지만 스웨거 설명상 닉네임이다.
    nickname: user.username,
  };
}

/** 서버 페이지(0-based) → 화면 페이지(1-based) */
export function toAdminListResponse<Api, Item>(
  page: ApiAdminPage<Api>,
  map: (item: Api) => Item,
): AdminListResponse<Item> {
  return {
    items: page.content.map(map),
    // 숫자를 문자열로 내려주던 시기가 있어 방어를 유지한다 — "0" + 1 이 "01" 이 된다(lib/api/number.ts).
    page: toNumber(page.page) + 1,
    totalPages: Math.max(1, toNumber(page.totalPages, 1)),
    totalCount: toNumber(page.totalElements),
  };
}

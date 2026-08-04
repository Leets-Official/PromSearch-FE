/**
 * 어드민 API 응답 목 — **BE 미구현 대응**.
 *
 * `ADMIN-REPORT-001/002` · `ADMIN-GRADE-001/002` 는 Swagger 에 계약만 있고 구현이 없다(501).
 * 화면은 완성돼 있으므로 계약 그대로 흉내 내고, BE 가 구현하면 이 파일과 핸들러를 지우면 된다.
 *
 * 응답 모양이 Swagger 와 같아서(`ApiAdminPage`) `admin/api/map.ts` 의 상태 매핑·페이지 변환이
 * 실제 계약대로 검증된다. 데이터는 기존 어드민 시드를 서버 모양으로 되돌려 쓴다.
 *
 * ⚠️ 요청서 A-1(신고 대상 요약)·A-2(등급 신청 지표)는 **아직 서버에 없는 필드**다.
 * 목에서 임의로 채우면 화면이 "다 되는 것처럼" 보여 누락을 못 잡으므로, **일부러 비워 둔다**
 * (표에 `#12`, `-`, `0` 으로 뜨는 게 지금 실제 서버 응답으로 만들 수 있는 최선이다).
 */

import type {
  ApiAdminPage,
  ApiGradeRequest,
  ApiGradeRequestStatus,
  ApiReport,
  ApiReportStatus,
  ApiReportTargetType,
} from "@/features/admin/api/dto";
import type { GradeApplication, ModerationStatus, ReportedItem } from "@/features/admin/types";
import {
  GRADE_APPLICATION_SEED,
  REPORTED_COMMENT_SEED,
  REPORTED_POST_SEED,
} from "@/mocks/data/admin";

const REPORT_STATUS_TO_API: Record<ModerationStatus, ApiReportStatus> = {
  pending: "PENDING",
  hidden: "RESOLVED",
  kept: "REJECTED",
};

/** 시드(도메인 모양) → 서버 신고 응답 */
function toApiReport(
  item: ReportedItem,
  index: number,
  targetType: ApiReportTargetType,
): ApiReport {
  return {
    reportId: index + 1 + (targetType === "COMMENT" ? 1000 : 0),
    targetType,
    targetId: index + 1,
    reason: item.reason,
    description: null,
    status: REPORT_STATUS_TO_API[item.status],
    reporterId: (index % 5) + 1,
    createdAt: item.reportedAt,
    // targetSummary 는 의도적으로 넣지 않는다(요청서 A-1 미반영 상태를 그대로 드러낸다)
  };
}

const GRADE_STATUS_TO_API: Record<GradeApplication["status"], ApiGradeRequestStatus> = {
  pending: "PENDING",
  approved: "APPROVED",
};

function toApiGradeRequest(item: GradeApplication, index: number): ApiGradeRequest {
  return {
    gradeRequestId: index + 1,
    userId: index + 1,
    username: item.userId,
    currentGrade: "PRIME",
    requestedGrade: "ORIGIN",
    status: GRADE_STATUS_TO_API[item.status],
    requestedAt: item.appliedAt,
    processedAt: item.status === "approved" ? item.appliedAt : null,
    // nickname · postCount · totalLikeCount 도 넣지 않는다(요청서 A-2 미반영)
  };
}

/** 처리 상태를 반영해야 해서 인메모리로 들고 있는다(새로고침하면 시드로 돌아간다). */
const reports = {
  POST: REPORTED_POST_SEED.map((item, i) => toApiReport(item, i, "POST")),
  COMMENT: REPORTED_COMMENT_SEED.map((item, i) => toApiReport(item, i, "COMMENT")),
};
const gradeRequests = GRADE_APPLICATION_SEED.map(toApiGradeRequest);

/** 서버와 같은 오프셋 페이지네이션(0-based) + totalPages */
function paginate<T>(rows: T[], page: number, size: number): ApiAdminPage<T> {
  const start = page * size;
  return {
    content: rows.slice(start, start + size),
    page,
    size,
    totalElements: rows.length,
    totalPages: Math.max(1, Math.ceil(rows.length / size)),
    hasNext: start + size < rows.length,
  };
}

/** [ADMIN-REPORT-001] 신고 목록 — 접수 최신순 */
export function listReports(
  targetType: ApiReportTargetType,
  status: ApiReportStatus | null,
  page: number,
  size: number,
) {
  const rows = reports[targetType]
    .filter((report) => !status || report.status === status)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  return paginate(rows, page, size);
}

/** [ADMIN-REPORT-002] 신고 처리 — PENDING 으로는 되돌릴 수 없다 */
export function moderateReport(reportId: number, status: ApiReportStatus): ApiReport | null {
  const found = [...reports.POST, ...reports.COMMENT].find((r) => r.reportId === reportId);
  if (!found) return null;
  found.status = status;
  return found;
}

/** [ADMIN-GRADE-001] 등급 신청 목록 — 신청 최신순 */
export function listGradeRequests(status: ApiGradeRequestStatus, page: number, size: number) {
  const rows = gradeRequests
    .filter((request) => request.status === status)
    .sort((a, b) => Date.parse(b.requestedAt) - Date.parse(a.requestedAt));

  return paginate(rows, page, size);
}

/** [ADMIN-GRADE-002] 승인/반려 */
export function decideGradeRequest(
  requestId: number,
  decision: ApiGradeRequestStatus,
): ApiGradeRequest | null {
  const found = gradeRequests.find((request) => request.gradeRequestId === requestId);
  if (!found) return null;
  found.status = decision;
  found.processedAt = new Date().toISOString();
  return found;
}

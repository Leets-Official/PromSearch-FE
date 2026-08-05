import { http, HttpResponse } from "msw";

import type {
  ApiGradeRequestStatus,
  ApiReportStatus,
  ApiReportTargetType,
} from "@/features/admin/api/dto";
import {
  decideGradeRequest,
  listGradeRequests,
  listReports,
  moderateReport,
} from "@/mocks/admin-api";

/**
 * API 목 핸들러. 브라우저(개발)와 Node(테스트)에서 공유한다.
 *
 * **남아 있는 건 어드민뿐이다.** 홈·상세·업로드는 목이 없어 실서버로 직접 나간다.
 * 어드민 4개(`ADMIN-REPORT-001/002`, `ADMIN-GRADE-001/002`)는 Swagger 에 계약만 있고
 * BE 가 아직 미구현(501)이라, 계약 그대로 흉내 내 화면을 개발할 수 있게 한다.
 * BE 구현이 끝나면 이 파일과 `mocks/admin-api.ts` 를 지우면 그대로 실서버에 붙는다.
 */

/** BE 공통 응답 봉투로 감싼다(`api.*` 헬퍼가 `result` 만 꺼내 쓴다). */
function jsonEnvelope<T>(result: T, status = 200) {
  return HttpResponse.json(
    { success: true, code: "COMMON-200", message: "성공했습니다.", result },
    { status },
  );
}

/** 실패 응답도 같은 봉투 규격을 지킨다(`success: false`) — 에러 정규화 경로 검증용. */
function errorEnvelope(status: number, code: string, message: string) {
  return HttpResponse.json({ success: false, code, message }, { status });
}

export const handlers = [
  // [ADMIN-REPORT-001] 신고 목록
  http.get("/api/v1/admin/reports", ({ request }) => {
    const params = new URL(request.url).searchParams;
    return jsonEnvelope(
      listReports(
        (params.get("targetType") as ApiReportTargetType) ?? "POST",
        params.get("status") as ApiReportStatus | null,
        Number(params.get("page") ?? "0"),
        Number(params.get("size") ?? "20"),
      ),
    );
  }),

  // [ADMIN-REPORT-002] 신고 처리 — PENDING 으로는 되돌릴 수 없다
  http.patch("/api/v1/admin/reports/:reportId", async ({ params, request }) => {
    const body = (await request.json()) as { status?: ApiReportStatus };
    if (body.status !== "RESOLVED" && body.status !== "REJECTED") {
      return errorEnvelope(400, "COMMON-400", "잘못된 요청입니다.");
    }
    const updated = moderateReport(Number(params.reportId), body.status);
    if (!updated) return errorEnvelope(404, "COMMON-404", "신고를 찾을 수 없습니다.");
    return jsonEnvelope(updated);
  }),

  // [ADMIN-GRADE-001] 등급업 신청 목록
  http.get("/api/v1/admin/grade-requests", ({ request }) => {
    const params = new URL(request.url).searchParams;
    return jsonEnvelope(
      listGradeRequests(
        (params.get("status") as ApiGradeRequestStatus) ?? "PENDING",
        Number(params.get("page") ?? "0"),
        Number(params.get("size") ?? "20"),
      ),
    );
  }),

  // [ADMIN-GRADE-002] 등급업 신청 승인/반려
  http.patch("/api/v1/admin/grade-requests/:requestId", async ({ params, request }) => {
    const body = (await request.json()) as { decision?: ApiGradeRequestStatus };
    if (body.decision !== "APPROVED" && body.decision !== "REJECTED") {
      return errorEnvelope(400, "COMMON-400", "잘못된 요청입니다.");
    }
    const updated = decideGradeRequest(Number(params.requestId), body.decision);
    if (!updated) return errorEnvelope(404, "COMMON-404", "신청을 찾을 수 없습니다.");
    return jsonEnvelope(updated);
  }),
];

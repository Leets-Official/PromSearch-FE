/**
 * 어드민 API.
 *
 * 현재는 MSW 목(`/api/admin/*`)을 호출한다. BE 스펙 확정 시 이 파일의 경로/응답 매핑만 교체한다.
 */

import type {
  AdminListQuery,
  GradeListResponse,
  GradeTab,
  ModerationStatus,
  ReportListResponse,
  ReportTab,
  ReportTarget,
} from "@/features/admin/types";

/** 신고 대상 → 목록/처리 엔드포인트. posts/comments 두 화면이 같은 계약을 쓴다. */
const REPORT_PATH: Record<ReportTarget, string> = {
  post: "/api/admin/reports/posts",
  comment: "/api/admin/reports/comments",
};

/**
 * 어드민 목록 조회 파라미터 → 쿼리스트링.
 * 기본값(첫 탭·빈 검색어·page 1)은 생략해 URL 을 깔끔하게 유지한다(갤러리와 동일 규칙).
 */
export function toAdminSearchParams<Tab extends string>(
  query: AdminListQuery<Tab>,
  defaultTab: Tab,
): URLSearchParams {
  const params = new URLSearchParams();

  if (query.tab !== defaultTab) params.set("tab", query.tab);
  if (query.q.trim()) params.set("q", query.q.trim());
  if (query.page > 1) params.set("page", String(query.page));

  return params;
}

async function getJson<T>(path: string, params: URLSearchParams): Promise<T> {
  const qs = params.toString();
  const res = await fetch(`${path}${qs ? `?${qs}` : ""}`);

  if (!res.ok) {
    throw new Error(`어드민 목록 조회 실패: ${res.status}`);
  }

  return (await res.json()) as T;
}

/** 신고 게시글/댓글 목록 */
export function fetchReports(
  target: ReportTarget,
  query: AdminListQuery<ReportTab>,
): Promise<ReportListResponse> {
  return getJson<ReportListResponse>(REPORT_PATH[target], toAdminSearchParams(query, "all"));
}

/** 신고 처리(숨김/유지) */
export async function updateReportStatus(
  target: ReportTarget,
  id: string,
  status: Exclude<ModerationStatus, "pending">,
): Promise<void> {
  const res = await fetch(`${REPORT_PATH[target]}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error(`신고 처리 실패: ${res.status}`);
  }
}

/** 유저 등급 신청 목록 */
export function fetchGradeApplications(
  query: AdminListQuery<GradeTab>,
): Promise<GradeListResponse> {
  return getJson<GradeListResponse>(
    "/api/admin/users/grade-applications",
    toAdminSearchParams(query, "pending"),
  );
}

/** 등급 신청 승인 */
export async function approveGradeApplication(id: string): Promise<void> {
  const res = await fetch(`/api/admin/users/grade-applications/${id}/approve`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error(`등급 승인 실패: ${res.status}`);
  }
}

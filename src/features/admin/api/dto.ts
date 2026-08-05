/**
 * 어드민 API 응답 타입 — Swagger `result` 안쪽만 그대로 옮긴다.
 *
 * - `[ADMIN-REPORT-001] GET   /admin/reports`
 * - `[ADMIN-REPORT-002] PATCH /admin/reports/{reportId}`
 * - `[ADMIN-GRADE-001]  GET   /admin/grade-requests`
 * - `[ADMIN-GRADE-002]  PATCH /admin/grade-requests/{requestId}`
 * - `[ADMIN-GRADE-003]  GET   /admin/origin-users`
 *
 * 다섯 API 모두 **구현 완료**다(2026-08-06 Swagger 확인). 요청서 A-1(대상 요약)·A-2(승인 지표)·
 * A-3(검색 `q`) 도 모두 반영됐다. 옵셔널로 남겨 둔 필드는 서버가 값을 못 채우는 경우
 * (삭제된 대상 등)를 위한 방어이지, "아직 안 온다"는 뜻이 아니다.
 */

/** 신고 대상 종류 — 표 구성은 같고 첫 컬럼 라벨만 다르다 */
export type ApiReportTargetType = "POST" | "COMMENT";

/** 신고 처리 상태. FE 의 미처리/숨김/유지와 1:1 (map.ts 참고) */
export type ApiReportStatus = "PENDING" | "RESOLVED" | "REJECTED";

/** 신고 사유 코드 — 신고 모달(MODERATION-001/002)과 같은 enum */
export type ApiReportReason = "SPAM" | "INAPPROPRIATE" | "COPYRIGHT" | "LOW_QUALITY" | "ETC";

/** 신고 대상 요약 (요청서 A-1 → 반영 완료) */
export type ApiReportTargetSummary = {
  /** POST 면 제목, COMMENT 면 본문 */
  content: string;
  authorId: number;
  authorNickname: string;
  /** 이미 삭제/블라인드된 대상 */
  deleted?: boolean;
};

export type ApiReport = {
  reportId: number;
  targetType: ApiReportTargetType;
  targetId: number;
  reason: ApiReportReason;
  description?: string | null;
  status: ApiReportStatus;
  reporterId: number;
  createdAt: string;
  /** 대상이 이미 지워졌으면 서버가 못 채울 수 있다 → 자리표시로 렌더한다 */
  targetSummary?: ApiReportTargetSummary;
};

/** 어드민 목록 공통 페이지 메타 — 홈(`PageMeta`)과 달리 totalPages 가 온다 */
export type ApiAdminPage<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};

/** 유저 등급 — 서비스 등급 사다리(NODE → … → PRIME) + 관리자 승인 등급(ORIGIN) */
export type ApiGrade = "NODE" | "LINK" | "SYNC" | "CORE" | "PRIME" | "ORIGIN";

/** 등급업 신청 처리 상태 */
export type ApiGradeRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ApiGradeRequest = {
  gradeRequestId: number;
  userId: number;
  /** 로그인 아이디(이메일) */
  username: string;
  nickname?: string;
  currentGrade: ApiGrade;
  requestedGrade: ApiGrade;
  status: ApiGradeRequestStatus;
  requestedAt: string;
  processedAt?: string | null;
  /** 승인 판단 지표 (요청서 A-2 → 반영 완료) */
  postCount?: number;
  totalLikeCount?: number;
};

/** [ADMIN-GRADE-002] 승인/반려 요청 본문 */
export type ApiGradeDecision = "APPROVED" | "REJECTED";

/** [ADMIN-GRADE-003] Origin 등급 유저 1행 — 스웨거상 필드가 둘뿐이다 */
export type ApiOriginUser = {
  userId: number;
  /** 스웨거 설명은 "닉네임" — 이름만 `username` 이다 */
  username: string;
};

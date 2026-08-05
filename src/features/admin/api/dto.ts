/**
 * 어드민 API 응답 타입 — Swagger `result` 안쪽만 그대로 옮긴다.
 *
 * - `[ADMIN-REPORT-001] GET   /admin/reports`
 * - `[ADMIN-REPORT-002] PATCH /admin/reports/{reportId}`
 * - `[ADMIN-GRADE-001]  GET   /admin/grade-requests`
 * - `[ADMIN-GRADE-002]  PATCH /admin/grade-requests/{requestId}`
 *
 * ⚠️ **네 API 모두 BE "미구현"** 상태다(계약만 존재, 501 이 올 수 있다).
 * 화면은 이미 완성돼 있어 계약대로 붙여 두고, 구현되면 그대로 동작하게 한다.
 */

/** 신고 대상 종류 — 표 구성은 같고 첫 컬럼 라벨만 다르다 */
export type ApiReportTargetType = "POST" | "COMMENT";

/** 신고 처리 상태. FE 의 미처리/숨김/유지와 1:1 (map.ts 참고) */
export type ApiReportStatus = "PENDING" | "RESOLVED" | "REJECTED";

/**
 * 신고 대상 요약 — **요청서 A-1 로 추가 요청 중인 필드**.
 *
 * 현재 응답에는 `targetId`(숫자)만 있어 표의 "내용 / 작성자" 컬럼을 채울 수 없다.
 * 서버가 넣어주기 전까지는 `undefined` 로 오고, FE 는 자리표시로 렌더한다.
 */
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
  /** 신고 사유 코드. enum 값 목록은 BE 회신 대기(요청서 D-3) */
  reason: string;
  description?: string | null;
  status: ApiReportStatus;
  reporterId: number;
  createdAt: string;
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

export type ApiGrade = "NORMAL" | "PRIME" | "ORIGIN";

/** 등급업 신청 처리 상태 */
export type ApiGradeRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ApiGradeRequest = {
  gradeRequestId: number;
  userId: number;
  username: string;
  /** 요청서 A-2 로 추가 요청 중 — 없으면 표에 "-" 로 뜬다 */
  nickname?: string;
  currentGrade: ApiGrade;
  requestedGrade: ApiGrade;
  status: ApiGradeRequestStatus;
  requestedAt: string;
  processedAt?: string | null;
  /** 승인 판단 지표 — 요청서 A-2 로 추가 요청 중 */
  postCount?: number;
  totalLikeCount?: number;
};

/** [ADMIN-GRADE-002] 승인/반려 요청 본문 */
export type ApiGradeDecision = "APPROVED" | "REJECTED";

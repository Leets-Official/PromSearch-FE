/**
 * 어드민 도메인 타입.
 *
 * 시안(Figma 관리자 551:3669 / 1434:6473 / 1434:5839) 기준:
 * - 신고 게시글 / 신고 댓글: 같은 표 구조(내용 · 작성자 · 신고 사유 · [숨김][유지])
 * - 유저 등급 관리: 아이디 · 게시글 · 누적 추천 · 신청일자 · [승인]
 *
 * 실 엔드포인트(`/api/v1/admin/*`)에 붙어 있다. 서버 enum·페이지 변환은 `api/map.ts` 담당.
 */

import type { ApiReportReason } from "@/features/admin/api/dto";

/** 신고 처리 상태 — 미처리(pending) / 숨김(hidden) / 유지(kept) */
export type ModerationStatus = "pending" | "hidden" | "kept";

/** 신고 대상 종류 — 표 구성이 같고 첫 컬럼 라벨과 엔드포인트만 다르다 */
export type ReportTarget = "post" | "comment";

/** 신고 목록 탭 — 시안 "전체 / 숨김 / 유지" */
export type ReportTab = "all" | "hidden" | "kept";

/** 신고된 게시글·댓글 1행 */
export type ReportedItem = {
  id: string;
  /** 게시글이면 제목, 댓글이면 댓글 내용 */
  content: string;
  /** 작성자 아이디 */
  author: string;
  /** 신고 사유 코드 — 표에는 `REPORT_REASON_LABELS` 로 한글 라벨을 그린다 */
  reason: ApiReportReason;
  status: ModerationStatus;
  /** 신고 접수 시각(ISO) — 최신순 정렬 기준 */
  reportedAt: string;
};

/** 유저 등급 신청 목록 탭 — 시안 "심사 대기중 / 승인 완료" */
export type GradeTab = "pending" | "approved";

/** 등급 신청 1행 */
export type GradeApplication = {
  id: string;
  /** 신청자 아이디 */
  userId: string;
  /** 닉네임 — 검색(아이디 또는 닉네임) 대상 */
  nickname: string;
  /** 작성 게시글 수 */
  postCount: number;
  /** 누적 추천 수 */
  likeCount: number;
  /** 신청일자(ISO) */
  appliedAt: string;
  status: GradeTab;
};

/** 어드민 목록 공통 조회 파라미터(탭 · 검색 · 페이지) */
export type AdminListQuery<Tab extends string> = {
  tab: Tab;
  q: string;
  page: number;
};

/** 목록 응답(페이지네이션) — 갤러리와 동일한 형태를 유지한다 */
export type AdminListResponse<Item> = {
  items: Item[];
  /** 현재 페이지(1-based) */
  page: number;
  totalPages: number;
  totalCount: number;
};

/** Origin 등급 유저 1행 (ADMIN-GRADE-003) — 서버가 주는 필드가 둘뿐이다 */
export type OriginUser = {
  id: string;
  nickname: string;
};

export type ReportListResponse = AdminListResponse<ReportedItem>;
export type GradeListResponse = AdminListResponse<GradeApplication>;
export type OriginUserListResponse = AdminListResponse<OriginUser>;

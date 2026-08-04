/**
 * 어드민 도메인 타입.
 *
 * 시안(Figma 관리자 551:3669 / 1434:6473 / 1434:5839) 기준:
 * - 신고 게시글 / 신고 댓글: 같은 표 구조(내용 · 작성자 · 신고 사유 · [숨김][유지])
 * - 유저 등급 관리: 아이디 · 게시글 · 누적 추천 · 신청일자 · [승인]
 *
 * BE 스펙 확정 전이라 MSW 목(`/api/admin/*`)으로 동작한다. 응답 매핑만 `api/admin.ts` 에서 교체한다.
 */

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
  /** 신고 사유(BE 에서 코드가 확정되면 라벨 매핑 추가) */
  reason: string;
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

export type ReportListResponse = AdminListResponse<ReportedItem>;
export type GradeListResponse = AdminListResponse<GradeApplication>;

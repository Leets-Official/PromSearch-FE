import type { GradeTab, ModerationStatus, ReportTab, ReportTarget } from "@/features/admin/types";

/** 어드민 표 1페이지 행 수 — 시안(551:3682) 이 8행이다 */
export const ADMIN_PAGE_SIZE = 8;

/** 사이드바 메뉴 — 시안 Side bar(551:3673) 순서 그대로 */
export const ADMIN_NAV_ITEMS = [
  { href: "/admin/reports/posts", label: "신고 게시글 관리" },
  { href: "/admin/reports/comments", label: "신고 댓글 관리" },
  { href: "/admin/users", label: "유저 등급 관리" },
  { href: "/admin/accounts", label: "어드민 계정 관리" },
] as const;

/** 신고 목록 탭 */
export const REPORT_TABS = [
  { value: "all", label: "전체" },
  { value: "hidden", label: "숨김" },
  { value: "kept", label: "유지" },
] as const satisfies readonly { value: ReportTab; label: string }[];

export const REPORT_TAB_VALUES = REPORT_TABS.map((t) => t.value);

/** 행 액션(=처리 결과) — 시안의 [숨김][유지] 텍스트 버튼 */
export const MODERATION_ACTIONS = [
  { value: "hidden", label: "숨김" },
  { value: "kept", label: "유지" },
] as const satisfies readonly { value: Exclude<ModerationStatus, "pending">; label: string }[];

/** 등급 신청 탭 */
export const GRADE_TABS = [
  { value: "pending", label: "심사 대기중" },
  { value: "approved", label: "승인 완료" },
] as const satisfies readonly { value: GradeTab; label: string }[];

export const GRADE_TAB_VALUES = GRADE_TABS.map((t) => t.value);

/** 신고 대상별 화면 문구 — 두 화면이 같은 표 컴포넌트를 공유한다 */
export const REPORT_TARGET_COPY = {
  post: { heading: "신고 게시글", contentColumn: "제목" },
  comment: { heading: "신고 댓글", contentColumn: "댓글 내용" },
} as const satisfies Record<ReportTarget, { heading: string; contentColumn: string }>;

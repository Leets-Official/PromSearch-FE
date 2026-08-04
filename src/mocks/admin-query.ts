/**
 * 어드민 목록 질의 의미(순수 함수).
 *
 * 목 핸들러와 테스트가 공유한다. 실제 BE 가 서버에서 수행할 규칙이므로
 * "탭 필터 / 검색 / 정렬 / 페이지네이션 계약"을 여기에 못 박고 테스트로 고정한다.
 *
 * 규칙:
 * - 신고 탭: all=전체, hidden/kept=해당 처리 상태만 (pending 은 "전체"에서만 보인다)
 * - 등급 탭: pending=심사 대기중, approved=승인 완료
 * - q: 신고=내용/작성자, 등급=아이디/닉네임 에 대소문자 무시 부분일치
 * - 정렬: 접수/신청 시각 내림차순(최신 먼저)
 * - 페이지네이션: 1-based, 기본 size=ADMIN_PAGE_SIZE(8)
 * - page 가 범위를 벗어나면 빈 배열(totalPages 는 최소 1)
 */

import { ADMIN_PAGE_SIZE } from "@/features/admin/constants";
import type {
  AdminListQuery,
  AdminListResponse,
  GradeApplication,
  GradeTab,
  ReportedItem,
  ReportTab,
} from "@/features/admin/types";

type QueryParams<Tab extends string> = AdminListQuery<Tab> & { size?: number };

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/** 정렬(최신순) → 페이지 잘라내기. 목록 응답 형태는 갤러리와 동일하다. */
function paginate<Item>(
  items: Item[],
  page: number,
  size: number,
  sortKey: (item: Item) => string,
): AdminListResponse<Item> {
  const sorted = [...items].sort((a, b) => sortKey(b).localeCompare(sortKey(a)));
  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / size));
  const current = Math.max(1, page);
  const start = (current - 1) * size;

  return {
    items: sorted.slice(start, start + size),
    page: current,
    totalPages,
    totalCount,
  };
}

/** 신고 게시글/댓글 목록 질의 */
export function queryReports(
  records: ReportedItem[],
  params: QueryParams<ReportTab>,
): AdminListResponse<ReportedItem> {
  const q = normalize(params.q);
  const filtered = records.filter((item) => {
    if (params.tab !== "all" && item.status !== params.tab) return false;
    if (!q) return true;
    return normalize(item.content).includes(q) || normalize(item.author).includes(q);
  });

  return paginate(filtered, params.page, params.size ?? ADMIN_PAGE_SIZE, (item) => item.reportedAt);
}

/** 유저 등급 신청 목록 질의 */
export function queryGradeApplications(
  records: GradeApplication[],
  params: QueryParams<GradeTab>,
): AdminListResponse<GradeApplication> {
  const q = normalize(params.q);
  const filtered = records.filter((item) => {
    if (item.status !== params.tab) return false;
    if (!q) return true;
    return normalize(item.userId).includes(q) || normalize(item.nickname).includes(q);
  });

  return paginate(filtered, params.page, params.size ?? ADMIN_PAGE_SIZE, (item) => item.appliedAt);
}

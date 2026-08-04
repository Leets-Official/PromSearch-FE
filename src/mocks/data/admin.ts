/**
 * 어드민 목 시드 데이터.
 *
 * BE 스펙 확정 전까지 이 데이터로 신고 목록/등급 신청 목록의 탭·검색·페이지네이션을 개발·검증한다.
 * 상태(pending/hidden/kept, pending/approved)를 섞어 두어 탭 필터 규칙을 눈으로 확인할 수 있다.
 *
 * 핸들러가 처리(숨김/유지/승인)를 반영해야 하므로 `let` 배열 + 갱신 함수로 노출한다
 * (목 전용 인메모리 상태 — 새로고침하면 시드로 돌아간다).
 */

import type { GradeApplication, ModerationStatus, ReportedItem } from "@/features/admin/types";

const REPORT_REASONS = ["스팸/광고", "욕설/비방", "음란물", "저작권 침해", "허위 정보"] as const;

const AUTHORS = ["abc123", "prompt_master", "designer_kim", "dev_lee", "student99"] as const;

const POST_TITLES = [
  "마케팅 카피 생성 프롬프트",
  "코드 리뷰 자동화 프롬프트",
  "이력서 첨삭 프롬프트",
  "회의록 요약 프롬프트",
  "SNS 썸네일 생성 프롬프트",
  "블로그 아웃라인 작성 프롬프트",
  "제품 상세페이지 문구 프롬프트",
  "영어 이메일 교정 프롬프트",
  "데이터 분석 리포트 프롬프트",
  "여행 일정 추천 프롬프트",
] as const;

const COMMENT_BODIES = [
  "와 프롬프트 퀄리티 실화?",
  "이거 그대로 썼는데 결과가 이상하게 나와요",
  "광고 링크 도배합니다 신고합니다",
  "작성자님 다른 프롬프트도 올려주세요",
  "이 내용 다른 곳에서 그대로 복사한 것 같은데요",
  "설명이 너무 불친절합니다",
  "덕분에 업무 시간 절반으로 줄었어요",
  "무단 도용 아닌가요?",
  "예시 결과물 좀 더 보여주세요",
  "정보가 사실과 다릅니다",
] as const;

// 상태를 3종으로 순환시켜 탭(전체/숨김/유지) 결과가 모두 비어 있지 않게 만든다.
const MODERATION_STATUSES: ModerationStatus[] = ["pending", "hidden", "kept"];

/** 결정론적 시드 — 목/테스트가 매번 같은 결과를 보도록 인덱스 기반으로만 만든다. */
function buildReports(prefix: string, contents: readonly string[], count: number): ReportedItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i + 1}`,
    content: contents[i % contents.length],
    author: AUTHORS[i % AUTHORS.length],
    reason: REPORT_REASONS[i % REPORT_REASONS.length],
    status: MODERATION_STATUSES[i % MODERATION_STATUSES.length],
    // 최신순 정렬을 확인할 수 있도록 하루씩 과거로 내려간다.
    reportedAt: new Date(Date.UTC(2026, 6, 23) - i * 86_400_000).toISOString(),
  }));
}

function buildGradeApplications(count: number): GradeApplication[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `grade-${i + 1}`,
    userId: AUTHORS[i % AUTHORS.length] + (i < AUTHORS.length ? "" : String(i)),
    nickname: `프롬프터${i + 1}`,
    postCount: 100 + i * 7,
    likeCount: 1200 + i * 133,
    appliedAt: new Date(Date.UTC(2026, 6, 23) - i * 86_400_000).toISOString(),
    // 앞쪽 2/3 는 대기, 나머지는 승인 완료 — 두 탭 모두 데이터가 있게.
    status: i % 3 === 2 ? "approved" : "pending",
  }));
}

export const REPORTED_POST_SEED: ReportedItem[] = buildReports("post", POST_TITLES, 23);
export const REPORTED_COMMENT_SEED: ReportedItem[] = buildReports("comment", COMMENT_BODIES, 19);
export const GRADE_APPLICATION_SEED: GradeApplication[] = buildGradeApplications(17);

/** 핸들러가 처리 결과를 반영하는 인메모리 상태(목 전용) */
export const adminStore = {
  posts: [...REPORTED_POST_SEED],
  comments: [...REPORTED_COMMENT_SEED],
  gradeApplications: [...GRADE_APPLICATION_SEED],
};

/** 신고 처리 — 대상 행의 상태를 바꾼다. 없는 id 면 false. */
export function setReportStatus(
  list: ReportedItem[],
  id: string,
  status: Exclude<ModerationStatus, "pending">,
): boolean {
  const index = list.findIndex((item) => item.id === id);
  if (index < 0) return false;
  list[index] = { ...list[index], status };
  return true;
}

/** 등급 승인 — 대상 신청을 approved 로 바꾼다. 없는 id 면 false. */
export function approveGrade(list: GradeApplication[], id: string): boolean {
  const index = list.findIndex((item) => item.id === id);
  if (index < 0) return false;
  list[index] = { ...list[index], status: "approved" };
  return true;
}

import { describe, expect, it } from "vitest";

import { queryGradeApplications, queryReports } from "@/mocks/admin-query";
import type { GradeApplication, ReportedItem } from "@/features/admin/types";

/**
 * 어드민 목록 질의 계약(탭 필터 · 검색 · 정렬 · 페이지네이션)을 고정한다.
 * 조건을 반대로 짜면 깨지도록 긍정/부정 케이스를 함께 넣는다.
 */

const REPORTS: ReportedItem[] = [
  {
    id: "r1",
    content: "마케팅 카피 생성 프롬프트",
    author: "abc123",
    reason: "스팸/광고",
    status: "pending",
    reportedAt: "2026-07-23T00:00:00.000Z",
  },
  {
    id: "r2",
    content: "코드 리뷰 자동화 프롬프트",
    author: "dev_lee",
    reason: "욕설/비방",
    status: "hidden",
    reportedAt: "2026-07-22T00:00:00.000Z",
  },
  {
    id: "r3",
    content: "이력서 첨삭 프롬프트",
    author: "abc123",
    reason: "허위 정보",
    status: "kept",
    reportedAt: "2026-07-21T00:00:00.000Z",
  },
];

const APPLICATIONS: GradeApplication[] = [
  {
    id: "g1",
    userId: "abc123",
    nickname: "프롬프터1",
    postCount: 100,
    likeCount: 1200,
    appliedAt: "2026-07-23T00:00:00.000Z",
    status: "pending",
  },
  {
    id: "g2",
    userId: "dev_lee",
    nickname: "코드장인",
    postCount: 42,
    likeCount: 800,
    appliedAt: "2026-07-22T00:00:00.000Z",
    status: "approved",
  },
  {
    id: "g3",
    userId: "student99",
    nickname: "학생",
    postCount: 12,
    likeCount: 300,
    appliedAt: "2026-07-24T00:00:00.000Z",
    status: "pending",
  },
];

describe("queryReports", () => {
  it("탭 all 은 처리 상태와 무관하게 모두 노출한다", () => {
    const result = queryReports(REPORTS, { tab: "all", q: "", page: 1 });

    expect(result.totalCount).toBe(3);
    expect(result.items.map((i) => i.id)).toEqual(["r1", "r2", "r3"]); // 최신순
  });

  it("탭 hidden/kept 는 해당 상태만 남기고 pending 은 제외한다", () => {
    const hidden = queryReports(REPORTS, { tab: "hidden", q: "", page: 1 });
    const kept = queryReports(REPORTS, { tab: "kept", q: "", page: 1 });

    expect(hidden.items.map((i) => i.id)).toEqual(["r2"]);
    expect(kept.items.map((i) => i.id)).toEqual(["r3"]);
    expect(hidden.items.some((i) => i.status === "pending")).toBe(false);
  });

  it("검색어는 내용과 작성자에 대소문자 무시 부분일치한다", () => {
    expect(
      queryReports(REPORTS, { tab: "all", q: "코드", page: 1 }).items.map((i) => i.id),
    ).toEqual(["r2"]);
    expect(
      queryReports(REPORTS, { tab: "all", q: "ABC123", page: 1 }).items.map((i) => i.id),
    ).toEqual(["r1", "r3"]);
    // 신고 사유는 검색 대상이 아니다
    expect(queryReports(REPORTS, { tab: "all", q: "스팸", page: 1 }).totalCount).toBe(0);
  });

  it("페이지네이션은 1-based 이고 범위를 벗어나면 빈 배열을 준다", () => {
    const page2 = queryReports(REPORTS, { tab: "all", q: "", page: 2, size: 2 });

    expect(page2.totalPages).toBe(2);
    expect(page2.items.map((i) => i.id)).toEqual(["r3"]);
    expect(queryReports(REPORTS, { tab: "all", q: "", page: 9, size: 2 }).items).toEqual([]);
  });
});

describe("queryGradeApplications", () => {
  it("탭은 신청 상태로 가른다", () => {
    expect(
      queryGradeApplications(APPLICATIONS, { tab: "pending", q: "", page: 1 }).items.map(
        (i) => i.id,
      ),
    ).toEqual(["g3", "g1"]); // 최신순
    expect(
      queryGradeApplications(APPLICATIONS, { tab: "approved", q: "", page: 1 }).items.map(
        (i) => i.id,
      ),
    ).toEqual(["g2"]);
  });

  it("검색어는 아이디와 닉네임에 부분일치한다", () => {
    expect(
      queryGradeApplications(APPLICATIONS, { tab: "pending", q: "학생", page: 1 }).items.map(
        (i) => i.id,
      ),
    ).toEqual(["g3"]);
    expect(
      queryGradeApplications(APPLICATIONS, { tab: "pending", q: "abc", page: 1 }).items.map(
        (i) => i.id,
      ),
    ).toEqual(["g1"]);
    // 탭이 다르면 검색어가 맞아도 안 나온다
    expect(
      queryGradeApplications(APPLICATIONS, { tab: "pending", q: "코드장인", page: 1 }).totalCount,
    ).toBe(0);
  });
});

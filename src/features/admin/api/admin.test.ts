import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import {
  approveGradeApplication,
  fetchGradeApplications,
  fetchReports,
  updateReportStatus,
} from "@/features/admin/api/admin";
import type { ApiGradeRequest, ApiReport } from "@/features/admin/api/dto";
import { server } from "@/mocks/server";

function envelope<T>(result: T) {
  return HttpResponse.json({
    success: true,
    code: "COMMON-200",
    message: "성공했습니다.",
    result,
  });
}

function page<T>(content: T[], overrides: Partial<{ page: number; totalPages: number }> = {}) {
  return {
    content,
    page: 0,
    size: 8,
    totalElements: content.length,
    totalPages: 1,
    hasNext: false,
    ...overrides,
  };
}

function report(overrides: Partial<ApiReport> = {}): ApiReport {
  return {
    reportId: 1,
    targetType: "POST",
    targetId: 10,
    reason: "SPAM",
    description: "동일 게시물이 반복 도배되고 있습니다.",
    status: "PENDING",
    reporterId: 5,
    createdAt: "2026-07-23T12:00:00Z",
    ...overrides,
  };
}

function gradeRequest(overrides: Partial<ApiGradeRequest> = {}): ApiGradeRequest {
  return {
    gradeRequestId: 1,
    userId: 5,
    username: "hanharam",
    currentGrade: "PRIME",
    requestedGrade: "ORIGIN",
    status: "PENDING",
    requestedAt: "2026-07-23T12:00:00Z",
    processedAt: null,
    ...overrides,
  };
}

const query = { tab: "all" as const, q: "", page: 1 };

describe("fetchReports", () => {
  it("탭을 서버 status 로, 페이지를 0-based 로 바꿔 보낸다", async () => {
    let sent: URLSearchParams | null = null;
    server.use(
      http.get("/api/v1/admin/reports", ({ request }) => {
        sent = new URL(request.url).searchParams;
        return envelope(page([report()]));
      }),
    );

    await fetchReports("comment", { tab: "hidden", q: "", page: 3 });

    expect(sent!.get("targetType")).toBe("COMMENT");
    // 숨김 = 신고 인용(RESOLVED)
    expect(sent!.get("status")).toBe("RESOLVED");
    expect(sent!.get("page")).toBe("2");
  });

  it("전체 탭은 status 필터를 보내지 않는다", async () => {
    let sent: URLSearchParams | null = null;
    server.use(
      http.get("/api/v1/admin/reports", ({ request }) => {
        sent = new URL(request.url).searchParams;
        return envelope(page([]));
      }),
    );

    await fetchReports("post", query);

    expect(sent!.has("status")).toBe(false);
  });

  it("서버 상태를 화면 상태로 옮기고 페이지를 1-based 로 되돌린다", async () => {
    server.use(
      http.get("/api/v1/admin/reports", () =>
        envelope(
          page([report({ status: "RESOLVED" }), report({ reportId: 2, status: "REJECTED" })], {
            page: 1,
            totalPages: 4,
          }),
        ),
      ),
    );

    const result = await fetchReports("post", query);

    expect(result.items.map((i) => i.status)).toEqual(["hidden", "kept"]);
    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(4);
  });

  // 요청서 A-1 — 대상 요약이 응답에 없어 표의 두 컬럼을 채울 수 없다
  it("대상 요약이 없으면 식별자·자리표시로 채운다", async () => {
    server.use(http.get("/api/v1/admin/reports", () => envelope(page([report()]))));

    const [item] = (await fetchReports("post", query)).items;

    expect(item.content).toBe("#10");
    expect(item.author).toBe("-");
  });

  it("대상 요약이 오면 그대로 쓴다", async () => {
    server.use(
      http.get("/api/v1/admin/reports", () =>
        envelope(
          page([
            report({
              targetSummary: { content: "도배 게시물", authorId: 3, authorNickname: "spammer" },
            }),
          ]),
        ),
      ),
    );

    const [item] = (await fetchReports("post", query)).items;

    expect(item.content).toBe("도배 게시물");
    expect(item.author).toBe("spammer");
  });

  // 요청서 A-3 — 서버에 검색 파라미터가 없어 받아온 목록에서 거른다
  it("검색어가 있으면 한 번에 받아 클라이언트에서 거른다", async () => {
    let sent: URLSearchParams | null = null;
    server.use(
      http.get("/api/v1/admin/reports", ({ request }) => {
        sent = new URL(request.url).searchParams;
        return envelope(
          page([
            report({
              reportId: 1,
              targetSummary: { content: "도배 게시물", authorId: 1, authorNickname: "spammer" },
            }),
            report({
              reportId: 2,
              targetSummary: { content: "정상 게시물", authorId: 2, authorNickname: "user" },
            }),
          ]),
        );
      }),
    );

    const result = await fetchReports("post", { tab: "all", q: "도배", page: 1 });

    expect(sent!.get("size")).toBe("100");
    expect(result.items).toHaveLength(1);
    expect(result.items[0].content).toBe("도배 게시물");
    expect(result.totalCount).toBe(1);
  });
});

describe("updateReportStatus", () => {
  it("숨김/유지를 서버 status 로 바꿔 보낸다", async () => {
    const sent: string[] = [];
    server.use(
      http.patch("/api/v1/admin/reports/:reportId", async ({ request }) => {
        const body = (await request.json()) as { status: string };
        sent.push(body.status);
        return envelope(report());
      }),
    );

    await updateReportStatus("post", "1", "hidden");
    await updateReportStatus("post", "1", "kept");

    expect(sent).toEqual(["RESOLVED", "REJECTED"]);
  });
});

describe("fetchGradeApplications", () => {
  it("탭을 서버 status 로 바꾸고 지표 누락은 0 으로 채운다", async () => {
    let sent: URLSearchParams | null = null;
    server.use(
      http.get("/api/v1/admin/grade-requests", ({ request }) => {
        sent = new URL(request.url).searchParams;
        return envelope(page([gradeRequest()]));
      }),
    );

    const result = await fetchGradeApplications({ tab: "pending", q: "", page: 1 });

    expect(sent!.get("status")).toBe("PENDING");
    // 요청서 A-2 미반영 — 게시글 수·누적 추천이 응답에 없다
    expect(result.items[0]).toMatchObject({
      id: "1",
      userId: "5",
      nickname: "hanharam",
      postCount: 0,
      likeCount: 0,
    });
  });

  it("nickname 이 오면 username 대신 쓴다", async () => {
    server.use(
      http.get("/api/v1/admin/grade-requests", () =>
        envelope(
          page([gradeRequest({ nickname: "프롬프트장인", postCount: 8, totalLikeCount: 124 })]),
        ),
      ),
    );

    const result = await fetchGradeApplications({ tab: "pending", q: "", page: 1 });

    expect(result.items[0]).toMatchObject({
      nickname: "프롬프트장인",
      postCount: 8,
      likeCount: 124,
    });
  });
});

describe("approveGradeApplication", () => {
  it("decision=APPROVED 로 보낸다", async () => {
    let sent: unknown = null;
    server.use(
      http.patch("/api/v1/admin/grade-requests/:requestId", async ({ request }) => {
        sent = await request.json();
        return envelope(gradeRequest({ status: "APPROVED" }));
      }),
    );

    await approveGradeApplication("1");

    expect(sent).toEqual({ decision: "APPROVED" });
  });
});

// 서버가 숫자를 문자열로 내려주던 시기가 있어 방어를 유지한다(docs/be-blockers.md)
describe("숫자 정규화", () => {
  it("페이지 메타가 문자열로 와도 숫자로 계산한다", async () => {
    server.use(
      http.get("/api/v1/admin/reports", () =>
        envelope({
          content: [report()],
          page: "1",
          size: "8",
          totalElements: "42",
          totalPages: "6",
          hasNext: true,
        }),
      ),
    );

    const result = await fetchReports("post", query);

    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(6);
    expect(result.totalCount).toBe(42);
  });
});

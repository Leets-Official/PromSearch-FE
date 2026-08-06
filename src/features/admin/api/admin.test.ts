import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import {
  approveGradeApplication,
  fetchGradeApplications,
  fetchOriginUsers,
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
    username: "hanharam@example.com",
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

  // 대상이 이미 삭제되면 서버가 요약을 못 채운다 — 표가 비지 않게 식별자로 버틴다
  it("대상 요약이 없으면 식별자·자리표시로 채운다", async () => {
    server.use(http.get("/api/v1/admin/reports", () => envelope(page([report()]))));

    const [item] = (await fetchReports("post", query)).items;

    expect(item.content).toBe("#10");
    expect(item.author).toBe("-");
  });

  // 요청서 A-3 반영 — 검색은 서버가 한다(예전의 100건 받아 클라 필터 경로는 제거)
  it("검색어를 q 로 넘기고 페이지 크기는 그대로 둔다", async () => {
    let sent: URLSearchParams | null = null;
    server.use(
      http.get("/api/v1/admin/reports", ({ request }) => {
        sent = new URL(request.url).searchParams;
        return envelope(page([report()]));
      }),
    );

    await fetchReports("post", { tab: "all", q: "  도배  ", page: 2 });

    // 앞뒤 공백은 서버에 보내기 전에 턴다
    expect(sent!.get("q")).toBe("도배");
    expect(sent!.get("size")).toBe("8");
    expect(sent!.get("page")).toBe("1");
  });

  it("검색어가 비어 있으면 q 를 아예 보내지 않는다", async () => {
    let sent: URLSearchParams | null = null;
    server.use(
      http.get("/api/v1/admin/reports", ({ request }) => {
        sent = new URL(request.url).searchParams;
        return envelope(page([]));
      }),
    );

    await fetchReports("post", { tab: "all", q: "   ", page: 1 });

    expect(sent!.has("q")).toBe(false);
  });
});

describe("updateReportStatus", () => {
  // targetType 은 필수다 — 게시글·댓글 신고가 별도 테이블이라 reportId 만으로 못 찾는다
  it("숨김/유지를 서버 status 로 바꾸고 대상 종류를 함께 보낸다", async () => {
    const sent: unknown[] = [];
    server.use(
      http.patch("/api/v1/admin/reports/:reportId", async ({ request }) => {
        sent.push(await request.json());
        return envelope(report());
      }),
    );

    await updateReportStatus("post", "1", "hidden");
    await updateReportStatus("comment", "2", "kept");

    expect(sent).toEqual([
      { targetType: "POST", status: "RESOLVED" },
      { targetType: "COMMENT", status: "REJECTED" },
    ]);
  });
});

describe("fetchGradeApplications", () => {
  it("탭을 서버 status 로 바꾸고 승인 지표를 옮긴다", async () => {
    let sent: URLSearchParams | null = null;
    server.use(
      http.get("/api/v1/admin/grade-requests", ({ request }) => {
        sent = new URL(request.url).searchParams;
        return envelope(
          page([gradeRequest({ nickname: "프롬프트장인", postCount: 8, totalLikeCount: 124 })]),
        );
      }),
    );

    const result = await fetchGradeApplications({ tab: "pending", q: "", page: 1 });

    expect(sent!.get("status")).toBe("PENDING");
    expect(result.items[0]).toMatchObject({
      id: "1",
      userId: "5",
      nickname: "프롬프트장인",
      postCount: 8,
      likeCount: 124,
    });
  });

  it("nickname 이 없으면 아이디(username)로 대신한다", async () => {
    server.use(http.get("/api/v1/admin/grade-requests", () => envelope(page([gradeRequest()]))));

    const result = await fetchGradeApplications({ tab: "pending", q: "", page: 1 });

    expect(result.items[0]).toMatchObject({
      nickname: "hanharam@example.com",
      postCount: 0,
      likeCount: 0,
    });
  });

  it("검색어를 q 로 넘긴다", async () => {
    let sent: URLSearchParams | null = null;
    server.use(
      http.get("/api/v1/admin/grade-requests", ({ request }) => {
        sent = new URL(request.url).searchParams;
        return envelope(page([]));
      }),
    );

    await fetchGradeApplications({ tab: "approved", q: "장인", page: 1 });

    expect(sent!.get("status")).toBe("APPROVED");
    expect(sent!.get("q")).toBe("장인");
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

describe("fetchOriginUsers", () => {
  it("페이지를 0-based 로 보내고 유저를 옮긴다", async () => {
    let sent: URLSearchParams | null = null;
    server.use(
      http.get("/api/v1/admin/origin-users", ({ request }) => {
        sent = new URL(request.url).searchParams;
        return envelope(page([{ userId: 7, username: "프롬프트장인" }]));
      }),
    );

    const result = await fetchOriginUsers(2);

    expect(sent!.get("page")).toBe("1");
    expect(result.items[0]).toEqual({ id: "7", nickname: "프롬프트장인" });
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

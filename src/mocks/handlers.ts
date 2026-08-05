import { delay, http, HttpResponse } from "msw";

import type { GradeTab, ReportedItem, ReportTab } from "@/features/admin/types";
import { queryGradeApplications, queryReports } from "@/mocks/admin-query";
import { adminStore, approveGrade, setReportStatus } from "@/mocks/data/admin";
import { DEV_EDGE_HEADER, type DevEdge } from "@/lib/dev-preview";

/**
 * API 목 핸들러. 브라우저(개발)와 Node(테스트)에서 공유한다.
 *
 * **홈·상세·업로드는 목이 없다** — 실서버(`https://api.promsearch.kr`)에 직접 붙는다.
 * MSW 가 처리하지 않은 요청은 Next rewrites 를 타고 그대로 BE 로 나간다.
 *
 * 남아 있는 건 **어드민뿐**이다. BE 스펙은 나왔지만 FE 연동이 다른 브랜치(PS-70)에 있어
 * 이 브랜치에서는 아직 구(舊) 경로(`/api/admin/*`)를 쓴다.
 */

// dev 툴바 헤더 파싱(목 전용) — 엣지 상태를 강제해 로딩/에러/빈 화면을 확인한다.
function readDevEdge(request: Request): DevEdge {
  return (request.headers.get(DEV_EDGE_HEADER) as DevEdge) ?? "normal";
}

/**
 * 엣지 상태(loading/error)를 응답 앞단에서 강제한다. 해당하면 Response 를, 아니면 null 을 반환.
 * (empty 는 응답 형태가 엔드포인트마다 달라 각 핸들러에서 개별 처리)
 */
async function forceEdge(edge: DevEdge): Promise<Response | null> {
  if (edge === "loading") {
    await delay("infinite"); // 로딩 스켈레톤을 계속 노출(디자이너 확인용)
  }
  if (edge === "error") {
    return new HttpResponse(null, { status: 500 });
  }
  return null;
}

export const handlers = [
  // ── 어드민 ────────────────────────────────────────────────────────────
  // 신고 게시글 목록 (PS-49)
  http.get("/api/admin/reports/posts", async ({ request }) => {
    return adminReportListResponse(request, adminStore.posts);
  }),

  // 신고 댓글 목록
  http.get("/api/admin/reports/comments", async ({ request }) => {
    return adminReportListResponse(request, adminStore.comments);
  }),

  // 신고 게시글 처리(숨김/유지)
  http.patch("/api/admin/reports/posts/:id", async ({ params, request }) => {
    return adminModerate(adminStore.posts, String(params.id), request);
  }),

  // 신고 댓글 처리(숨김/유지)
  http.patch("/api/admin/reports/comments/:id", async ({ params, request }) => {
    return adminModerate(adminStore.comments, String(params.id), request);
  }),

  // 유저 등급 신청 목록
  http.get("/api/admin/users/grade-applications", async ({ request }) => {
    const edge = readDevEdge(request);
    const forced = await forceEdge(edge);
    if (forced) return forced;

    const params = new URL(request.url).searchParams;
    const tab = (params.get("tab") as GradeTab) ?? "pending";
    if (edge === "empty") {
      return HttpResponse.json({ items: [], page: 1, totalPages: 1, totalCount: 0 });
    }

    return HttpResponse.json(
      queryGradeApplications(adminStore.gradeApplications, {
        tab,
        q: params.get("q") ?? "",
        page: Number(params.get("page") ?? "1"),
      }),
    );
  }),

  // 등급 승인
  http.post("/api/admin/users/grade-applications/:id/approve", ({ params }) => {
    const ok = approveGrade(adminStore.gradeApplications, String(params.id));
    if (!ok) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ ok: true });
  }),
];

/** 신고 목록 응답 — 게시글/댓글이 같은 계약이라 한 곳에서 처리한다. */
async function adminReportListResponse(request: Request, records: ReportedItem[]) {
  const edge = readDevEdge(request);
  const forced = await forceEdge(edge);
  if (forced) return forced;
  if (edge === "empty") {
    return HttpResponse.json({ items: [], page: 1, totalPages: 1, totalCount: 0 });
  }

  const params = new URL(request.url).searchParams;
  return HttpResponse.json(
    queryReports(records, {
      tab: (params.get("tab") as ReportTab) ?? "all",
      q: params.get("q") ?? "",
      page: Number(params.get("page") ?? "1"),
    }),
  );
}

/** 신고 처리(숨김/유지) — 본문 status 를 검증하고 인메모리 상태를 갱신한다. */
async function adminModerate(records: ReportedItem[], id: string, request: Request) {
  const body = (await request.json()) as { status?: string };
  if (body.status !== "hidden" && body.status !== "kept") {
    return new HttpResponse(null, { status: 400 });
  }
  if (!setReportStatus(records, id, body.status)) {
    return new HttpResponse(null, { status: 404 });
  }
  return HttpResponse.json({ id, status: body.status });
}

import { delay, http, HttpResponse } from "msw";

import type { GradeTab, ReportedItem, ReportTab } from "@/features/admin/types";
import type { AiModel, GalleryNav, JobCategory, OutputType, Task } from "@/features/gallery/types";
import type { PromptDraft, PromptFormValues } from "@/features/upload/types";
import { queryGradeApplications, queryReports } from "@/mocks/admin-query";
import { adminStore, approveGrade, setReportStatus } from "@/mocks/data/admin";
import { PROMPT_SEED } from "@/mocks/data/prompts";
import {
  addComment,
  addReply,
  editComment,
  listComments,
  listReplies,
  promptDetail,
  removeComment,
  toggleBookmarkState,
  toggleLikeState,
} from "@/mocks/detail-api";
import { jobCards, paginate, popularCards } from "@/mocks/home-prompt-cards";
import { queryPrompts } from "@/mocks/prompt-query";
import {
  DEV_CONTENT_HEADER,
  DEV_DRAFT_HEADER,
  DEV_EDGE_HEADER,
  DEV_PREVIEW_COOKIE,
  parseDevPreview,
  type DevAuth,
  type DevContent,
  type DevDraft,
  type DevEdge,
} from "@/lib/dev-preview";

// API 목 핸들러. 브라우저(개발)와 Node(테스트)에서 공유한다.
// BE 스펙이 나오기 전 여기에 응답을 정의해 병렬 개발한다.

// dev 툴바 헤더 파싱(목 전용). 프론트 fetch 가 콘텐츠 길이/엣지 상태를 실어 보낸다.
function readDevContent(request: Request): DevContent {
  return (request.headers.get(DEV_CONTENT_HEADER) as DevContent) ?? "default";
}
function readDevEdge(request: Request): DevEdge {
  return (request.headers.get(DEV_EDGE_HEADER) as DevEdge) ?? "normal";
}
function readDevDraft(request: Request): DevDraft {
  return (request.headers.get(DEV_DRAFT_HEADER) as DevDraft) ?? "seeded";
}

/**
 * 뷰어 인증 상태 — dev 툴바 쿠키에서 읽는다.
 *
 * 실서버는 `Authorization` 헤더로 판정하지만 목 단계에는 토큰이 없다. 툴바 인증 축을 그대로
 * 쓰면 디자이너/기획자가 비회원↔회원 잠금 화면을 토글해 확인할 수 있다(목 전용 경로).
 */
function readDevAuth(request: Request): DevAuth {
  const cookie = request.headers.get("cookie") ?? "";
  const entry = cookie
    .split("; ")
    .find((c) => c.startsWith(`${DEV_PREVIEW_COOKIE}=`))
    ?.slice(DEV_PREVIEW_COOKIE.length + 1);
  return parseDevPreview(entry).auth;
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

/** BE 공통 응답 봉투로 감싼다(`api.*` 헬퍼가 `result` 만 꺼내 쓴다). */
function jsonEnvelope<T>(result: T, status = 200) {
  return HttpResponse.json(
    { success: true, code: "COMMON-200", message: "성공했습니다.", result },
    { status },
  );
}

/** 실패 응답도 같은 봉투 규격을 지킨다(`success: false`) — 클라이언트 에러 정규화 경로 검증용. */
function errorEnvelope(status: number, code: string, message: string) {
  return HttpResponse.json({ success: false, code, message }, { status });
}

// 콤마 구분 멀티값 파싱 (?tasks=ppt,report)
function parseList<T extends string>(value: string | null): T[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean) as T[];
}

export const handlers = [
  // 동작 확인용 샘플
  http.get("/api/health", () => HttpResponse.json({ ok: true })),

  // ──────────────────────────────────────────────────────────────────────────
  // ⚠️ 임시 목 — BE 장애 대응 (2026-08-05)
  //
  // 실서버(`api.promsearch.kr`)가 TCP 는 받지만 HTTP 응답을 주지 않아(`socket hang up`)
  // 홈 화면을 확인할 수 없어 실 엔드포인트를 그대로 흉내 낸다.
  // **BE 복구 시 아래 두 핸들러와 `mocks/home-prompt-cards.ts` 를 삭제**하면 실서버로 붙는다.
  // 응답은 공통 봉투(`{ success, code, message, result }`)까지 서버와 동일하게 맞춘다.
  // ──────────────────────────────────────────────────────────────────────────

  // [HOME-001] 인기 프롬프트(좋아요순)
  http.get("/api/v1/home/prompts/popular", async ({ request }) => {
    const edge = readDevEdge(request);
    const forced = await forceEdge(edge);
    if (forced) return forced;

    const params = new URL(request.url).searchParams;
    const page = Number(params.get("page") ?? "0");
    const size = Number(params.get("size") ?? "12");

    return jsonEnvelope(paginate(edge === "empty" ? [] : popularCards(), page, size));
  }),

  // [HOME-002] 직군별 프롬프트(최신순)
  http.get("/api/v1/home/prompts/jobs/:jobTagId", async ({ params: pathParams, request }) => {
    const edge = readDevEdge(request);
    const forced = await forceEdge(edge);
    if (forced) return forced;

    const params = new URL(request.url).searchParams;
    const page = Number(params.get("page") ?? "0");
    const size = Number(params.get("size") ?? "12");
    const cards = edge === "empty" ? [] : jobCards(Number(pathParams.jobTagId));

    return jsonEnvelope(paginate(cards, page, size));
  }),

  // 홈 갤러리 목록 — 필터/정렬/페이지네이션 (F-1.1)
  http.get("/api/prompts", async ({ request }) => {
    const edge = readDevEdge(request);
    const forced = await forceEdge(edge);
    if (forced) return forced;
    if (edge === "empty") {
      return HttpResponse.json({ items: [], page: 1, totalPages: 1, totalCount: 0 });
    }

    const url = new URL(request.url);
    const params = url.searchParams;

    const response = queryPrompts(PROMPT_SEED, {
      nav: (params.get("nav") as GalleryNav) ?? "home",
      job: (params.get("job") as JobCategory | null) || null,
      tasks: parseList<Task>(params.get("tasks")),
      models: parseList<AiModel>(params.get("models")),
      outputTypes: parseList<OutputType>(params.get("types")),
      q: params.get("q") ?? "",
      page: Number(params.get("page") ?? "1"),
      size: params.get("size") ? Number(params.get("size")) : undefined,
    });

    return HttpResponse.json(response);
  }),

  // 프롬프트 게시(생성) — 성공 시 새 id 반환. 검증은 프론트 zod 담당.
  http.post("/api/prompts", async ({ request }) => {
    const forced = await forceEdge(readDevEdge(request));
    if (forced) return forced;
    await request.json().catch(() => null); // 본문 소비(목은 저장하지 않고 id 만 발급)
    createdCount += 1;
    const id = `prompt-new-${String(createdCount).padStart(3, "0")}`;
    return HttpResponse.json({ id }, { status: 201 });
  }),

  // 임시저장 조회 — 단일 슬롯. 없으면 draft: null.
  // ⚠️ 반드시 "/api/prompts/:id" 보다 먼저 등록해야 draft 가 :id(=“draft”)로 새지 않는다.
  // dev 툴바 "임시저장" 축(seeded/none)으로 초안 유무를 강제할 수 있다.
  http.get("/api/prompts/draft", async ({ request }) => {
    const forced = await forceEdge(readDevEdge(request));
    if (forced) return forced;
    if (readDevDraft(request) === "none") return HttpResponse.json({ draft: null });
    return HttpResponse.json({ draft: draftState });
  }),

  // 임시저장(덮어쓰기) — 단일 슬롯
  http.put("/api/prompts/draft", async ({ request }) => {
    const values = (await request.json()) as PromptFormValues;
    draftState = { ...values, updatedAt: new Date().toISOString() };
    return HttpResponse.json(draftState);
  }),

  // 임시저장 삭제("새로 작성하기" / 게시 완료 정리)
  http.delete("/api/prompts/draft", () => {
    draftState = null;
    return new HttpResponse(null, { status: 204 });
  }),

  // ──────────────────────────────────────────────────────────────────────────
  // ⚠️ 임시 목 — BE 장애 대응 (2026-08-05). 실 엔드포인트를 그대로 흉내 낸다.
  // BE 복구 시 아래 상세·댓글 핸들러와 `mocks/detail-api.ts` 를 삭제하면 실서버로 붙는다.
  // ──────────────────────────────────────────────────────────────────────────

  // [PROMPT-001] 상세 조회 — 잠금(access) 판정과 본문 절삭까지 서버처럼 처리한다.
  http.get("/api/v1/prompts/:id", async ({ params, request }) => {
    const forced = await forceEdge(readDevEdge(request));
    if (forced) return forced;

    const detail = promptDetail(Number(params.id), readDevAuth(request), readDevContent(request));
    if (!detail) return errorEnvelope(404, "COMMON-404", "요청한 리소스를 찾을 수 없습니다.");
    return jsonEnvelope(detail);
  }),

  // [COMMENT-001] 최상위 댓글 — 최신순 커서 페이지
  http.get("/api/v1/prompts/:id/comments", async ({ params, request }) => {
    const edge = readDevEdge(request);
    const forced = await forceEdge(edge);
    if (forced) return forced;

    const query = new URL(request.url).searchParams;
    const cursor = query.get("cursor") ? Number(query.get("cursor")) : null;
    const size = Number(query.get("size") ?? "20");

    if (edge === "empty") {
      return jsonEnvelope({ comments: [], nextCursor: null, hasNext: false });
    }
    return jsonEnvelope(listComments(Number(params.id), cursor, size));
  }),

  // [COMMENT-002] 댓글 작성
  http.post("/api/v1/prompts/:id/comments", async ({ params, request }) => {
    const { content } = (await request.json()) as { content: string };
    return jsonEnvelope(addComment(Number(params.id), content), 201);
  }),

  // [COMMENT-006] 대댓글 — 오래된순 커서 페이지
  http.get("/api/v1/comments/:commentId/replies", async ({ params, request }) => {
    const forced = await forceEdge(readDevEdge(request));
    if (forced) return forced;

    const query = new URL(request.url).searchParams;
    const cursor = query.get("cursor") ? Number(query.get("cursor")) : null;
    const size = Number(query.get("size") ?? "20");

    const result = listReplies(Number(params.commentId), cursor, size);
    if (!result) return errorEnvelope(404, "COMMON-404", "요청한 리소스를 찾을 수 없습니다.");
    return jsonEnvelope(result);
  }),

  // [COMMENT-005] 대댓글 작성 — 대댓글에 다시 달면 400
  http.post("/api/v1/comments/:commentId/replies", async ({ params, request }) => {
    const { content } = (await request.json()) as { content: string };
    const created = addReply(Number(params.commentId), content);
    if (!created) return errorEnvelope(400, "COMMON-400", "잘못된 요청입니다.");
    return jsonEnvelope(created, 201);
  }),

  // [COMMENT-003] 댓글 수정 — 본인만
  http.patch("/api/v1/comments/:commentId", async ({ params, request }) => {
    const { content } = (await request.json()) as { content: string };
    const result = editComment(Number(params.commentId), content);
    if (result === null)
      return errorEnvelope(404, "COMMON-404", "요청한 리소스를 찾을 수 없습니다.");
    if (result === "forbidden")
      return errorEnvelope(403, "COMMON-403", "허용되지 않는 요청입니다.");
    return jsonEnvelope(result);
  }),

  // [COMMENT-004] 댓글 삭제 — 본인만, 논리 삭제
  http.delete("/api/v1/comments/:commentId", ({ params }) => {
    const result = removeComment(Number(params.commentId));
    if (result === null)
      return errorEnvelope(404, "COMMON-404", "요청한 리소스를 찾을 수 없습니다.");
    if (result === "forbidden")
      return errorEnvelope(403, "COMMON-403", "허용되지 않는 요청입니다.");
    return jsonEnvelope("삭제되었습니다.");
  }),

  // [COMMUNITY-001/002] 좋아요 등록·취소 — 서버처럼 메서드로 갈린다
  http.post("/api/v1/prompts/:id/likes", ({ params }) => {
    const promptId = Number(params.id);
    return jsonEnvelope({ promptId, liked: true, likeCount: toggleLikeState(promptId, true) }, 201);
  }),
  http.delete("/api/v1/prompts/:id/likes", ({ params }) => {
    const promptId = Number(params.id);
    return jsonEnvelope({ promptId, liked: false, likeCount: toggleLikeState(promptId, false) });
  }),

  // 북마크 토글 — **BE 에 API 가 없어 목 유지**(요청서 D-1). 상세 목과 상태를 공유한다.
  http.post("/api/prompts/:id/bookmark", ({ params }) =>
    HttpResponse.json({ bookmarked: toggleBookmarkState(Number(params.id)) }),
  ),

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

// 토글 인메모리 상태(목 전용). id → 현재 사용자의 좋아요/북마크 여부

// 게시 생성 카운터(목 전용) — 새 id 발급용
let createdCount = 0;

/**
 * 임시저장 단일 슬롯(목 전용).
 * 초기값으로 예시 드래프트를 넣어 진입 시 "불러오기/새로작성" 모달을 바로 확인할 수 있게 한다.
 * (dev 툴바 edge=empty 로 "없음" 상태도 확인 가능)
 */
const SEEDED_DRAFT: PromptDraft = {
  title: "임시저장된 블로그 글쓰기 프롬프트",
  description: "블로그 초안을 빠르게 잡아주는 프롬프트입니다.",
  outputType: "text",
  jobCategories: ["worker", "planner"],
  tasks: ["report", "document"],
  model: "chatgpt",
  modelEtcName: "",
  tier: "free",
  body: "너는 전문 블로그 작가야. 아래 주제에 대해 목차와 초안을 작성해줘: ",
  images: [],
  updatedAt: "2026-07-27T09:30:00.000Z",
};
let draftState: PromptDraft | null = SEEDED_DRAFT;

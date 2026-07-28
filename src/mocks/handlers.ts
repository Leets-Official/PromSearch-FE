import { delay, http, HttpResponse } from "msw";

import type { UserStatus } from "@/analytics/events";
import { MOCK_VIEWER_HEADER } from "@/features/prompt-detail/api/prompt-detail";
import type { AiModel, GalleryNav, JobCategory, OutputType, Task } from "@/features/gallery/types";
import type { PromptDraft, PromptFormValues } from "@/features/upload/types";
import { buildComments } from "@/mocks/data/comments";
import { PROMPT_SEED } from "@/mocks/data/prompts";
import { findPromptDetail } from "@/mocks/prompt-detail-query";
import { queryPrompts } from "@/mocks/prompt-query";
import {
  DEV_CONTENT_HEADER,
  DEV_EDGE_HEADER,
  type DevContent,
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
  http.get("/api/prompts/draft", async ({ request }) => {
    const forced = await forceEdge(readDevEdge(request));
    if (forced) return forced;
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

  // 상세 조회 — 잠금(access) 판정 포함 (F-2). 뷰어 상태는 목 전용 헤더로 받는다.
  http.get("/api/prompts/:id", async ({ params, request }) => {
    const forced = await forceEdge(readDevEdge(request));
    if (forced) return forced;

    const id = String(params.id);
    const viewerStatus = (request.headers.get(MOCK_VIEWER_HEADER) as UserStatus) ?? "anonymous";

    const detail = findPromptDetail(PROMPT_SEED, id, viewerStatus, readDevContent(request));
    if (!detail) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({
      ...detail,
      liked: likedState.get(id) ?? false,
      bookmarked: bookmarkedState.get(id) ?? false,
    });
  }),

  // 상세 댓글 — 표시 전용
  http.get("/api/prompts/:id/comments", async ({ params, request }) => {
    const edge = readDevEdge(request);
    const forced = await forceEdge(edge);
    if (forced) return forced;
    if (edge === "empty") return HttpResponse.json([]);
    return HttpResponse.json(buildComments(String(params.id), readDevContent(request)));
  }),

  // 좋아요(추천) 토글 — 인메모리 상태로 liked/카운트를 뒤집어 돌려준다(낙관적 롤백 테스트용)
  http.post("/api/prompts/:id/like", ({ params }) => {
    const id = String(params.id);
    const base = PROMPT_SEED.find((r) => r.id === id)?.stats.likes ?? 0;
    const liked = !(likedState.get(id) ?? false);
    likedState.set(id, liked);
    return HttpResponse.json({ liked, likeCount: base + (liked ? 1 : 0) });
  }),

  // 북마크 토글 — 인메모리 상태로 bookmarked 를 뒤집어 돌려준다
  http.post("/api/prompts/:id/bookmark", ({ params }) => {
    const id = String(params.id);
    const bookmarked = !(bookmarkedState.get(id) ?? false);
    bookmarkedState.set(id, bookmarked);
    return HttpResponse.json({ bookmarked });
  }),
];

// 토글 인메모리 상태(목 전용). id → 현재 사용자의 좋아요/북마크 여부
const likedState = new Map<string, boolean>();
const bookmarkedState = new Map<string, boolean>();

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
  models: ["chatgpt", "etc"],
  modelEtcName: "뤼튼",
  tier: "free",
  body: "너는 전문 블로그 작가야. 아래 주제에 대해 목차와 초안을 작성해줘: ",
  images: [],
  updatedAt: "2026-07-27T09:30:00.000Z",
};
let draftState: PromptDraft | null = SEEDED_DRAFT;

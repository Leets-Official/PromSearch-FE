import { http, HttpResponse } from "msw";

import type { UserStatus } from "@/analytics/events";
import { MOCK_VIEWER_HEADER } from "@/features/prompt-detail/api/prompt-detail";
import type { AiModel, GalleryNav, JobCategory, OutputType, Task } from "@/features/gallery/types";
import { buildComments } from "@/mocks/data/comments";
import { PROMPT_SEED } from "@/mocks/data/prompts";
import { findPromptDetail } from "@/mocks/prompt-detail-query";
import { queryPrompts } from "@/mocks/prompt-query";

// API 목 핸들러. 브라우저(개발)와 Node(테스트)에서 공유한다.
// BE 스펙이 나오기 전 여기에 응답을 정의해 병렬 개발한다.

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
  http.get("/api/prompts", ({ request }) => {
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

  // 상세 조회 — 잠금(access) 판정 포함 (F-2). 뷰어 상태는 목 전용 헤더로 받는다.
  http.get("/api/prompts/:id", ({ params, request }) => {
    const id = String(params.id);
    const viewerStatus = (request.headers.get(MOCK_VIEWER_HEADER) as UserStatus) ?? "anonymous";

    const detail = findPromptDetail(PROMPT_SEED, id, viewerStatus);
    if (!detail) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({ ...detail, liked: likedState.get(id) ?? false });
  }),

  // 상세 댓글 — 표시 전용
  http.get("/api/prompts/:id/comments", ({ params }) => {
    return HttpResponse.json(buildComments(String(params.id)));
  }),

  // 추천 토글 — 인메모리 상태로 liked/카운트를 뒤집어 돌려준다(낙관적 갱신 롤백 테스트용)
  http.post("/api/prompts/:id/like", ({ params }) => {
    const id = String(params.id);
    const base = PROMPT_SEED.find((r) => r.id === id)?.stats.likes ?? 0;
    const liked = !(likedState.get(id) ?? false);
    likedState.set(id, liked);
    return HttpResponse.json({ liked, likeCount: base + (liked ? 1 : 0) });
  }),
];

// 추천 토글 인메모리 상태(목 전용). id → 현재 사용자가 추천했는지
const likedState = new Map<string, boolean>();

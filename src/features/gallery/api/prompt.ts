/**
 * 홈 갤러리 목록 API.
 *
 * 엔드포인트(Swagger)
 * - `[HOME-001] GET /home/prompts/popular` — 좋아요순
 * - `[HOME-002] GET /home/prompts/jobs/{jobTagId}` — 직군별(최신순)
 *
 * ⚠️ **임시 구현이 섞여 있다.** 아래 세 가지는 서버가 아직 지원하지 않아 FE 가 메꾸고 있고,
 * 요청서([docs/api-requests-be.md](../../../../docs/api-requests-be.md) H-1 · C-1)가 반영되면 전부 걷어낸다.
 *
 * | 항목                           | 지금                                         | API 나온 뒤               |
 * | ------------------------------ | -------------------------------------------- | ------------------------- |
 * | 홈 기본 탭(최신순 전체)        | `popular` 를 대신 호출                       | `sort=LATEST` 로 교체     |
 * | 검색 · 태스크/모델/결과물 필터 | 서버에서 최대치(50개)를 받아 클라이언트 필터 | 쿼리 파라미터로 서버 위임 |
 * | 직군 `jobTagId`                | {@link file://../tag-ids.ts} 하드코딩        | 태그 목록 API 조회        |
 */

import { GALLERY_MAX_PAGE_SIZE, GALLERY_PAGE_SIZE } from "@/features/gallery/constants";
import { JOB_TAG_ID } from "@/features/gallery/tag-ids";
import type { GalleryQuery, PromptListResponse, PromptSummary } from "@/features/gallery/types";
import { api } from "@/lib/api";

import type { ApiPromptCardList } from "./dto";
import { toPromptSummary } from "./map";

type PageParams = { page: number; size: number };

/** [HOME-001] 인기 프롬프트(좋아요순) */
export function fetchPopularPrompts(params: PageParams): Promise<ApiPromptCardList> {
  return api.get<ApiPromptCardList>("/home/prompts/popular", { params });
}

/** [HOME-002] 직군별 프롬프트(최신순) */
export function fetchJobPrompts(jobTagId: number, params: PageParams): Promise<ApiPromptCardList> {
  return api.get<ApiPromptCardList>(`/home/prompts/jobs/${jobTagId}`, { params });
}

/**
 * 서버가 처리하지 못하는 필터 축이 걸려 있는가.
 *
 * 하나라도 걸려 있으면 "많이 받아서 클라이언트에서 거른다" 경로로 간다.
 * 아무것도 없으면 서버 페이지네이션을 그대로 신뢰한다(정상 경로).
 */
export function hasClientFilters(query: GalleryQuery): boolean {
  return (
    query.tasks.length > 0 ||
    query.models.length > 0 ||
    query.outputTypes.length > 0 ||
    query.q.trim().length > 0
  );
}

/**
 * 클라이언트 필터 — 축 내부 OR, 축 간 AND (기술명세 F-1.4).
 *
 * 검색어는 **제목만** 본다. 목록 응답에 `description` 이 없어 설명까지 훑을 수 없다
 * (서버 검색이 붙으면 제목+설명 모두 대상).
 */
export function applyClientFilters(items: PromptSummary[], query: GalleryQuery): PromptSummary[] {
  const keyword = query.q.trim().toLowerCase();

  return items.filter((item) => {
    if (query.tasks.length > 0 && !item.tasks.some((t) => query.tasks.includes(t))) return false;
    if (query.models.length > 0 && !query.models.includes(item.model)) return false;
    if (query.outputTypes.length > 0 && !query.outputTypes.includes(item.outputType)) return false;
    if (keyword && !item.title.toLowerCase().includes(keyword)) return false;
    return true;
  });
}

function fetchByNav(query: GalleryQuery, params: PageParams): Promise<ApiPromptCardList> {
  if (query.nav === "job" && query.job) {
    return fetchJobPrompts(JOB_TAG_ID[query.job], params);
  }
  // nav=home(최신순)도 최신순 API 가 없어 인기순으로 대신 채운다(요청서 H-1).
  return fetchPopularPrompts(params);
}

export async function fetchPrompts(query: GalleryQuery): Promise<PromptListResponse> {
  const filtering = hasClientFilters(query);

  // 필터가 걸리면 페이지를 나누기 전에 전체를 봐야 하므로 1페이지에 최대치를 받는다.
  const params: PageParams = filtering
    ? { page: 0, size: GALLERY_MAX_PAGE_SIZE }
    : { page: query.page - 1, size: GALLERY_PAGE_SIZE };

  const result = await fetchByNav(query, params);
  const items = result.prompts.map(toPromptSummary);

  if (!filtering) {
    // 서버 응답(0-based page + totalElements) → 화면이 쓰는 1-based 메타
    const size = result.page.size || GALLERY_PAGE_SIZE;
    return {
      items,
      page: result.page.page + 1,
      totalPages: Math.max(1, Math.ceil(result.page.totalElements / size)),
      totalCount: result.page.totalElements,
    };
  }

  // 클라이언트 필터 경로 — 걸러낸 뒤 직접 페이지를 자른다.
  // 한계: 서버가 준 첫 50개 안에서만 찾는다(그 뒤 결과는 누락). 서버 필터가 붙으면 사라진다.
  const filtered = applyClientFilters(items, query);
  const totalPages = Math.max(1, Math.ceil(filtered.length / GALLERY_PAGE_SIZE));
  // 필터 변경 시 page 는 1로 리셋되지만, 뒤로가기 등으로 범위 밖 page 가 들어올 수 있다.
  const page = Math.min(Math.max(query.page, 1), totalPages);
  const start = (page - 1) * GALLERY_PAGE_SIZE;

  return {
    items: filtered.slice(start, start + GALLERY_PAGE_SIZE),
    page,
    totalPages,
    totalCount: filtered.length,
  };
}

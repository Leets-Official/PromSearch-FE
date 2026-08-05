/**
 * 홈 갤러리 목록 API — `[HOME-001] GET /home/prompts`.
 *
 * 정렬·직군·태스크·AI모델·결과물타입·검색·페이지를 **서버가 전부 처리**한다.
 * (예전에는 최신순 API 가 없어 인기순으로 대체하고, 필터·검색을 클라이언트에서
 *  돌렸는데 통합 API 가 나오면서 전부 걷어냈다.)
 *
 * 남은 임시 조치는 직군 태그 ID 하드코딩 하나뿐이다 — {@link file://../tag-ids.ts}.
 */

import { GALLERY_PAGE_SIZE } from "@/features/gallery/constants";
import { AI_MODEL_TAG_ID, JOB_TAG_ID, TASK_TAG_ID } from "@/features/gallery/tag-ids";
import type { GalleryQuery, PromptListResponse } from "@/features/gallery/types";
import { api, toNumber } from "@/lib/api";

import type { ApiOutputType, ApiPromptCardList } from "./dto";
import { toPromptSummary } from "./map";

/** 결과물 타입 FE enum → 서버 enum */
const OUTPUT_TYPE_TO_API: Record<string, ApiOutputType> = { image: "IMAGE", text: "TEXT" };

/**
 * 멀티 값은 **콤마 구분** 문자열로 보낸다(BE 규격).
 * 빈 배열이면 `undefined` 를 돌려 axios 가 키 자체를 생략하게 한다.
 */
function commaList(values: (string | number)[]): string | undefined {
  return values.length > 0 ? values.join(",") : undefined;
}

/** 화면 필터 상태 → 서버 쿼리 파라미터 */
export function toQueryParams(query: GalleryQuery) {
  return {
    // 사이드바 "인기"만 좋아요순, 나머지(홈·직군별)는 최신순
    sort: query.nav === "popular" ? "POPULAR" : "LATEST",
    jobTagId: query.nav === "job" && query.job ? JOB_TAG_ID[query.job] : undefined,
    taskTagIds: commaList(query.tasks.map((task) => TASK_TAG_ID[task])),
    aiModelTagIds: commaList(
      // "기타"는 태그가 없어(ID null) 필터로 보낼 수 없다 — 선택돼도 빠진다.
      query.models.map((model) => AI_MODEL_TAG_ID[model]).filter((id): id is number => id !== null),
    ),
    outputTypes: commaList(query.outputTypes.map((type) => OUTPUT_TYPE_TO_API[type])),
    q: query.q.trim() || undefined,
    page: query.page - 1,
    size: GALLERY_PAGE_SIZE,
  };
}

export async function fetchPrompts(query: GalleryQuery): Promise<PromptListResponse> {
  const result = await api.get<ApiPromptCardList>("/home/prompts", {
    params: toQueryParams(query),
  });

  // 서버가 숫자를 문자열로 주므로 반드시 정규화한다(lib/api/number.ts 주석 참고).
  const totalCount = toNumber(result.page.totalElements);
  const size = toNumber(result.page.size, GALLERY_PAGE_SIZE) || GALLERY_PAGE_SIZE;

  return {
    items: result.prompts.map(toPromptSummary),
    page: toNumber(result.page.page) + 1,
    totalPages: Math.max(1, Math.ceil(totalCount / size)),
    totalCount,
  };
}

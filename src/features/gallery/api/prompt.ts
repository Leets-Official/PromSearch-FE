/**
 * 갤러리 목록 API.
 *
 * 현재는 MSW 목(`GET /api/prompts`)을 호출한다. BE 스펙 확정 시 응답 매핑만 이 파일에서 교체한다.
 */

import type { GalleryQuery, PromptListResponse } from "@/features/gallery/types";
import { devPreviewFetchHeaders } from "@/lib/dev-preview";

/**
 * 필터 상태 → 쿼리스트링. 기본값(빈 배열·빈 문자열·page 1·nav home)은 생략해 URL 을 깔끔하게 유지한다.
 * 순수 함수라 단독 테스트 가능(필터가 쿼리에 정확히 반영되는지 고정).
 */
export function toSearchParams(query: GalleryQuery): URLSearchParams {
  const params = new URLSearchParams();

  if (query.nav !== "home") params.set("nav", query.nav);
  if (query.job) params.set("job", query.job);
  if (query.tasks.length > 0) params.set("tasks", query.tasks.join(","));
  if (query.models.length > 0) params.set("models", query.models.join(","));
  if (query.outputTypes.length > 0) params.set("types", query.outputTypes.join(","));
  if (query.q.trim()) params.set("q", query.q.trim());
  if (query.page > 1) params.set("page", String(query.page));

  return params;
}

export async function fetchPrompts(query: GalleryQuery): Promise<PromptListResponse> {
  const params = toSearchParams(query);
  const qs = params.toString();
  const res = await fetch(`/api/prompts${qs ? `?${qs}` : ""}`, {
    headers: devPreviewFetchHeaders(),
  });

  if (!res.ok) {
    throw new Error(`프롬프트 목록 조회 실패: ${res.status}`);
  }

  return (await res.json()) as PromptListResponse;
}

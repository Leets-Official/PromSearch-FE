/**
 * 갤러리 목록 질의 의미(순수 함수).
 *
 * 목 핸들러와 테스트가 공유한다. 실제 BE 가 이 규칙을 서버에서 수행할 예정이므로,
 * 여기서 "필터/정렬/페이지네이션 계약"을 순수 함수로 못 박아 테스트로 고정한다.
 *
 * 규칙(기술명세 F-1.1/F-1.4/F-1.5):
 * - status=ACTIVE 만 노출 (DRAFT/HIDDEN 제외)
 * - 직군(job): 단일. 아이템 jobCategories 에 포함되면 통과
 * - 태스크/모델/결과물타입: 멀티. "축 내부 OR, 축 간 AND"
 *   - tasks:  아이템 tasks 와 교집합이 있으면 통과
 *   - models: 아이템 model 이 선택값에 포함되면 통과
 *   - outputTypes: 아이템 outputType 이 선택값에 포함되면 통과
 * - q: 제목/설명에 대소문자 무시 부분일치
 * - 정렬: nav=popular → 좋아요(likes) 내림차순, 그 외 → createdAt 내림차순(최신)
 *   (BE 회의 확정: 인기 기준은 좋아요. 조회수는 추후 검토)
 * - 페이지네이션: 1-based, 기본 size=12
 */

import type { PromptRecord } from "@/mocks/data/prompts";
import type {
  AiModel,
  GalleryNav,
  JobCategory,
  OutputType,
  PromptListResponse,
  PromptSummary,
  Task,
} from "@/features/gallery/types";

export const DEFAULT_PAGE_SIZE = 12;

export type PromptQueryParams = {
  nav: GalleryNav;
  job: JobCategory | null;
  tasks: Task[];
  models: AiModel[];
  outputTypes: OutputType[];
  q: string;
  page: number;
  size?: number;
};

function hasIntersection<T>(a: T[], b: T[]): boolean {
  return a.some((v) => b.includes(v));
}

function toSummary(record: PromptRecord): PromptSummary {
  // status 는 목록 응답에서 제거(카드는 ACTIVE 만 다룸)
  const { status: _status, ...summary } = record;
  void _status;
  return summary;
}

export function queryPrompts(
  records: PromptRecord[],
  params: PromptQueryParams,
): PromptListResponse {
  const { nav, job, tasks, models, outputTypes, q } = params;
  const size = params.size ?? DEFAULT_PAGE_SIZE;
  const keyword = q.trim().toLowerCase();

  const filtered = records.filter((r) => {
    if (r.status !== "active") return false;
    if (job && !r.jobCategories.includes(job)) return false;
    if (tasks.length > 0 && !hasIntersection(r.tasks, tasks)) return false;
    if (models.length > 0 && !models.includes(r.model)) return false;
    if (outputTypes.length > 0 && !outputTypes.includes(r.outputType)) return false;
    if (keyword) {
      const haystack = `${r.title} ${r.description ?? ""}`.toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (nav === "popular") {
      // 인기 = 좋아요 수 내림차순 (조회수/복사수는 기준 아님 — BE 회의 확정)
      const likeDiff = b.stats.likes - a.stats.likes;
      if (likeDiff !== 0) return likeDiff;
    }
    // 최신순 (createdAt 내림차순) — popular 동점 시 tie-breaker 로도 사용
    return b.createdAt.localeCompare(a.createdAt);
  });

  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / size));
  const page = Math.min(Math.max(1, params.page), totalPages);
  const start = (page - 1) * size;
  const items = sorted.slice(start, start + size).map(toSummary);

  return { items, page, totalPages, totalCount };
}

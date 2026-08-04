/**
 * 홈 목록 API(`HOME-001/002`) 응답 목 — **BE 서버 장애 대응용 임시 목**.
 *
 * ⚠️ 2026-08-05 현재 `api.promsearch.kr` 이 TCP 는 받지만 HTTP 응답을 돌려주지 않아
 * (`socket hang up`) 홈 화면을 확인할 수 없다. BE 가 복구되면 이 파일과
 * `handlers.ts` 의 `/api/v1/home/prompts/*` 핸들러 두 개를 **삭제**하면 그대로 실서버에 붙는다.
 *
 * 목이지만 **응답 형태는 Swagger 그대로**(`ApiPromptCardList`)라, 지우기 전까지
 * `api/map.ts` 의 변환·페이지 계산·클라이언트 필터가 실제 계약대로 검증된다.
 * 기존 갤러리 시드(`data/prompts.ts`)를 서버 모양으로 되돌려 쓰므로 데이터 출처는 하나다.
 */

import { AI_MODEL_LABEL, JOB_CATEGORY_LABEL, TASK_LABEL } from "@/features/gallery/categories";
import { AI_MODEL_TAG_ID, JOB_TAG_ID, TASK_TAG_ID } from "@/features/gallery/tag-ids";
import type {
  ApiContentType,
  ApiOutputType,
  ApiPromptCard,
  ApiTag,
} from "@/features/gallery/api/dto";
import type { ContentTier, OutputType } from "@/features/gallery/types";
import { PROMPT_SEED, type PromptRecord } from "@/mocks/data/prompts";

const OUTPUT_TYPE_TO_API: Record<OutputType, ApiOutputType> = { image: "IMAGE", text: "TEXT" };
const TIER_TO_API: Record<ContentTier, ApiContentType> = {
  free: "FREE",
  premium: "PREMIUM",
};

/**
 * FE 시드(도메인 모양) → 서버 카드(응답 모양). `api/map.ts` 의 역방향이다.
 *
 * "기타" 모델은 BE 회신대로 **태그를 만들지 않고**(태그 ID 자체가 없음) 자유 입력값을
 * `customAiModel` 에 담는다(2026-08-05 BE 확정). 기본 모델은 `null`.
 */
function toApiCard(record: PromptRecord, index: number): ApiPromptCard {
  const tags: ApiTag[] = [
    ...record.jobCategories.map((job) => ({
      tagId: JOB_TAG_ID[job],
      tagType: "JOB" as const,
      name: JOB_CATEGORY_LABEL[job],
    })),
    ...record.tasks.map((task) => ({
      tagId: TASK_TAG_ID[task],
      tagType: "TASK" as const,
      name: TASK_LABEL[task],
    })),
  ];

  const aiModelTagId = AI_MODEL_TAG_ID[record.model];
  if (aiModelTagId !== null) {
    tags.push({ tagId: aiModelTagId, tagType: "AI_MODEL", name: AI_MODEL_LABEL[record.model] });
  }

  return {
    // 시드 id 는 `prompt-001` 문자열이라 숫자 식별자로 바꾼다(서버는 int64)
    promptId: index + 1,
    title: record.title,
    thumbnailImageUrl: record.thumbnailUrl ?? null,
    outputType: OUTPUT_TYPE_TO_API[record.outputType],
    contentType: TIER_TO_API[record.tier],
    pricePoint: record.tier === "free" ? 0 : 500,
    author: {
      userId: (index % 7) + 1,
      nickname: record.author.name,
      profileImageUrl: record.author.avatarUrl ?? null,
    },
    statistics: {
      viewCount: record.stats.views,
      likeCount: record.stats.likes,
      commentCount: index % 9,
      copyCount: record.stats.copies,
    },
    viewerInteraction: { liked: false, bookmarked: false },
    tags,
    customAiModel: record.model === "etc" ? (record.modelEtcName ?? null) : null,
    createdAt: record.createdAt,
  };
}

/** 홈에 노출되는 카드(= status ACTIVE 만). 시드 순서를 유지해 promptId 를 안정적으로 고정한다. */
const ACTIVE_CARDS: ApiPromptCard[] = PROMPT_SEED.map(toApiCard).filter(
  (_, i) => PROMPT_SEED[i].status === "active",
);

/** [HOME-001] 좋아요 내림차순 */
export function popularCards(): ApiPromptCard[] {
  return [...ACTIVE_CARDS].sort((a, b) => b.statistics.likeCount - a.statistics.likeCount);
}

/** [HOME-002] 해당 직군 태그를 가진 카드만, 최신순 */
export function jobCards(jobTagId: number): ApiPromptCard[] {
  return ACTIVE_CARDS.filter((card) =>
    card.tags.some((tag) => tag.tagType === "JOB" && tag.tagId === jobTagId),
  ).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

/** 서버와 동일한 오프셋 페이지네이션(0-based) + `{ prompts, page }` 봉투 속 result */
export function paginate(cards: ApiPromptCard[], page: number, size: number) {
  const start = page * size;
  const sliced = cards.slice(start, start + size);

  return {
    prompts: sliced,
    page: {
      page,
      size,
      totalElements: cards.length,
      hasNext: start + size < cards.length,
    },
  };
}

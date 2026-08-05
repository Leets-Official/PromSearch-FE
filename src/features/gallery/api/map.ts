/**
 * BE 응답(`ApiPromptCard`) → FE 도메인(`PromptSummary`) 변환.
 *
 * 순수 함수라 단독 테스트가 가능하고, 화면·훅은 서버 모양을 전혀 모른다.
 * BE 스키마가 바뀌면 이 파일 하나만 고치면 된다.
 *
 * 서버는 태그를 `{ tagId, tagType, name }` 로 주고 FE 는 enum(`designer`, `ppt`, …)을 쓰므로
 * **표시명(name) → enum** 으로 역매핑한다. 매핑에 없는 이름은 조용히 버린다(BE 가 태그를
 * 추가해도 화면이 깨지지 않게). 태그 목록 API(TAG-001)가 생기면 이 역매핑은 제거하고
 * 서버 name 을 그대로 라벨로 쓰게 바꾼다.
 */

import { AI_MODELS, JOB_CATEGORIES, TASKS, type Option } from "@/features/gallery/categories";
import { toNumber } from "@/lib/api";
import type {
  AiModel,
  ContentTier,
  JobCategory,
  OutputType,
  PromptSummary,
  Task,
} from "@/features/gallery/types";

import type { ApiContentType, ApiOutputType, ApiPromptCard, ApiTag } from "./dto";

/** 표시명 → enum 역매핑 테이블 생성 */
function toValueMap<T extends string>(options: readonly Option<T>[]): Record<string, T> {
  return Object.fromEntries(options.map(({ value, label }) => [label, value]));
}

const JOB_BY_NAME = toValueMap(JOB_CATEGORIES);
const TASK_BY_NAME = toValueMap(TASKS);
const AI_MODEL_BY_NAME = toValueMap(AI_MODELS);

const OUTPUT_TYPE_BY_API: Record<ApiOutputType, OutputType> = {
  IMAGE: "image",
  TEXT: "text",
};

const TIER_BY_API: Record<ApiContentType, ContentTier> = {
  FREE: "free",
  PREMIUM: "premium",
};

/** 서버 결과물 타입 → FE enum. 모르는 값이 와도 화면이 죽지 않게 text 로 떨어뜨린다. */
export function toOutputType(value: ApiOutputType): OutputType {
  return OUTPUT_TYPE_BY_API[value] ?? "text";
}

/** 서버 콘텐츠 등급 → FE enum. 모르는 값은 free(잠금 없음)로 본다. */
export function toContentTier(value: ApiContentType): ContentTier {
  return TIER_BY_API[value] ?? "free";
}

/** 특정 축의 태그만 골라 enum 배열로. 매핑에 없는 이름은 제외. */
function pickTags<T extends string>(
  tags: ApiTag[],
  tagType: ApiTag["tagType"],
  byName: Record<string, T>,
): T[] {
  return tags
    .filter((tag) => tag.tagType === tagType)
    .map((tag) => byName[tag.name])
    .filter((value): value is T => value !== undefined);
}

export const pickJobTags = (tags: ApiTag[]) => pickTags<JobCategory>(tags, "JOB", JOB_BY_NAME);
export const pickTaskTags = (tags: ApiTag[]) => pickTags<Task>(tags, "TASK", TASK_BY_NAME);

/**
 * 대표 AI 모델 — AI_MODEL 태그 첫 번째를 쓴다.
 *
 * "기타"는 BE 에 태그 행이 없어 `tags` 에 AI_MODEL 항목이 아예 오지 않는다. 그 경우 자유 입력값인
 * `customAiModel` 을 `modelEtcName` 으로 넘겨 카드/상세가 입력값 그대로 노출하게 한다.
 * `customAiModel` 이 비어 있으면(BE 배포 전 응답) `modelEtcName` 없이 "기타"로만 뜬다.
 */
export function resolveModel(
  tags: ApiTag[],
  customAiModel?: string | null,
): { model: AiModel; modelEtcName?: string } {
  const tag = tags.find((t) => t.tagType === "AI_MODEL");
  const known = tag ? AI_MODEL_BY_NAME[tag.name] : undefined;

  if (known && known !== "etc") return { model: known };

  // 태그가 없거나(기타) 매핑에 없는 이름이면 자유 입력값 → 태그 원문 순으로 표시명을 찾는다.
  return { model: "etc", modelEtcName: customAiModel ?? tag?.name ?? undefined };
}

export function toPromptSummary(card: ApiPromptCard): PromptSummary {
  const { model, modelEtcName } = resolveModel(card.tags, card.customAiModel);

  return {
    id: String(card.promptId),
    title: card.title,
    thumbnailUrl: card.thumbnailImageUrl ?? undefined,
    outputType: toOutputType(card.outputType),
    model,
    modelEtcName,
    tasks: pickTaskTags(card.tags),
    jobCategories: pickJobTags(card.tags),
    tier: toContentTier(card.contentType),
    author: {
      name: card.author.nickname,
      avatarUrl: card.author.profileImageUrl ?? undefined,
    },
    // 서버가 숫자를 문자열로 준다 → 반드시 정규화(lib/api/number.ts)
    stats: {
      views: toNumber(card.statistics.viewCount),
      copies: toNumber(card.statistics.copyCount),
      likes: toNumber(card.statistics.likeCount),
    },
    createdAt: card.createdAt,
  };
}

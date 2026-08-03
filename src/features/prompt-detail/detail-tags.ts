import {
  AI_MODEL_LABEL,
  JOB_CATEGORY_LABEL,
  OUTPUT_TYPE_LABEL,
  TASK_LABEL,
  TIER_LABEL,
} from "@/features/gallery/categories";
import type { PromptSummary } from "@/features/gallery/types";

/**
 * 상세 태그 라벨 — 등급 · 직군(복수) · 태스크(복수) · 모델 · 결과물타입.
 * 카드(대표값만)와 달리 상세는 피그마 기준 모든 축을 노출한다.
 */
export function buildDetailTags(prompt: PromptSummary): string[] {
  const modelLabel =
    prompt.model === "etc"
      ? (prompt.modelEtcName ?? AI_MODEL_LABEL.etc)
      : AI_MODEL_LABEL[prompt.model];

  return [
    TIER_LABEL[prompt.tier],
    ...prompt.jobCategories.map((j) => JOB_CATEGORY_LABEL[j]),
    ...prompt.tasks.map((t) => TASK_LABEL[t]),
    modelLabel,
    OUTPUT_TYPE_LABEL[prompt.outputType],
  ];
}

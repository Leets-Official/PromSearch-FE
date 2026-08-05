import {
  AI_MODEL_LABEL,
  JOB_CATEGORY_LABEL,
  OUTPUT_TYPE_LABEL,
  TASK_LABEL,
} from "@/features/gallery/categories";
import type { PromptSummary } from "@/features/gallery/types";

/**
 * 상세 태그 라벨 — 직군(복수) · 태스크(복수) · 모델 · 결과물타입.
 * 카드(대표값만)와 달리 상세는 각 축을 모두 노출하며, 순서는 홈 필터와 같다.
 *
 * 게시글 타입(무료/프리미엄)은 **태그로 표시하지 않는다**(디자인 QA). 그건 분류축이 아니라
 * 열람 조건이고, 잠긴 레시피의 잠금 UI 가 이미 그 사실을 훨씬 분명하게 알려 준다.
 */
export function buildDetailTags(prompt: PromptSummary): string[] {
  const modelLabel =
    prompt.model === "etc"
      ? (prompt.modelEtcName ?? AI_MODEL_LABEL.etc)
      : AI_MODEL_LABEL[prompt.model];

  return [
    ...prompt.jobCategories.map((j) => JOB_CATEGORY_LABEL[j]),
    ...prompt.tasks.map((t) => TASK_LABEL[t]),
    modelLabel,
    OUTPUT_TYPE_LABEL[prompt.outputType],
  ];
}

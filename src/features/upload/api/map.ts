/**
 * 폼 값 ↔ 서버 요청/응답 변환. 순수 함수라 단독 테스트가 가능하다.
 *
 * 서버는 태그를 **ID** 로 받고 FE 는 enum(`designer`, `ppt`, …)을 쓰므로 여기서 뒤집는다.
 * 태그 ID 는 아직 하드코딩(`gallery/tag-ids.ts`)이고, 태그 목록 API(요청서 C-1)가 생기면
 * 그 응답을 참조하도록 이 파일만 바꾸면 된다.
 */

import { AI_MODEL_TAG_ID, JOB_TAG_ID, TASK_TAG_ID } from "@/features/gallery/tag-ids";
import type { AiModel, JobCategory, Task } from "@/features/gallery/types";

import type { ApiDraftResult, ApiPromptWriteRequest } from "./dto";
import type { PromptDraft, PromptFormValues } from "../types";
import type { PromptImageValue } from "../schema";

/** enum → 태그 ID. 매핑에 없는 값은 버린다(BE 태그가 바뀌어도 요청이 깨지지 않게). */
function toTagIds<T extends string>(values: T[] | undefined, table: Record<T, number>): number[] {
  return (values ?? []).map((value) => table[value]).filter((id): id is number => id != null);
}

/** ID → enum 역매핑(임시저장 복원용) */
function toEnums<T extends string>(ids: number[] | undefined, table: Record<T, number>): T[] {
  const byId = new Map(Object.entries(table).map(([key, id]) => [id as number, key as T]));
  return (ids ?? []).map((id) => byId.get(id)).filter((value): value is T => value !== undefined);
}

/**
 * 폼 값 → 요청 본문.
 *
 * 임시저장은 부분 작성을 허용해 값이 비어 있을 수 있으므로 `Partial` 을 받는다.
 * 서버가 요구하는 건 제목뿐이고 나머지는 생략 가능하다(PROMPT-005).
 */
export function toWriteRequest(values: Partial<PromptFormValues>): ApiPromptWriteRequest {
  const aiModelTagId = values.model ? AI_MODEL_TAG_ID[values.model] : null;

  return {
    title: values.title ?? "",
    description: values.description,
    outputType: values.outputType === "image" ? "IMAGE" : values.outputType ? "TEXT" : undefined,
    jobTagIds: toTagIds<JobCategory>(values.jobCategories, JOB_TAG_ID),
    taskTagIds: toTagIds<Task>(values.tasks, TASK_TAG_ID),
    // "기타"는 태그가 없어 ID 가 null 이다 → 필드를 아예 빼고 customAiModel 로만 보낸다.
    ...(aiModelTagId !== null && aiModelTagId !== undefined
      ? { aiModelTagId, aiModelTagIds: [aiModelTagId] }
      : {}),
    customAiModel: values.model === "etc" ? values.modelEtcName?.trim() || null : null,
    contentType: values.tier === "premium" ? "PREMIUM" : values.tier ? "FREE" : undefined,
    promptBody: values.body,
    // 업로드 폼에 공개 범위 선택이 없다(시안에 없음). 전부 공개로 보낸다.
    visibility: "PUBLIC",
    images: (values.images ?? []).map((image, index) => ({
      imageId: image.imageId,
      sortOrder: index,
      // 첫 장을 대표 이미지로 — 카드 썸네일이 된다.
      thumbnail: index === 0,
    })),
  };
}

/** 서버 임시저장 → 폼 값(부분) */
export function toPromptDraft(result: ApiDraftResult): PromptDraft {
  const model = toModel(result);

  return {
    title: result.title,
    description: result.description,
    outputType: result.outputType === "IMAGE" ? "image" : result.outputType ? "text" : undefined,
    jobCategories: toEnums<JobCategory>(result.jobTagIds, JOB_TAG_ID),
    tasks: toEnums<Task>(result.taskTagIds, TASK_TAG_ID),
    model,
    modelEtcName: model === "etc" ? (result.customAiModel ?? "") : "",
    tier: result.contentType === "PREMIUM" ? "premium" : "free",
    body: result.promptBody,
    images: toDraftImages(result),
    updatedAt: result.updatedAt,
  };
}

/** 저장된 AI 모델 태그 ID → enum. 태그가 없고 customAiModel 만 있으면 "기타". */
function toModel(result: ApiDraftResult): AiModel | undefined {
  const id = result.aiModelTagId ?? result.aiModelTagIds?.[0];
  if (id != null) {
    const found = (Object.keys(AI_MODEL_TAG_ID) as AiModel[]).find(
      (key) => AI_MODEL_TAG_ID[key] === id,
    );
    if (found) return found;
  }
  return result.customAiModel ? "etc" : undefined;
}

/**
 * 임시저장 이미지 복원.
 *
 * 초안 응답에는 `imageId` 만 있고 조회용 URL 이 없다. 미리보기는 호출부(`api/upload.ts`)가
 * 상태 API(`PROMPT-004`)를 한 번 더 태워 채운다 — 거기에만 `imageUrl` 이 있다.
 * 여기서는 일단 서버가 보관 중인 이미지이므로 ready 로 두고, 상태 조회가 실제 값으로 덮는다.
 */
function toDraftImages(result: ApiDraftResult): PromptImageValue[] {
  return (result.images ?? [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((image) => ({ imageId: image.imageId, status: "ready" as const }));
}

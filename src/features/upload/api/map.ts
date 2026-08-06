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
    /*
      **READY 인 이미지만 보낸다.**

      게시(PROMPT-008)는 스키마 refine 이 이미 막지만, 임시저장은 부분 작성을 허용하느라
      검증을 거치지 않아 처리 중·실패 이미지가 그대로 실려 나갔다. 그렇게 저장된 imageId 는
      서버에 워터마크 결과물이 없어서, 다음 복원 때 상태 조회(PROMPT-004)를 통째로 실패시킨다
      — 그 API 는 하나라도 없거나 남의 것이면 **전체가 실패**한다.
      결국 오염된 한 장이 나머지 이미지의 미리보기까지 전부 날린다.

      sortOrder·thumbnail 은 **거른 뒤의 순서** 기준이어야 한다(중간이 빠지면 번호가 뜨고,
      1번이 빠지면 대표 이미지가 사라진다).
    */
    images: (values.images ?? [])
      .filter((image) => image.status === "ready")
      .map((image, index) => ({
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
 * 초안 응답에는 `imageId` 만 있고 조회용 URL 도 상태도 없다. 실제 상태와 미리보기는
 * 호출부(`api/upload.ts`)가 상태 API(`PROMPT-004`)를 한 번 더 태워 채운다 — 거기에만 있다.
 *
 * 그래서 여기 값은 **상태 조회가 실패했을 때만 화면에 남는다.** 예전에는 `ready` 로 뒀는데,
 * 그건 확인한 적 없는 것을 확인했다고 말하는 셈이라 깨진 이미지가 멀쩡한 얼굴로 복원됐다
 * (그 상태로 게시하면 서버가 "워터마크 처리가 완료되지 않은 이미지입니다" 로 거절한다).
 *
 * 검증하지 못했으면 `failed` 다 — 타일에 "실패"가 뜨고 저장·게시가 막히므로,
 * 사용자가 지우고 다시 올릴 수 있다. 조회가 성공하면 이 값은 실제 상태로 통째로 교체된다.
 */
function toDraftImages(result: ApiDraftResult): PromptImageValue[] {
  return (result.images ?? [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((image) => ({ imageId: image.imageId, status: "failed" as const }));
}

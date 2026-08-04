/**
 * 프롬프트 게시 / 임시저장 API.
 *
 * - `[PROMPT-008] POST   /prompts`        게시
 * - `[PROMPT-005] PUT    /prompts/draft`  임시저장 생성·교체(계정당 1슬롯)
 * - `[PROMPT-006] GET    /prompts/draft`  임시저장 조회 (없으면 404)
 * - `[PROMPT-007] DELETE /prompts/draft`  임시저장 삭제
 *
 * 임시저장은 **계정당 하나**라 엔드포인트에 id 가 없다(요청서 7-6 확정).
 */

import { api, isApiError } from "@/lib/api";

import type { ApiDraftResult, ApiPromptWriteResult } from "./dto";
import { toPromptDraft, toWriteRequest } from "./map";
import type { CreatePromptResponse, DraftResponse, PromptDraft, PromptFormValues } from "../types";

/** 프롬프트 게시 — 성공하면 상세로 이동할 id 를 돌려준다. */
export async function createPrompt(values: PromptFormValues): Promise<CreatePromptResponse> {
  const result = await api.post<ApiPromptWriteResult>("/prompts", toWriteRequest(values));
  return { id: String(result.promptId) };
}

/**
 * 임시저장 조회.
 *
 * **초안이 없으면 서버가 404 를 준다.** 이건 오류가 아니라 "없음"이므로 `draft: null` 로 바꾼다
 * (그대로 두면 화면이 에러 상태로 빠진다).
 */
export async function fetchDraft(): Promise<DraftResponse> {
  try {
    const result = await api.get<ApiDraftResult>("/prompts/draft");
    return { draft: toPromptDraft(result) };
  } catch (error) {
    if (isApiError(error) && error.status === 404) return { draft: null };
    throw error;
  }
}

/** 임시저장(단일 슬롯 덮어쓰기). 부분 작성이라 폼 값이 비어 있을 수 있다. */
export async function saveDraft(values: Partial<PromptFormValues>): Promise<PromptDraft> {
  const result = await api.put<ApiPromptWriteResult>("/prompts/draft", toWriteRequest(values));
  // 응답은 확정된 메타만 준다 → 화면 캐시는 보낸 값 + 서버 시각으로 채운다.
  return { ...values, updatedAt: result.updatedAt };
}

/** 임시저장 삭제("새로 작성하기" / 게시 완료 정리) */
export function deleteDraft(): Promise<void> {
  return api.delete("/prompts/draft");
}

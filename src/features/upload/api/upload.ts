/**
 * 업로드/임시저장 API — 프로젝트 컨벤션(상대경로 fetch + res.ok 검사 + 타입 JSON)을 따른다.
 * BE 확정 전까지 MSW 목(`/api/prompts`, `/api/prompts/draft`)이 응답한다.
 *
 * 임시저장은 단일 슬롯이라 draft 엔드포인트는 id 없이 계정 1건을 다룬다.
 */

import { devPreviewFetchHeaders } from "@/lib/dev-preview";

import type {
  CreatePromptRequest,
  CreatePromptResponse,
  DraftResponse,
  PromptDraft,
  PromptFormValues,
} from "../types";

const JSON_HEADERS = { "Content-Type": "application/json" };

/** 프롬프트 게시(생성) */
export async function createPrompt(body: CreatePromptRequest): Promise<CreatePromptResponse> {
  const res = await fetch("/api/prompts", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`프롬프트 게시 실패: ${res.status}`);
  return (await res.json()) as CreatePromptResponse;
}

/** 임시저장 조회 — 없으면 draft: null (읽기 요청이라 dev 프리뷰 헤더 부착) */
export async function fetchDraft(): Promise<DraftResponse> {
  const res = await fetch("/api/prompts/draft", {
    headers: devPreviewFetchHeaders(),
  });
  if (!res.ok) throw new Error(`임시저장 조회 실패: ${res.status}`);
  return (await res.json()) as DraftResponse;
}

/** 임시저장(단일 슬롯 덮어쓰기) */
export async function saveDraft(values: PromptFormValues): Promise<PromptDraft> {
  const res = await fetch("/api/prompts/draft", {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(values),
  });
  if (!res.ok) throw new Error(`임시저장 실패: ${res.status}`);
  return (await res.json()) as PromptDraft;
}

/** 임시저장 삭제(새로 작성하기 / 게시 완료 시 정리) */
export async function deleteDraft(): Promise<void> {
  const res = await fetch("/api/prompts/draft", { method: "DELETE" });
  if (!res.ok) throw new Error(`임시저장 삭제 실패: ${res.status}`);
}

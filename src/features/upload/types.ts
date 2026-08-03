/**
 * 프롬프트 업로드(작성) 도메인 타입.
 *
 * 값 타입은 zod 스키마(schema.ts)에서 파생한다(단일 출처). 게시 시 **모든 필드 필수**라
 * nullable 필드가 없다 — "무엇이 필수/선택인가"는 schema.ts 한 곳만 보면 된다.
 * 임시저장(초안)만 부분 작성을 허용하므로 별도의 Partial 타입으로 다룬다.
 */

import type { PromptFormSchema } from "./schema";

/** 업로드 폼 값(= 게시 요청 값). 검증 통과 형태라 모든 필드가 채워져 있다(null/미선택 없음). */
export type PromptFormValues = PromptFormSchema;

/** 게시 요청 본문 */
export type CreatePromptRequest = PromptFormValues;

/** 게시 응답 — 생성된 프롬프트 식별자(상세로 이동) */
export type CreatePromptResponse = {
  id: string;
};

/**
 * 임시저장 1건(단일 슬롯). 부분 작성 상태를 그대로 보관하므로 폼 값의 부분집합 + 저장 시각.
 */
export type PromptDraft = Partial<PromptFormValues> & {
  /** ISO 문자열 — 저장 시각 */
  updatedAt: string;
};

/** 임시저장 조회 응답 — 없으면 draft: null */
export type DraftResponse = {
  draft: PromptDraft | null;
};

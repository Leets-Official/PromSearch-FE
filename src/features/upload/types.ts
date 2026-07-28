/**
 * 프롬프트 업로드(작성) 도메인 타입.
 *
 * 기획 확정값:
 * - 글자 수 제한은 제목에만 둔다(최대 100자). 그 외 필드는 제한 없음.
 * - 결과물(outputType)만 단일 선택, 직군/태스크/AI모델은 복수 선택.
 * - 임시저장은 계정당 1건만 유지한다(단일 슬롯). 저장 시 기존 임시저장을 덮어쓴다.
 *
 * BE 스펙 확정 전이라 요청/응답 형태는 여기서 정의하고 MSW 목으로 병렬 개발한다.
 * gallery 의 도메인 유니온(JobCategory/Task/AiModel/OutputType/ContentTier)을 재사용해
 * 단일 출처를 유지한다.
 */

import type { AiModel, ContentTier, JobCategory, OutputType, Task } from "@/features/gallery/types";

/** 업로드 폼 값(react-hook-form 상태) */
export type PromptFormValues = {
  /** 제목 — 유일하게 글자 수 제한(100자) */
  title: string;
  /** 프롬프트 설명(요약) */
  description: string;
  /** 결과물 타입 — 단일 선택. 미선택은 null */
  outputType: OutputType | null;
  /** 직군 — 복수 선택 */
  jobCategories: JobCategory[];
  /** 태스크 — 복수 선택 */
  tasks: Task[];
  /** AI 모델 — 복수 선택. etc 포함 시 modelEtcName 사용 */
  models: AiModel[];
  /** "기타" 모델 자유 입력명(models 에 etc 포함일 때만 의미) */
  modelEtcName: string;
  /** 콘텐츠 타입 — 무료/프리미엄(세그먼트, 단일) */
  tier: ContentTier;
  /** 프롬프트 본문(실제 프롬프트 전문) */
  body: string;
  /** 결과물 이미지 — 목 단계에선 data URL, BE 연동 시 업로드 후 URL 로 교체 */
  images: string[];
};

/** 폼 초기값(빈 작성 상태) */
export const EMPTY_FORM_VALUES: PromptFormValues = {
  title: "",
  description: "",
  outputType: null,
  jobCategories: [],
  tasks: [],
  models: [],
  modelEtcName: "",
  tier: "free",
  body: "",
  images: [],
};

/** 게시 요청 본문 — 폼 값과 동일 구조(모두 채워진 상태) */
export type CreatePromptRequest = PromptFormValues;

/** 게시 응답 — 생성된 프롬프트 식별자(상세로 이동) */
export type CreatePromptResponse = {
  id: string;
};

/**
 * 임시저장 1건(단일 슬롯). 폼 값 + 저장 시각.
 * 부분 작성 상태를 그대로 보관하므로 폼 값과 동일한 관대한 형태를 쓴다.
 */
export type PromptDraft = PromptFormValues & {
  /** ISO 문자열 — 저장 시각 */
  updatedAt: string;
};

/** 임시저장 조회 응답 — 없으면 draft: null */
export type DraftResponse = {
  draft: PromptDraft | null;
};

/**
 * 갤러리 카테고리/필터 상수 — 단일 출처.
 *
 * 사이드바(직군)·상단 필터(태스크/AI모델/결과물타입)·목 데이터가 모두 이 파일을 참조한다.
 * 기획 변경 시 이 파일만 수정하면 된다. (기획 확정값 2026-07-10)
 */

import type { AiModel, ContentTier, JobCategory, OutputType, Task } from "./types";

export type Option<T extends string> = {
  value: T;
  label: string;
};

// 직군 — 사이드바 전용(단일 선택, 라우팅형)
export const JOB_CATEGORIES: readonly Option<JobCategory>[] = [
  { value: "student", label: "학생" },
  { value: "worker", label: "직장인" },
  { value: "planner", label: "기획자" },
  { value: "developer", label: "개발자" },
  { value: "designer", label: "디자이너" },
  { value: "self_employed", label: "자영업자" },
] as const;

// 태스크 — 상단 필터(멀티)
export const TASKS: readonly Option<Task>[] = [
  { value: "ppt", label: "PPT" },
  { value: "report", label: "레포트" },
  { value: "email", label: "이메일" },
  { value: "meeting_notes", label: "회의록" },
  { value: "document", label: "보고서" },
  { value: "image_gen", label: "이미지 생성" },
] as const;

// AI 모델 — 상단 필터(멀티). etc=기타(자유입력)
export const AI_MODELS: readonly Option<AiModel>[] = [
  { value: "chatgpt", label: "ChatGPT" },
  { value: "gemini", label: "Gemini" },
  { value: "claude", label: "Claude" },
  { value: "etc", label: "기타" },
] as const;

// 결과물타입 — 상단 필터(멀티). AI모델과 독립 축(F-1.4)
export const OUTPUT_TYPES: readonly Option<OutputType>[] = [
  { value: "image", label: "이미지" },
  { value: "text", label: "텍스트" },
] as const;

// 콘텐츠 등급 — 홈 필터 축은 아니고 상세 태그/배지 표시용
export const TIERS: readonly Option<ContentTier>[] = [
  { value: "free", label: "무료" },
  { value: "premium", label: "프리미엄" },
  { value: "master", label: "마스터" },
] as const;

// value → label 조회용 맵(카드 태그 표시 등)
export const JOB_CATEGORY_LABEL = toLabelMap(JOB_CATEGORIES);
export const TASK_LABEL = toLabelMap(TASKS);
export const AI_MODEL_LABEL = toLabelMap(AI_MODELS);
export const OUTPUT_TYPE_LABEL = toLabelMap(OUTPUT_TYPES);
export const TIER_LABEL = toLabelMap(TIERS);

function toLabelMap<T extends string>(options: readonly Option<T>[]): Record<T, string> {
  return options.reduce(
    (acc, { value, label }) => {
      acc[value] = label;
      return acc;
    },
    {} as Record<T, string>,
  );
}

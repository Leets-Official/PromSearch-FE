/**
 * 업로드 폼 검증 스키마 (react-hook-form + zod).
 *
 * 프로젝트 최초의 RHF+zod 도입 지점. 이후 폼은 이 패턴(feature 폴더에 schema.ts,
 * `@hookform/resolvers/zod` 로 연결)을 따른다.
 *
 * 규칙(기획 확정):
 * - 제목: 필수, 1~100자(유일한 글자 수 제한).
 * - 프롬프트 본문: 필수(게시하려면 본문이 있어야 한다).
 * - 결과물 타입: 필수(단일 선택).
 * - AI 모델(단일)로 "기타(etc)"를 고르면 modelEtcName 필수.
 * - 그 외(설명/직군/태스크/이미지)는 선택.
 * 임시저장은 부분 작성도 허용하므로 이 스키마로 검증하지 않는다(게시 전용).
 */

import { z } from "zod";

/** 제목 최대 글자 수 — 유일한 글자 수 제한 */
export const TITLE_MAX = 100;

// gallery 도메인 유니온과 1:1 (src/features/gallery/types.ts)
const outputTypeEnum = z.enum(["image", "text"]);
const aiModelEnum = z.enum(["chatgpt", "gemini", "claude", "etc"]);
const taskEnum = z.enum(["ppt", "report", "email", "meeting_notes", "document", "image_gen"]);
const jobCategoryEnum = z.enum([
  "student",
  "worker",
  "planner",
  "designer",
  "developer",
  "self_employed",
]);
const tierEnum = z.enum(["free", "premium", "master"]);

export const promptFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "제목을 입력해주세요.")
      .max(TITLE_MAX, `제목은 최대 ${TITLE_MAX}자까지 입력할 수 있어요.`),
    description: z.string(),
    outputType: outputTypeEnum.nullable().refine((v) => v !== null, {
      message: "결과물 타입을 선택해주세요.",
    }),
    jobCategories: z.array(jobCategoryEnum),
    tasks: z.array(taskEnum),
    model: aiModelEnum.nullable(),
    modelEtcName: z.string(),
    tier: tierEnum,
    body: z.string().trim().min(1, "프롬프트 본문을 입력해주세요."),
    images: z.array(z.string()),
  })
  // "기타" 모델 선택 시 자유 입력명 필수
  .refine((v) => v.model !== "etc" || v.modelEtcName.trim().length > 0, {
    path: ["modelEtcName"],
    message: "기타 모델명을 입력해주세요.",
  });

export type PromptFormSchema = z.infer<typeof promptFormSchema>;

/**
 * 업로드 폼 검증 스키마 (react-hook-form + zod).
 *
 * 프로젝트 최초의 RHF+zod 도입 지점. 이후 폼은 이 패턴(feature 폴더에 schema.ts,
 * `@hookform/resolvers/zod` 로 연결)을 따른다.
 *
 * 규칙(기획 확정): 게시(작성) 시 **모든 필드 필수** — nullable/빈 값 없음.
 * - 제목: 1~100자(유일한 글자 수 제한).
 * - 프롬프트 설명 / 본문: 필수(비어 있으면 안 됨).
 * - 결과물 타입 · AI 모델: 필수(단일 선택). AI 모델이 "기타(etc)"면 modelEtcName 필수.
 * - 직군 · 태스크: 최소 1개 이상 선택.
 * - 결과물 이미지: 최소 1장 첨부.
 * - 콘텐츠 타입: 무료/프리미엄(기본 무료).
 *
 * 이 스키마의 추론 타입(PromptFormSchema)이 곧 폼/게시 요청의 값 타입이다(단일 출처).
 * 임시저장(초안)은 부분 작성을 허용하므로 이 스키마로 검증하지 않는다(게시 전용).
 */

import { z } from "zod";

/** 제목 최대 글자 수 — 유일한 글자 수 제한 */
export const TITLE_MAX = 100;

// gallery 도메인 유니온과 1:1 (src/features/gallery/types.ts)
// 단일 선택(필수) — 미선택 시 노출할 메시지를 enum 에 지정
const outputTypeEnum = z.enum(["image", "text"], { error: "결과물 타입을 선택해주세요." });
const aiModelEnum = z.enum(["chatgpt", "gemini", "claude", "etc"], {
  error: "AI 모델을 선택해주세요.",
});
const taskEnum = z.enum(["ppt", "report", "email", "meeting_notes", "document", "image_gen"]);
const jobCategoryEnum = z.enum([
  "student",
  "worker",
  "planner",
  "designer",
  "developer",
  "self_employed",
]);
const tierEnum = z.enum(["free", "premium"]);

export const promptFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "제목을 입력해주세요.")
      .max(TITLE_MAX, `제목은 최대 ${TITLE_MAX}자까지 입력할 수 있어요.`),
    description: z.string().trim().min(1, "프롬프트 설명을 입력해주세요."),
    // 단일 선택 — 미선택(undefined)이면 아래 메시지로 에러
    outputType: outputTypeEnum,
    jobCategories: z.array(jobCategoryEnum).min(1, "직군을 하나 이상 선택해주세요."),
    tasks: z.array(taskEnum).min(1, "태스크를 하나 이상 선택해주세요."),
    model: aiModelEnum,
    modelEtcName: z.string(),
    tier: tierEnum,
    body: z.string().trim().min(1, "프롬프트 본문을 입력해주세요."),
    images: z.array(z.string()).min(1, "결과물 이미지를 최소 1장 첨부해주세요."),
  })
  // "기타" 모델 선택 시 자유 입력명 필수
  .refine((v) => v.model !== "etc" || v.modelEtcName.trim().length > 0, {
    path: ["modelEtcName"],
    message: "기타 모델명을 입력해주세요.",
  });

/** 게시 폼 값 = 검증 통과 형태(모든 필드 필수, null 없음). 단일 출처. */
export type PromptFormSchema = z.infer<typeof promptFormSchema>;

/**
 * 업로드 폼 선택지 — gallery 카테고리 상수를 단일 출처로 재사용한다.
 *
 * 콘텐츠 타입만 시안(무료/프리미엄 세그먼트)에 맞춰 별도 정의한다.
 * (등급은 BE ENUM 도 FREE/PREMIUM 두 값뿐 — 요청서 7-2 회신)
 */

import type { Option } from "@/features/gallery/categories";
import type { ContentTier } from "@/features/gallery/types";

export { JOB_CATEGORIES, TASKS, AI_MODELS, OUTPUT_TYPES } from "@/features/gallery/categories";

/** 콘텐츠 타입(세그먼트) — 시안엔 무료/프리미엄만 노출 */
export const CONTENT_TIER_OPTIONS: readonly Option<ContentTier>[] = [
  { value: "free", label: "무료" },
  { value: "premium", label: "프리미엄" },
] as const;

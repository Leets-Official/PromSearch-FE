/**
 * 프롬프트 상세(조회) 도메인 타입.
 *
 * 기획 확정값(테크 스펙 PS-37 / 2026-07-21) 기준:
 * - 레시피(본문) 잠금 판정은 BE 응답 `access` 를 신뢰한다(프론트는 렌더만).
 *   응답에 access 가 없을 때만 tier + 인증으로 폴백 계산한다(access.ts).
 * - 댓글은 표시 전용(작성/삭제/신고는 후속). 대댓글은 1-depth.
 * - 아웃풋 이미지는 다중(캐러셀).
 *
 * 공용 요약 타입(PromptSummary)·라벨은 gallery 에서 가져와 단일 출처를 유지한다.
 */

import type { PromptAuthor, PromptSummary } from "@/features/gallery/types";

/** 레시피 잠금 사유 — null 이면 열람 가능 */
export type RecipeLockReason = "anonymous" | "premium";

/**
 * 레시피 접근 정보 — BE 권한 로직이 내려주는 잠금 판정.
 * 프론트는 이 값을 신뢰해 렌더만 결정한다(전문 우회 방지: 잠금 시 응답 본문은 프리뷰만).
 */
export type RecipeAccess = {
  /** 블러(잠금) 여부 */
  locked: boolean;
  /** 잠금 사유. locked=false 면 null */
  reason: RecipeLockReason | null;
  /** premium 부분 노출 길이(문자 수). 없으면 기본값 사용 */
  previewLength?: number;
};

/** 상세 응답 1건 */
export type PromptDetail = PromptSummary & {
  /** 아웃풋 이미지들(워터마크 합성본). 최소 1장 */
  images: string[];
  /** 설명 탭 본문(리치 텍스트/마크다운) */
  descriptionBody: string;
  /** 레시피 탭 본문(잠금 대상). locked 면 프리뷰/마스킹된 값만 신뢰 */
  recipeBody: string;
  /** 잠금 판정(BE). 없으면 프론트 폴백 계산 */
  access?: RecipeAccess | null;
  /** 현재 사용자가 추천했는지 */
  liked: boolean;
  /** 댓글 수 */
  commentCount: number;
};

/** 댓글 1개(대댓글 1-depth 포함) */
export type PromptComment = {
  id: string;
  author: PromptAuthor;
  body: string;
  /** ISO 문자열 */
  createdAt: string;
  /** 게시글 작성자 배지 */
  isAuthor: boolean;
  /** 블라인드 처리 → 본문 대신 안내문 렌더 */
  isBlinded: boolean;
  /** 대댓글(1-depth). 최상위 댓글에만 존재 */
  replies: PromptComment[];
};

/** 추천 토글 응답 */
export type LikeToggleResponse = {
  liked: boolean;
  likeCount: number;
};

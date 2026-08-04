/**
 * 프롬프트 상세(조회) 도메인 타입.
 *
 * 기획 확정값(테크 스펙 PS-37 / 2026-07-21) 기준:
 * - 레시피(본문) 잠금 판정은 BE 응답 `access` 를 신뢰한다(프론트는 렌더만).
 *   응답에 access 가 없을 때만 tier + 인증으로 폴백 계산한다(access.ts).
 * - 대댓글은 1-depth.
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
  /** 작성자 식별자 — 프로필 이동·본인 게시글 판정 */
  authorId: number;
  /** 아웃풋 이미지들(워터마크 합성본). sortOrder 순 */
  images: string[];
  /** 설명 탭 본문 */
  descriptionBody: string;
  /** 레시피 탭 본문(잠금 대상). locked 면 서버가 잘라 보낸 만큼만 들어 있다 */
  recipeBody: string;
  /** 잠금 판정(BE). 없으면 프론트 폴백 계산 */
  access?: RecipeAccess | null;
  /** 프리미엄 열람에 필요한 포인트. free 는 0 */
  pricePoint: number;
  /** 현재 사용자가 좋아요했는지 */
  liked: boolean;
  /** 현재 사용자가 북마크했는지 */
  bookmarked: boolean;
  /** 댓글 수 */
  commentCount: number;
};

/**
 * 댓글 상태 — BE `ACTIVE`/`HIDDEN`/`DELETED` 와 1:1 (요청서 7-7 회신).
 * `hidden`·`deleted` 는 본문·작성자·메뉴를 감추고 안내 문구만 렌더한다.
 */
export type CommentStatus = "active" | "hidden" | "deleted";

/** 댓글 1개. 대댓글 목록은 별도 API 라 여기 없고 개수(replyCount)만 온다. */
export type PromptComment = {
  id: string;
  author: PromptAuthor;
  body: string;
  /** ISO 문자열 */
  createdAt: string;
  status: CommentStatus;
  /** 게시글 작성자 배지 */
  isAuthor: boolean;
  /** 로그인 사용자 본인의 댓글 → 수정·삭제 노출 */
  isMine: boolean;
  /** 활성 대댓글 수. 최상위 댓글만 가진다(대댓글은 0) */
  replyCount: number;
};

/** 커서 페이지 1장 — 최상위 댓글/대댓글이 같은 모양을 쓴다. */
export type CommentPage = {
  comments: PromptComment[];
  /** 다음 페이지 커서. 마지막이면 null */
  nextCursor: number | null;
  hasNext: boolean;
};

/** 좋아요 토글 응답 */
export type LikeToggleResponse = {
  liked: boolean;
  likeCount: number;
};

/** 북마크 토글 응답 */
export type BookmarkToggleResponse = {
  bookmarked: boolean;
};

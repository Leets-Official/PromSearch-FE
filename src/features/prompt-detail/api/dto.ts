/**
 * 상세·댓글 API 응답 타입 — Swagger `result` 안쪽만 그대로 옮긴다.
 * (봉투 `{ success, code, message }` 는 `@/lib/api` 가 벗겨준다)
 *
 * - `[PROMPT-001] GET /prompts/{promptId}`
 * - `[COMMENT-001] GET /prompts/{promptId}/comments`
 * - `[COMMENT-006] GET /comments/{commentId}/replies`
 * - `[COMMENT-002/003/004/005]` 작성·수정·삭제·대댓글 작성
 * - `[COMMUNITY-001/002] POST|DELETE /prompts/{promptId}/likes`
 *
 * FE 도메인 타입으로의 변환은 {@link file://./map.ts} 가 담당한다.
 */

import type { ApiContentType, ApiOutputType, ApiTag } from "@/features/gallery/api/dto";
import type { CursorMeta } from "@/lib/api";

/** 작성자 공개 정보 — 카드/상세/댓글이 같은 모양을 쓴다. */
export type ApiUserSummary = {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
};

/**
 * 본문 접근 판정. 서버가 권한을 계산해 내려주고 프론트는 렌더만 한다.
 *
 * `reason` 은 현재 상태가 결정된 이유다.
 * - `ANONYMOUS` 비회원 → 잠금 (본문 빈 문자열)
 * - `PREMIUM`   프리미엄 미결제 → 잠금 (원문 앞 10% 이내·최대 200자만 옴)
 * - `FREE` / `AUTHOR` / `UNLOCKED` → 열람 가능
 */
export type ApiAccessReason = "ANONYMOUS" | "PREMIUM" | "FREE" | "AUTHOR" | "UNLOCKED";

export type ApiAccess = {
  locked: boolean;
  reason: ApiAccessReason;
};

/** 비로그인이어도 null 이 아니라 전부 false 로 온다(요청서 7-5 회신). */
export type ApiDetailViewerInteraction = {
  liked: boolean;
  bookmarked: boolean;
  /** BE 배포 전 구 필드명. 배포 후 제거한다(요청서 7-1). */
  recommended?: boolean;
};

export type ApiDetailStatistics = {
  viewCount: number;
  copyCount: number;
  commentCount: number;
  likeCount: number;
  /** BE 배포 전 구 필드명. 배포 후 제거한다(요청서 7-1). */
  recommendCount?: number;
};

/** 워터마크 처리된 결과물 이미지. `sortOrder` 순으로 캐러셀에 깔린다. */
export type ApiPromptImage = {
  imageId: string;
  imageUrl: string;
  sortOrder: number;
  thumbnail: boolean;
};

export type ApiPromptDetail = {
  promptId: number;
  title: string;
  author: ApiUserSummary;
  outputType: ApiOutputType;
  contentType: ApiContentType;
  /** 프리미엄 열람에 필요한 포인트. FREE 는 0 */
  pricePoint: number;
  /** 레시피 탭 본문. 잠금 상태면 서버가 이미 잘라서 준다(전문 미전송) */
  promptBody: string;
  /** 설명 탭 본문 */
  description: string;
  access: ApiAccess;
  viewerInteraction: ApiDetailViewerInteraction;
  images: ApiPromptImage[];
  tags: ApiTag[];
  statistics: ApiDetailStatistics;
  /** 기타 AI 모델 자유 입력값(요청서 7-4). 기본 모델이면 null */
  customAiModel?: string | null;
  createdAt: string;
  updatedAt: string;
};

/** [COMMUNITY-001/002] 좋아요 등록·취소 응답 */
export type ApiLikeResult = {
  promptId: number;
  liked: boolean;
  likeCount: number;
};

/** 댓글 상태. HIDDEN(블라인드)·DELETED(논리 삭제)는 본문을 노출하지 않는다(요청서 7-7 회신). */
export type ApiCommentStatus = "ACTIVE" | "HIDDEN" | "DELETED";

export type ApiComment = {
  commentId: number;
  /** 최상위 댓글이면 null */
  parentCommentId: number | null;
  author: ApiUserSummary | null;
  content: string;
  status: ApiCommentStatus;
  /** 로그인 사용자 본인의 댓글 → 수정·삭제 노출 근거 */
  mine: boolean;
  /** 프롬프트 작성자가 쓴 댓글 → "작성자" 배지 */
  promptAuthor: boolean;
  createdAt: string;
  updatedAt: string;
  /** 활성 대댓글 수. 목록은 [COMMENT-006] 으로 따로 조회한다(최상위 댓글에만 옴) */
  replyCount?: number;
};

/** [COMMENT-001] 최상위 댓글 — 작성 시각 **내림차순** 커서 페이지 */
export type ApiCommentList = CursorMeta & {
  comments: ApiComment[];
};

/** [COMMENT-006] 대댓글 — 작성 시각 **오름차순** 커서 페이지 */
export type ApiReplyList = CursorMeta & {
  replies: ApiComment[];
};

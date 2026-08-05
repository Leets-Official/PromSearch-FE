/**
 * BE 응답 → FE 도메인 변환(상세·댓글). 순수 함수라 단독 테스트가 가능하다.
 *
 * 태그·enum 역매핑은 갤러리와 같은 규칙이라 `gallery/api/map.ts` 헬퍼를 재사용한다
 * (라벨 단일 출처 유지).
 */

import { toNumber } from "@/lib/api";
import {
  pickJobTags,
  pickTaskTags,
  resolveModel,
  toContentTier,
  toOutputType,
} from "@/features/gallery/api/map";

import type {
  ApiAccessReason,
  ApiComment,
  ApiCommentList,
  ApiCommentStatus,
  ApiPromptDetail,
  ApiReplyList,
} from "./dto";
import type {
  CommentPage,
  CommentStatus,
  PromptComment,
  PromptDetail,
  RecipeAccess,
} from "../types";

/**
 * 서버 잠금 사유 → FE 사유.
 *
 * `FREE`/`AUTHOR`/`UNLOCKED` 는 열람 가능이라 사유가 없다(null). 서버가 `locked: true` 로
 * 주면서 이 사유들을 함께 보내는 일은 없지만, 그래도 `locked` 를 최종 근거로 삼는다.
 */
const LOCK_REASON_BY_API: Partial<Record<ApiAccessReason, RecipeAccess["reason"]>> = {
  ANONYMOUS: "anonymous",
  PREMIUM: "premium",
};

function toRecipeAccess(access: ApiPromptDetail["access"]): RecipeAccess {
  if (!access?.locked) return { locked: false, reason: null };
  return { locked: true, reason: LOCK_REASON_BY_API[access.reason] ?? "premium" };
}

const COMMENT_STATUS_BY_API: Record<ApiCommentStatus, CommentStatus> = {
  ACTIVE: "active",
  HIDDEN: "hidden",
  DELETED: "deleted",
};

export function toPromptDetail(detail: ApiPromptDetail): PromptDetail {
  const { model, modelEtcName } = resolveModel(detail.tags, detail.customAiModel);
  const { statistics, viewerInteraction } = detail;

  // 좋아요 네이밍이 like 로 통일되는 중이라(요청서 7-1) 배포 전 구 필드도 받아둔다.
  const likeCount = toNumber(statistics.likeCount ?? statistics.recommendCount);
  const liked = viewerInteraction.liked ?? viewerInteraction.recommended ?? false;

  return {
    id: String(detail.promptId),
    title: detail.title,
    // 카드용 썸네일 필드는 상세 응답에 없다. 대표 이미지(thumbnail)를 대신 쓴다.
    thumbnailUrl: (detail.images.find((image) => image.thumbnail) ?? detail.images[0])?.imageUrl,
    outputType: toOutputType(detail.outputType),
    model,
    modelEtcName,
    tasks: pickTaskTags(detail.tags),
    jobCategories: pickJobTags(detail.tags),
    tier: toContentTier(detail.contentType),
    author: {
      name: detail.author.nickname,
      avatarUrl: detail.author.profileImageUrl ?? undefined,
      // 서버가 주기 시작하면 그대로 화면에 뜬다(지금은 항상 undefined — dto.ts 주석 참고)
      grade: detail.author.gradeName ?? undefined,
    },
    authorId: toNumber(detail.author.userId),
    stats: {
      views: toNumber(statistics.viewCount),
      copies: toNumber(statistics.copyCount),
      likes: likeCount,
    },
    createdAt: detail.createdAt,

    images: [...detail.images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => image.imageUrl),
    descriptionBody: detail.description,
    recipeBody: detail.promptBody,
    access: toRecipeAccess(detail.access),
    pricePoint: toNumber(detail.pricePoint),
    liked,
    bookmarked: viewerInteraction.bookmarked,
    commentCount: toNumber(statistics.commentCount),
  };
}

export function toPromptComment(comment: ApiComment): PromptComment {
  return {
    id: String(comment.commentId),
    // 삭제·블라인드 댓글은 작성자를 감추므로 author 가 null 로 올 수 있다.
    author: {
      name: comment.author?.nickname ?? "",
      avatarUrl: comment.author?.profileImageUrl ?? undefined,
    },
    body: comment.content,
    createdAt: comment.createdAt,
    status: COMMENT_STATUS_BY_API[comment.status] ?? "active",
    isAuthor: comment.promptAuthor,
    isMine: comment.mine,
    replyCount: toNumber(comment.replyCount),
  };
}

export function toCommentPage(result: ApiCommentList): CommentPage {
  return {
    comments: result.comments.map(toPromptComment),
    nextCursor: result.nextCursor,
    hasNext: result.hasNext,
  };
}

export function toReplyPage(result: ApiReplyList): CommentPage {
  return {
    comments: result.replies.map(toPromptComment),
    nextCursor: result.nextCursor,
    hasNext: result.hasNext,
  };
}

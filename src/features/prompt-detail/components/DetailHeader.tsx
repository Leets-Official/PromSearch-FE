"use client";

import { Bookmark, MoreVertical, ThumbsUp } from "lucide-react";

import { buildDetailTags } from "@/features/prompt-detail/detail-tags";
import { formatDetailDate } from "@/features/prompt-detail/format";
import type { PromptDetail } from "@/features/prompt-detail/types";
import { cn } from "@/lib/utils";
import { ProfileAvatar } from "./ProfileAvatar";

type DetailHeaderProps = {
  detail: PromptDetail;
  liked: boolean;
  likeCount: number;
  bookmarked: boolean;
  onToggleLike: () => void;
  onToggleBookmark: () => void;
};

/**
 * 우측 상단 정보 — 제목·작성자·메타(작성일·조회·추천수 표시)·태그.
 * 우상단 액션: 좋아요(=추천 토글) · 북마크 토글 · 더보기(no-op).
 */
export function DetailHeader({
  detail,
  liked,
  likeCount,
  bookmarked,
  onToggleLike,
  onToggleBookmark,
}: DetailHeaderProps) {
  const tags = buildDetailTags(detail);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-heading-1 text-text-primary">{detail.title}</h1>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="좋아요"
            aria-pressed={liked}
            onClick={onToggleLike}
            className={cn("p-2.5", liked ? "text-text-brand" : "text-text-primary")}
          >
            <ThumbsUp className={cn("size-6", liked && "fill-current")} />
          </button>
          <button
            type="button"
            aria-label="북마크"
            aria-pressed={bookmarked}
            onClick={onToggleBookmark}
            className={cn("p-2.5", bookmarked ? "text-text-brand" : "text-text-primary")}
          >
            <Bookmark className={cn("size-6", bookmarked && "fill-current")} />
          </button>
          <button type="button" aria-label="더보기" className="p-2.5 text-text-primary">
            <MoreVertical className="size-6" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ProfileAvatar name={detail.author.name} src={detail.author.avatarUrl} size="md" />
        <div className="flex flex-col gap-1">
          <span className="text-title-2 text-text-secondary">{detail.author.name}</span>
          <div className="flex items-center gap-1 text-body-3 text-text-secondary">
            <span>{formatDetailDate(detail.createdAt)}</span>
            <span className="text-black">・</span>
            <span>조회 {detail.stats.views}</span>
            <span className="text-black">・</span>
            {/* 추천수 — 표시 전용(좋아요 아이콘으로 토글) */}
            <span>추천 {likeCount}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="rounded bg-brand-tint px-2 py-1.5 text-caption-1 text-text-brand"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

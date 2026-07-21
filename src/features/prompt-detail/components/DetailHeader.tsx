"use client";

import { Bell, Heart, MoreVertical } from "lucide-react";

import { buildDetailTags } from "@/features/prompt-detail/detail-tags";
import { formatDetailDate } from "@/features/prompt-detail/format";
import type { PromptDetail } from "@/features/prompt-detail/types";
import { cn } from "@/lib/utils";
import { ProfileAvatar } from "./ProfileAvatar";

type DetailHeaderProps = {
  detail: PromptDetail;
  liked: boolean;
  likeCount: number;
  onToggleLike: () => void;
};

/** 우측 상단 정보 — 제목·작성자·메타(조회·추천 토글)·태그. 벨/⋮ 는 자리만(no-op). */
export function DetailHeader({ detail, liked, likeCount, onToggleLike }: DetailHeaderProps) {
  const tags = buildDetailTags(detail);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-heading-1 text-text-primary">{detail.title}</h1>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" aria-label="구독 알림" className="p-2.5 text-text-primary">
            <Bell className="size-6" />
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
            <button
              type="button"
              aria-label="추천"
              aria-pressed={liked}
              onClick={onToggleLike}
              className={cn(
                "inline-flex items-center gap-1",
                liked ? "text-text-brand" : "text-text-secondary",
              )}
            >
              <Heart className={cn("size-4", liked && "fill-current")} />
              추천 {likeCount}
            </button>
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

"use client";

import { buildDetailTags } from "@/features/prompt-detail/detail-tags";
import { formatDetailDate } from "@/features/prompt-detail/format";
import type { PromptDetail } from "@/features/prompt-detail/types";
import { ProfileAvatar } from "./profile-avatar";

/**
 * 우측 상단 정보 — 제목 · 작성자 · 메타(작성일·조회·추천수 표시) · 태그.
 * 개정: 좋아요/북마크/신고 액션은 이미지 오버레이(OutputCarousel)로 이동.
 * 추천수는 여기서 읽기 전용 텍스트로만 노출한다.
 */
export function DetailHeader({ detail }: { detail: PromptDetail }) {
  const tags = buildDetailTags(detail);

  return (
    <div className="flex w-full flex-col gap-4">
      <h1 className="text-heading-1 text-text-primary">{detail.title}</h1>

      <div className="flex items-center gap-4">
        <ProfileAvatar name={detail.author.name} src={detail.author.avatarUrl} size="md" />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-title-2 text-text-secondary">{detail.author.name}</span>
          {/* 좁아지면 단어(세그먼트) 단위로만 줄바꿈 — 글자 단위로 깨지지 않게 */}
          <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-body-3 text-text-secondary">
            <span className="whitespace-nowrap">{formatDetailDate(detail.createdAt)}</span>
            <span className="text-black">・</span>
            <span className="whitespace-nowrap">조회 {detail.stats.views}</span>
            <span className="text-black">・</span>
            <span className="whitespace-nowrap">추천 {detail.stats.likes}</span>
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

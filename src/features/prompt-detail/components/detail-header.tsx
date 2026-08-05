"use client";

import { buildDetailTags } from "@/features/prompt-detail/detail-tags";
import { formatDetailDate } from "@/features/prompt-detail/format";
import { formatGrade } from "@/lib/grade";
import type { PromptDetail } from "@/features/prompt-detail/types";
import { ProfileAvatar } from "./profile-avatar";

/**
 * 우측 상단 정보 — 제목 · 작성자 · 메타(작성일·조회·추천수 표시) · 태그.
 * 개정: 좋아요/북마크/신고 액션은 이미지 오버레이(OutputCarousel)로 이동.
 * 추천수는 여기서 읽기 전용 텍스트로만 노출한다.
 */
export function DetailHeader({ detail }: { detail: PromptDetail }) {
  const tags = buildDetailTags(detail);
  const authorGrade = formatGrade(detail.author.grade);

  return (
    // 모바일 시안(1345:6707)은 요소 간격 12px · 아바타 32px
    <div className="flex w-full flex-col gap-3 sm:gap-4">
      {/* 크기는 전역 모바일 스케일이 처리(24→20). 행간만 이 화면에서 디자이너가 26px 로 직접 잡았다. */}
      <h1 className="text-heading-1 text-text-primary max-sm:leading-6.5">{detail.title}</h1>

      <div className="flex items-center gap-4">
        <ProfileAvatar
          name={detail.author.name}
          src={detail.author.avatarUrl}
          size="md"
          className="size-8 sm:size-11"
        />
        <div className="flex min-w-0 flex-col gap-1">
          {/* 닉네임 + 등급(시안 499:2806 "전업프롬프트업로더 Node").
              서버는 대문자 enum(`NODE`)을 주므로 formatGrade 로 표기를 맞춘다.
              값이 없으면(구버전 응답 등) 자리 자체를 그리지 않는다. */}
          <span className="flex min-w-0 items-baseline gap-1 text-title-2">
            <span className="truncate text-text-secondary">{detail.author.name}</span>
            {authorGrade ? <span className="shrink-0 text-text-brand">{authorGrade}</span> : null}
          </span>
          {/* 좁아지면 단어(세그먼트) 단위로만 줄바꿈 — 글자 단위로 깨지지 않게.
              구분자는 `·`(U+00B7). 전각 `・`(U+30FB)는 폭을 크게 먹어 들쭉날쭉해 보인다. */}
          <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-body-3 text-text-secondary">
            <span className="whitespace-nowrap">{formatDetailDate(detail.createdAt)}</span>
            <span className="text-black">·</span>
            <span className="whitespace-nowrap">조회 {detail.stats.views}</span>
            <span className="text-black">·</span>
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

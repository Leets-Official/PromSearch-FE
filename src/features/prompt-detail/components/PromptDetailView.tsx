"use client";

import { useEffect, useRef } from "react";

import { track } from "@/analytics/track";
import { useAuthStatus } from "@/hooks/use-auth-status";
import { useBookmark } from "@/features/prompt-detail/hooks/use-bookmark";
import { useComments } from "@/features/prompt-detail/hooks/use-comments";
import { useDetailTab } from "@/features/prompt-detail/hooks/use-detail-tab";
import { useLikePrompt } from "@/features/prompt-detail/hooks/use-like-prompt";
import type { PromptDetail } from "@/features/prompt-detail/types";

import { CommentPanel } from "./CommentPanel";
import { DescriptionPanel } from "./DescriptionPanel";
import { DetailHeader } from "./DetailHeader";
import { DetailTabs } from "./DetailTabs";
import { OutputCarousel } from "./OutputCarousel";
import { RecipePanel } from "./RecipePanel";

/** 상세 본문 조립 — 좌(이미지) / 우(정보 + 탭). 진입 시 prompt_view 1회 발송. */
export function PromptDetailView({ detail }: { detail: PromptDetail }) {
  const { status } = useAuthStatus();
  const { tab, setTab } = useDetailTab();
  const like = useLikePrompt(detail.id);
  const bookmark = useBookmark(detail.id);
  const comments = useComments(detail.id);

  // 상세 진입 지표 — prompt id 당 1회
  const viewedRef = useRef<string | null>(null);
  useEffect(() => {
    if (viewedRef.current === detail.id) return;
    viewedRef.current = detail.id;
    track("prompt_view", {
      prompt_id: detail.id,
      user_status: status,
      tier: detail.tier,
      source: "detail",
    });
  }, [detail.id, detail.tier, status]);

  return (
    <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-start">
      <OutputCarousel
        images={detail.images}
        title={detail.title}
        liked={detail.liked}
        onToggleLike={() => like.mutate()}
        bookmarked={detail.bookmarked}
        onToggleBookmark={() => bookmark.mutate()}
        onReport={() => {
          /* 신고 — 후속 범위(스텁) */
        }}
      />

      {/*
        스크롤 모델: 우측 컬럼 자체가 단일 스크롤 컨테이너.
        내용이 짧으면 그대로, 길면 메타·태그가 위로 밀려 스크롤되고 탭(sticky)이 상단에 고정된다.
        각 패널은 내부 스크롤 없이 내용 높이로 흐른다.
      */}
      <div className="flex min-w-0 flex-1 flex-col lg:h-[624px] lg:overflow-y-auto">
        <DetailHeader detail={detail} />
        <div className="sticky top-0 z-10 bg-bg-primary py-4">
          <DetailTabs active={tab} onSelect={setTab} />
        </div>

        {tab === "description" ? <DescriptionPanel body={detail.descriptionBody} /> : null}
        {tab === "recipe" ? (
          <RecipePanel
            promptId={detail.id}
            recipeBody={detail.recipeBody}
            access={detail.access ?? { locked: false, reason: null }}
            userStatus={status}
          />
        ) : null}
        {tab === "comments" ? <CommentPanel comments={comments.data ?? []} /> : null}
      </div>
    </div>
  );
}

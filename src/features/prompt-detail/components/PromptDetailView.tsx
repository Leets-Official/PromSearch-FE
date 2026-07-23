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
      <OutputCarousel images={detail.images} title={detail.title} />

      <div className="flex min-w-0 flex-1 flex-col gap-6 lg:h-[624px]">
        <DetailHeader
          detail={detail}
          liked={detail.liked}
          likeCount={detail.stats.likes}
          bookmarked={detail.bookmarked}
          onToggleLike={() => like.mutate()}
          onToggleBookmark={() => bookmark.mutate()}
        />
        <DetailTabs active={tab} onSelect={setTab} />

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

"use client";

import { useEffect, useRef } from "react";

import { track } from "@/analytics/track";
import { cn } from "@/lib/utils";
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
  const isComments = tab === "comments";

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
        스크롤 모델(탭별):
        - 설명/레시피: 우측 컬럼이 단일 스크롤 컨테이너. 길면 메타·태그가 위로 밀리고 탭(sticky)이 상단 고정.
        - 댓글: 컬럼 높이는 고정, 리스트만 내부 스크롤하고 입력창은 항상 하단 고정.
      */}
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col lg:h-[624px]",
          isComments ? "" : "lg:overflow-y-auto",
        )}
      >
        <div className="shrink-0">
          <DetailHeader detail={detail} />
        </div>
        <div className={cn("shrink-0 bg-bg-primary py-4", isComments ? "" : "sticky top-0 z-10")}>
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
        {isComments ? (
          <CommentPanel comments={comments.data ?? []} className="min-h-0 flex-1" />
        ) : null}
      </div>
    </div>
  );
}

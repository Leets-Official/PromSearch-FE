"use client";

import { Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { track } from "@/analytics/track";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  const [copied, setCopied] = useState(false);

  const access = detail.access ?? { locked: false, reason: null };
  const showCopy = tab === "recipe" && !access.locked;
  // 댓글 탭: 컬럼을 flex 로 채워 입력창을 바닥에 고정(리스트만 내부 스크롤).
  // 설명/레시피 탭: 컬럼 전체 스크롤(메타·태그가 위로 밀리고 탭 sticky-top).
  const isComments = tab === "comments";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(detail.recipeBody);
    setCopied(true);
    track("prompt_copy_click", {
      prompt_id: detail.id,
      user_status: status,
      source: "detail",
    });
  };

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
        스크롤 모델: 우측 컬럼이 단일 스크롤 컨테이너.
        스크롤하면 메타·태그가 위로 밀리고 탭(sticky-top)이 상단에 고정된다.
        댓글 입력창은 sticky-bottom 이라, 탭이 상단에 닿은 뒤엔 댓글 리스트만 그 사이에서 스크롤된다.
      */}
      <div
        className={cn(
          "flex scrollbar-minimal min-w-0 flex-1 flex-col lg:h-156 lg:pr-3",
          isComments ? "lg:overflow-hidden" : "lg:overflow-y-auto",
        )}
      >
        <DetailHeader detail={detail} />

        {/* 탭 행 — 상단 고정 + 레시피 열람 시 복사 버튼(디자인상 탭과 같은 줄) */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-bg-primary py-4">
          <DetailTabs active={tab} onSelect={setTab} />
          {showCopy ? (
            <Button variant="neutral" size="sm" onClick={handleCopy}>
              <Copy data-icon="inline-start" />
              {copied ? "복사됨" : "복사하기"}
            </Button>
          ) : null}
        </div>

        {tab === "description" ? <DescriptionPanel body={detail.descriptionBody} /> : null}
        {tab === "recipe" ? (
          <RecipePanel
            promptId={detail.id}
            recipeBody={detail.recipeBody}
            access={access}
            userStatus={status}
          />
        ) : null}
        {tab === "comments" ? (
          <CommentPanel comments={comments.data ?? []} className="min-h-0 flex-1" />
        ) : null}
      </div>
    </div>
  );
}

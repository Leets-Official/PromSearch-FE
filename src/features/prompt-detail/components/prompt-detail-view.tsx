"use client";

import {
  BookmarkFilledIcon,
  BookmarkIcon,
  CopyIcon,
  FlagIcon,
  HeartFilledIcon,
  HeartIcon,
} from "@/components/ui/icons";
import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { track } from "@/analytics/track";
import { cn } from "@/lib/utils";
import { MobilePageHeader } from "@/components/layout/mobile-page-header";
import { LoginModal } from "@/components/modals/login/login-modal";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useAuthStatus } from "@/hooks/use-auth-status";
import { useBookmark } from "@/features/prompt-detail/hooks/use-bookmark";
import { useComments } from "@/features/prompt-detail/hooks/use-comments";
import { useDetailTab } from "@/features/prompt-detail/hooks/use-detail-tab";
import { useLikePrompt } from "@/features/prompt-detail/hooks/use-like-prompt";
import type { PromptDetail } from "@/features/prompt-detail/types";

import { CommentPanel } from "./comment-panel";
import { DescriptionPanel } from "./description-panel";
import { DetailHeader } from "./detail-header";
import { DetailFloatingActions, COMMENT_INPUT_ANCHOR_ID } from "./detail-floating-actions";
import { DetailTabs } from "./detail-tabs";
import { OutputCarousel } from "./output-carousel";
import { PointUnlockModal } from "./point-unlock-modal";
import { RecipePanel } from "./recipe-panel";

/** 상세 본문 조립 — 좌(이미지) / 우(정보 + 탭). 진입 시 prompt_view 1회 발송. */
export function PromptDetailView({ detail }: { detail: PromptDetail }) {
  const router = useRouter();
  const { status } = useAuthStatus();
  const { tab, setTab } = useDetailTab();
  const like = useLikePrompt(detail.id);
  const bookmark = useBookmark(detail.id);
  const comments = useComments(detail.id);
  const [copied, setCopied] = useState(false);
  // 신고 / 로그인 / 포인트 결제 모달
  const [reportOpen, setReportOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [pointOpen, setPointOpen] = useState(false);

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

  const handleReport = () => setReportOpen(true);

  /** 레시피 잠금 CTA — 비회원은 로그인 모달, 프리미엄은 포인트 결제 모달 */
  const handleUnlock = (reason: "anonymous" | "premium") => {
    if (reason === "anonymous") setLoginOpen(true);
    else setPointOpen(true);
  };

  /** 댓글 플로팅 버튼 — 댓글 탭으로 전환하고 최하단 입력창까지 스크롤 */
  const handleGoToComments = () => {
    setTab("comments");
    // 탭 전환은 URL 상태(nuqs) 라 렌더가 한 틱 뒤에 온다. 앵커가 생길 때까지 몇 프레임 기다린다.
    let tries = 0;
    const scrollWhenReady = () => {
      const anchor = document.getElementById(COMMENT_INPUT_ANCHOR_ID);
      if (anchor) {
        anchor.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      if (tries++ < 30) requestAnimationFrame(scrollWhenReady);
    };
    requestAnimationFrame(scrollWhenReady);
  };

  return (
    <>
      {/* 모바일 헤더(Header/mobile/page 1233:6473) — 뒤로가기 + 추천·북마크·신고.
          데스크톱에서는 같은 액션이 이미지 오버레이(OutputCarousel)에 있다. */}
      <MobilePageHeader
        end={
          <>
            <Button
              variant="plain"
              size="icon-sm"
              aria-label="추천"
              aria-pressed={detail.liked}
              onClick={() => like.mutate()}
            >
              {detail.liked ? <HeartFilledIcon /> : <HeartIcon />}
            </Button>
            <Button
              variant="plain"
              size="icon-sm"
              aria-label="북마크"
              aria-pressed={detail.bookmarked}
              onClick={() => bookmark.mutate()}
            >
              {detail.bookmarked ? <BookmarkFilledIcon /> : <BookmarkIcon />}
            </Button>
            <Button variant="plain" size="icon-sm" aria-label="신고" onClick={handleReport}>
              <FlagIcon />
            </Button>
          </>
        }
      />

      <div className="flex w-full flex-col gap-6 xl:flex-row xl:items-start">
        <OutputCarousel
          images={detail.images}
          title={detail.title}
          liked={detail.liked}
          onToggleLike={() => like.mutate()}
          bookmarked={detail.bookmarked}
          onToggleBookmark={() => bookmark.mutate()}
          onReport={handleReport}
        />

        {/*
          스크롤 모델: 우측 컬럼이 단일 스크롤 컨테이너.
          스크롤하면 메타·태그가 위로 밀리고 탭(sticky-top)이 상단에 고정된다.
          댓글 입력창은 sticky-bottom 이라, 탭이 상단에 닿은 뒤엔 댓글 리스트만 그 사이에서 스크롤된다.
          모바일에서는 페이지 자체가 스크롤되고(고정 높이 없음) 탭·본문이 순서대로 흐른다.
        */}
        <div
          className={cn(
            "flex scrollbar-minimal min-w-0 flex-1 flex-col xl:h-156 xl:pr-3",
            isComments ? "xl:overflow-hidden" : "xl:overflow-y-auto",
          )}
        >
          <DetailHeader detail={detail} />

          {/* 탭 행 — 상단 고정 + 레시피 열람 시 복사 버튼(디자인상 탭과 같은 줄).
              모바일은 뒤로가기 헤더(56px) 바로 아래에 붙고, xl 부터는 우측 컬럼 상단에 붙는다. */}
          <div className="sticky top-14 z-10 flex items-center justify-between bg-bg-primary py-3 sm:static sm:py-4 xl:sticky xl:top-0">
            <DetailTabs active={tab} onSelect={setTab} />
            {showCopy ? (
              <Button variant="neutral" size="sm" onClick={handleCopy}>
                <CopyIcon data-icon="inline-start" />
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
              onUnlock={handleUnlock}
            />
          ) : null}
          {tab === "comments" ? (
            <CommentPanel comments={comments.data ?? []} className="min-h-0 flex-1" />
          ) : null}
        </div>
      </div>

      {/* 모바일 우하단 플로팅 — 댓글로 이동 / 맨 위로(1360:7666) */}
      <DetailFloatingActions onCommentClick={handleGoToComments} />

      {/* 신고 확인 모달(시안 1517:8893) — 사유 선택 UI 는 기획 확정 후 추가 */}
      <ConfirmModal
        open={reportOpen}
        onOpenChange={setReportOpen}
        title="이 게시글을 신고할까요?"
        description="신고 내용은 검토 후 운영 정책에 따라 조치됩니다."
        cancelLabel="취소"
        confirmLabel="신고하기"
        onConfirm={() => {
          // TODO: 신고 API 연동(사유 선택 스펙 확정 후)
          setReportOpen(false);
        }}
      />

      {/* 잠금 CTA — 비회원 로그인 유도 */}
      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSignUp={() => router.push("/signup")}
        onLogin={() => {
          // TODO: 로그인 API 연동
        }}
      />

      {/* 잠금 CTA — 프리미엄 포인트 결제 확인 */}
      <PointUnlockModal
        open={pointOpen}
        onOpenChange={setPointOpen}
        onConfirm={() => {
          // TODO: 포인트 차감 API 연동 후 상세 재조회
          setPointOpen(false);
        }}
      />
    </>
  );
}

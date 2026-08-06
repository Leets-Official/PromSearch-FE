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
import { LoginModalContainer } from "@/features/auth/components/login-modal-container";
import { Button } from "@/components/ui/button";
import { useAuthStatus } from "@/hooks/use-auth-status";
import { useToast } from "@/components/ui/toast";
import { useBookmark } from "@/features/prompt-detail/hooks/use-bookmark";
import { useAuthGate } from "@/features/prompt-detail/hooks/use-auth-gate";
import { useDetailTab } from "@/features/prompt-detail/hooks/use-detail-tab";
import { useRecordCopy, useUnlockPrompt } from "@/features/prompt-detail/hooks/use-prompt-actions";
import { useLikePrompt } from "@/features/prompt-detail/hooks/use-like-prompt";
import type { PromptDetail } from "@/features/prompt-detail/types";

import { CommentPanel } from "./comment-panel";
import { DescriptionPanel } from "./description-panel";
import { DetailHeader } from "./detail-header";
import { DetailFloatingActions, COMMENT_INPUT_ANCHOR_ID } from "./detail-floating-actions";
import { DetailTabs } from "./detail-tabs";
import { OutputCarousel } from "./output-carousel";
import { PointUnlockModal } from "./point-unlock-modal";
import { ReportModal } from "./report-modal";
import { RecipePanel } from "./recipe-panel";

/** 상세 본문 조립 — 좌(이미지) / 우(정보 + 탭). 진입 시 prompt_view 1회 발송. */
export function PromptDetailView({ detail }: { detail: PromptDetail }) {
  const router = useRouter();
  const { status } = useAuthStatus();
  const { tab, setTab } = useDetailTab();
  const like = useLikePrompt(detail.id);
  const bookmark = useBookmark(detail.id);
  const unlock = useUnlockPrompt(detail.id);
  const copy = useRecordCopy(detail.id);
  // 좋아요·북마크·신고·잠금해제는 로그인이 필요하다. 비회원이 누르면 로그인 모달을 연다.
  const gate = useAuthGate();
  // 버튼 하나로 끝나는 액션들은 결과를 적을 자리가 없어 토스트로 알린다.
  const { toastSuccess, toastApiError } = useToast();
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
    // 복사 집계는 곁다리다 — 실패해도 사용자에게 알리지 않는다(복사는 이미 됐다).
    copy.mutate();
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

  const handleReport = () => gate.run(() => setReportOpen(true));

  /**
   * 좋아요 토글 — 요청 중이면 무시한다.
   *
   * 서버가 등록(POST)/취소(DELETE)로 갈려 있어 "누른 순간의 상태"를 인자로 넘기는데,
   * detail.liked 는 렌더 시점 값이라 리렌더보다 빠른 연타는 같은 값을 두 번 보낸다(409).
   */
  const handleToggleLike = () =>
    gate.run(() => {
      if (like.isPending) return;
      like.mutate(detail.liked, { onError: toastApiError });
    });

  /** 북마크 토글 — 좋아요와 같은 이유로 요청 중 클릭을 무시한다. */
  const handleToggleBookmark = () =>
    gate.run(() => {
      if (bookmark.isPending) return;
      bookmark.mutate(detail.bookmarked, {
        onSuccess: () => toastSuccess(detail.bookmarked ? "북마크를 해제했어요." : "북마크했어요."),
        onError: toastApiError,
      });
    });

  /** 레시피 잠금 CTA — 비회원은 로그인 모달, 프리미엄은 포인트 결제 모달 */
  const handleUnlock = (reason: "anonymous" | "premium") => {
    if (reason === "anonymous") setLoginOpen(true);
    else gate.run(() => setPointOpen(true));
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
              disabled={like.isPending}
              onClick={handleToggleLike}
            >
              {detail.liked ? <HeartFilledIcon /> : <HeartIcon />}
            </Button>
            <Button
              variant="plain"
              size="icon-sm"
              aria-label="북마크"
              aria-pressed={detail.bookmarked}
              disabled={bookmark.isPending}
              onClick={handleToggleBookmark}
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
          onToggleLike={handleToggleLike}
          bookmarked={detail.bookmarked}
          onToggleBookmark={handleToggleBookmark}
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
              고정 위치는 그 구간에서 위에 깔린 고정 헤더 높이만큼 내린다.
              - sm 미만 : MobilePageHeader(뒤로가기, h-14) 아래
              - sm~lg   : AppHeader(h-20) 아래 — 페이지 전체가 스크롤된다
              - xl      : 우측 컬럼이 자체 스크롤 컨테이너라 컬럼 상단(top-0) */}
          <div className="sticky top-14 z-10 flex items-center justify-between bg-bg-primary py-3 sm:top-20 sm:py-4 xl:top-0">
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
            <CommentPanel promptId={detail.id} className="min-h-0 flex-1" />
          ) : null}
        </div>
      </div>

      {/* 모바일 우하단 플로팅 — 댓글로 이동 / 맨 위로(1360:7666) */}
      <DetailFloatingActions onCommentClick={handleGoToComments} />

      {/* 게시글 신고 — 사유 택1 + 상세 사유(선택) */}
      <ReportModal
        open={reportOpen}
        onOpenChange={setReportOpen}
        target="post"
        targetId={detail.id}
      />

      {/* 비회원이 로그인 필요한 액션을 눌렀을 때 */}
      <LoginModalContainer open={gate.loginOpen} onOpenChange={gate.setLoginOpen} />

      {/* 잠금 CTA — 비회원 로그인 유도 */}
      <LoginModalContainer open={loginOpen} onOpenChange={setLoginOpen} />

      {/* 잠금 CTA — 프리미엄 포인트 결제 확인. 가격은 상세 응답의 pricePoint 를 그대로 쓴다. */}
      <PointUnlockModal
        open={pointOpen}
        onOpenChange={setPointOpen}
        requiredPoints={detail.pricePoint}
        onConfirm={() => {
          // 응답이 비어 있어 훅이 상세를 다시 조회한다(열린 본문을 받기 위해).
          unlock.mutate(undefined, {
            onSuccess: () => toastSuccess("포인트를 사용해 전문을 열었어요."),
            onError: toastApiError,
          });
          setPointOpen(false);
        }}
      />
    </>
  );
}

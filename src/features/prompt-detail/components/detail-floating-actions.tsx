"use client";

import { useEffect, useState } from "react";

import { ArrowUpIcon, CommentIcon } from "@/components/ui/icons";

/** 맨 위로 버튼이 나타나는 스크롤 위치(px) */
const SCROLL_TOP_VISIBLE_FROM = 560;

/** 댓글 입력창 앵커 id — 댓글 플로팅 버튼이 이 요소로 스크롤한다. */
export const COMMENT_INPUT_ANCHOR_ID = "detail-comment-input";

/**
 * 상세 화면 우하단 플로팅 액션 — Figma "Button/Icon"(1360:7666) 44px 원형 · Opacity/dim 배경.
 *
 * - 댓글 : 항상 노출. 누르면 댓글 탭으로 전환하고 최하단 댓글 입력창으로 스크롤한다.
 * - 맨 위로 : 스크롤 Y 가 560px 이상일 때만 노출.
 *
 * 모바일 시안에만 있는 요소라 sm 미만에서만 렌더한다.
 */
export function DetailFloatingActions({ onCommentClick }: { onCommentClick: () => void }) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY >= SCROLL_TOP_VISIBLE_FROM);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed right-4 bottom-4 z-40 flex items-center gap-2 sm:hidden">
      <FloatingButton label="댓글로 이동" onClick={onCommentClick}>
        <CommentIcon className="size-5" />
      </FloatingButton>

      {showScrollTop ? (
        <FloatingButton
          label="맨 위로"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ArrowUpIcon className="size-5" />
        </FloatingButton>
      ) : null}
    </div>
  );
}

function FloatingButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-11 items-center justify-center rounded-full bg-dim text-white transition-colors active:bg-dim/80"
    >
      {children}
    </button>
  );
}

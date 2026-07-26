"use client";

import { Bookmark, ChevronLeft, ChevronRight, Flag, Heart } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageZoomModal } from "./ImageZoomModal";

/** 아웃풋 이미지 최대 개수(BE 제약과 동일) */
export const MAX_OUTPUT_IMAGES = 10;

type OutputCarouselProps = {
  images: string[];
  title: string;
  /** 좋아요(=추천) 상태/토글 */
  liked: boolean;
  onToggleLike: () => void;
  /** 북마크 상태/토글 */
  bookmarked: boolean;
  onToggleBookmark: () => void;
  /** 신고(스텁) */
  onReport: () => void;
};

/**
 * 아웃풋 이미지 캐러셀 — 다중 이미지, `현재/전체` 인디케이터, 이전/다음(순환).
 * 개정: 이미지 좌상단에 3개 액션(♡ 추천 · 🔖 북마크 · 🚩 신고) 오버레이.
 * 이미지 클릭 시 확대 모달을 열 수 있게 onImageClick 을 노출한다.
 */
export function OutputCarousel({
  images,
  title,
  liked,
  onToggleLike,
  bookmarked,
  onToggleBookmark,
  onReport,
}: OutputCarouselProps) {
  const items = images.slice(0, MAX_OUTPUT_IMAGES);
  const [index, setIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const total = items.length;
  const hasMultiple = total > 1;

  const go = (delta: number) => setIndex((i) => (i + delta + total) % total);

  return (
    <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-md bg-bg-disabled lg:aspect-auto lg:h-[624px] lg:w-[432px]">
      <button
        type="button"
        aria-label={`${title} 이미지 확대`}
        onClick={() => setZoomOpen(true)}
        className="size-full cursor-zoom-in"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={items[index]}
          alt={`${title} 아웃풋 ${index + 1}`}
          className="size-full object-cover"
        />
      </button>

      {/* 좌상단 액션 오버레이 */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <OverlayAction
          label="추천"
          active={liked}
          onClick={onToggleLike}
          icon={<Heart className={cn("size-6", liked && "fill-current")} />}
        />
        <OverlayAction
          label="북마크"
          active={bookmarked}
          onClick={onToggleBookmark}
          icon={<Bookmark className={cn("size-6", bookmarked && "fill-current")} />}
        />
        <OverlayAction label="신고" onClick={onReport} icon={<Flag className="size-6" />} />
      </div>

      {hasMultiple ? (
        <>
          <span
            data-testid="carousel-indicator"
            className="absolute top-4 right-4 text-title-1 text-text-primary"
          >
            {index + 1}/{total}
          </span>
          <Button
            type="button"
            variant="plain"
            size="icon"
            aria-label="이전 이미지"
            onClick={() => go(-1)}
            className="absolute top-1/2 left-2 -translate-y-1/2"
          >
            <ChevronLeft />
          </Button>
          <Button
            type="button"
            variant="plain"
            size="icon"
            aria-label="다음 이미지"
            onClick={() => go(1)}
            className="absolute top-1/2 right-2 -translate-y-1/2"
          >
            <ChevronRight />
          </Button>
        </>
      ) : null}

      {zoomOpen ? (
        <ImageZoomModal
          images={items}
          title={title}
          initialIndex={index}
          onClose={() => setZoomOpen(false)}
        />
      ) : null}
    </div>
  );
}

/** 이미지 위 액션 버튼 — Button/Icon type=background: dim(gray-900/60%) 배경 + 흰 아이콘 */
function OverlayAction({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className="flex items-center justify-center rounded-md bg-dim p-2 text-white transition-colors hover:bg-dim/80"
    >
      {icon}
    </button>
  );
}

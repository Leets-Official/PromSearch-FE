"use client";

import { Bookmark, ChevronLeft, ChevronRight, Flag, Heart } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { ImageZoomModal } from "./ImageZoomModal";

/** 아웃풋 이미지 최대 개수(BE 제약과 동일) */
export const MAX_OUTPUT_IMAGES = 10;

/** 현재 인덱스 기준 인접(±1, 순환) 인덱스 집합 — 프리로드 대상 */
function windowIndices(index: number, total: number): Set<number> {
  if (total <= 1) return new Set([0]);
  return new Set([(index - 1 + total) % total, index, (index + 1) % total]);
}

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
  const total = items.length;
  const [index, setIndex] = useState(0);
  // 로드된(=DOM에 src가 걸린) 인덱스. 초기엔 인접 ±1만, 이동하며 누적(한 번 로드하면 유지 → 재방문 즉시).
  const [loaded, setLoaded] = useState<Set<number>>(() => windowIndices(0, total));
  const [zoomOpen, setZoomOpen] = useState(false);
  const hasMultiple = total > 1;

  const goTo = (next: number) => {
    setIndex(next);
    setLoaded((prev) => new Set([...prev, ...windowIndices(next, total)]));
  };
  const go = (delta: number) => goTo((index + delta + total) % total);

  return (
    <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-md bg-bg-disabled xl:aspect-auto xl:h-156 xl:w-108">
      <button
        type="button"
        aria-label={`${title} 이미지 확대`}
        onClick={() => setZoomOpen(true)}
        className="relative size-full cursor-zoom-in"
      >
        {/* 이미지 스택(opacity 크로스페이드). src 는 인접 프리로드된(loaded) 것만 걸어
            초기 로드를 ±1로 제한하고, 이동 시 다음 이웃을 미리 받아 전환을 즉시(0ms)로 유지 */}
        {items.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={loaded.has(i) ? src : undefined}
            alt={i === index ? `${title} 아웃풋 ${index + 1}` : ""}
            aria-hidden={i !== index}
            className={cn(
              "absolute inset-0 size-full object-contain transition-opacity duration-150",
              i === index ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
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
            className="absolute top-4 right-4 rounded bg-dim px-2 py-0.5 text-title-3 text-white"
          >
            {index + 1}/{total}
          </span>
          <button
            type="button"
            aria-label="이전 이미지"
            onClick={() => go(-1)}
            className="absolute top-1/2 left-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-dim text-white transition-colors hover:bg-dim/80"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            type="button"
            aria-label="다음 이미지"
            onClick={() => go(1)}
            className="absolute top-1/2 right-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-dim text-white transition-colors hover:bg-dim/80"
          >
            <ChevronRight className="size-6" />
          </button>
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

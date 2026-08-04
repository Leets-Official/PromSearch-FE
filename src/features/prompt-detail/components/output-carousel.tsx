"use client";

import {
  ArrowExpandIcon,
  BookmarkFilledIcon,
  BookmarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FlagIcon,
  HeartFilledIcon,
  HeartIcon,
} from "@/components/ui/icons";
import { useState } from "react";

import { useCarouselSwipe } from "@/hooks/use-carousel-swipe";
import { cn } from "@/lib/utils";
import { ImageZoomModal } from "./image-zoom-modal";

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
 *
 * 반응형(Figma "프롬프트 상세 - 설명" 1345:6702):
 * - mobile : 화면 폭을 꽉 채우는 375x281(=4:3) 풀블리드, 모서리 각짐.
 *            좌상단 액션 오버레이 대신 **좌하단 확대 버튼**만 두고(추천/북마크/신고는 페이지 헤더로 이동),
 *            좌우 화살표 대신 **스와이프**로 넘긴다. 인디케이터는 우상단 8px.
 * - desktop: 기존 그대로(오버레이 액션 + 화살표).
 *
 * 전환은 opacity 크로스페이드가 아니라 **가로 트랙 슬라이드**다(useCarouselSwipe).
 * 드래그 중에는 트랙이 손가락을 따라오고, 손을 떼면 이어서 다음 장까지 붙는다.
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
  const [zoomOpen, setZoomOpen] = useState(false);
  const hasMultiple = total > 1;
  // 훅 반환값은 반드시 구조분해로 받는다 — 객체째 들고 프로퍼티로 접근하면
  // 컴파일러가 "렌더 중 ref 접근"으로 본다(react-hooks/refs).
  const { index, isVisible, setContainer, go, didSwipe, touchHandlers, trackStyle, slideStyle } =
    useCarouselSwipe({ total });

  return (
    <div
      ref={setContainer}
      className={cn(
        "relative shrink-0 overflow-hidden bg-bg-disabled",
        // mobile: 셸 좌우 여백(16px)을 상쇄한 풀블리드 4:3, 모서리 각짐
        "-mx-4 aspect-[375/281] w-auto rounded-none",
        // tablet~: 카드처럼 정사각 + 라운드, xl 부터는 좌측 고정 컬럼
        "sm:mx-0 sm:aspect-square sm:w-full sm:rounded-md xl:aspect-auto xl:h-156 xl:w-108",
      )}
    >
      <button
        type="button"
        aria-label={`${title} 이미지 확대`}
        // 스와이프 끝에 딸려 오는 click 으로 모달이 열리지 않게 막는다
        onClick={() => {
          if (!didSwipe()) setZoomOpen(true);
        }}
        {...touchHandlers}
        // 세로 스크롤은 브라우저에, 가로 제스처는 우리가 처리한다
        className="relative size-full cursor-zoom-in touch-pan-y"
      >
        {/* 가로 트랙 — 드래그 중엔 손가락을 따라오고, 놓으면 다음 장까지 이어서 붙는다.
            각 슬라이드는 현재 장 기준 최단 순환 거리(±1칸)에 놓이고,
            화면에 걸치는 ±1 에만 src 를 걸어 초기 로드를 제한한다(= 자연스러운 프리로드). */}
        <div className="absolute inset-0" style={trackStyle}>
          {items.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={isVisible(i) ? src : undefined}
              alt={i === index ? `${title} 아웃풋 ${index + 1}` : ""}
              aria-hidden={i !== index}
              style={slideStyle(i)}
              // mobile 시안은 4:3 프레임을 꽉 채우는 크롭(cover), 데스크톱은 원본 비율 유지(contain)
              className="absolute inset-0 size-full object-cover select-none sm:object-contain"
              draggable={false}
            />
          ))}
        </div>
      </button>

      {/* 우하단 확대 버튼 — 모바일 전용(시안 1345:6285, dim 배경 24px 아이콘 박스).
          이미지 전체 버튼과 동일한 동작의 시각적 어포던스라 보조기술에는 중복 노출하지 않는다. */}
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={() => setZoomOpen(true)}
        className="absolute right-2 bottom-2 flex size-6 items-center justify-center rounded-[4px] bg-dim text-white sm:hidden"
      >
        <ArrowExpandIcon className="size-3.5" />
      </button>

      {/* 좌상단 액션 오버레이 — 데스크톱 전용(모바일은 페이지 헤더에서 제공) */}
      <div className="absolute top-4 left-4 hidden items-center gap-2 sm:flex">
        <OverlayAction
          label="추천"
          active={liked}
          onClick={onToggleLike}
          icon={liked ? <HeartFilledIcon className="size-6" /> : <HeartIcon className="size-6" />}
        />
        <OverlayAction
          label="북마크"
          active={bookmarked}
          onClick={onToggleBookmark}
          icon={
            bookmarked ? (
              <BookmarkFilledIcon className="size-6" />
            ) : (
              <BookmarkIcon className="size-6" />
            )
          }
        />
        <OverlayAction label="신고" onClick={onReport} icon={<FlagIcon className="size-6" />} />
      </div>

      {hasMultiple ? (
        <>
          <span
            data-testid="carousel-indicator"
            // mobile: 좌상단(시안) / desktop: 우상단(좌상단은 액션 오버레이 자리)
            className="absolute top-2 left-2 rounded bg-dim px-1.5 py-0.5 text-title-3 text-white sm:top-4 sm:right-4 sm:left-auto sm:px-2"
          >
            {index + 1}/{total}
          </span>
          {/* 화살표는 데스크톱 전용 — 모바일 시안은 스와이프로 넘긴다 */}
          <button
            type="button"
            aria-label="이전 이미지"
            onClick={() => go(-1)}
            className="absolute top-1/2 left-3 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-dim text-white transition-colors hover:bg-dim/80 sm:flex"
          >
            <ChevronLeftIcon className="size-6" />
          </button>
          <button
            type="button"
            aria-label="다음 이미지"
            onClick={() => go(1)}
            className="absolute top-1/2 right-3 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-dim text-white transition-colors hover:bg-dim/80 sm:flex"
          >
            <ChevronRightIcon className="size-6" />
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

"use client";

import {
  ArrowExpandIcon,
  BookmarkFilledIcon,
  BookmarkIcon,
  FlagIcon,
  HeartFilledIcon,
  HeartIcon,
} from "@/components/ui/icons";
import dynamic from "next/dynamic";
import NextImage from "next/image";
import { useState } from "react";

import { CarouselNavigation } from "@/components/ui/carousel-navigation";
import { useCarouselSwipe } from "@/hooks/use-carousel-swipe";
import { cn } from "@/lib/utils";

/**
 * 확대 모달은 **열릴 때 받는다**(지연 로딩).
 *
 * 이 모달만 `react-zoom-pan-pinch` 를 쓰는데, 정적 import 로 두면 확대를 한 번도 안 누른
 * 사용자까지 상세 페이지 초기 번들로 그 라이브러리를 받게 된다.
 * `ssr: false` — 뷰포트·포인터 이벤트에 의존하는 클라이언트 전용 UI라 서버에서 그릴 이유가 없다.
 */
const ImageZoomModal = dynamic(() => import("./image-zoom-modal").then((m) => m.ImageZoomModal), {
  ssr: false,
});

/** 아웃풋 이미지 최대 개수(BE 제약과 동일) */
export const MAX_OUTPUT_IMAGES = 10;

/**
 * 캐러셀 표시 폭 힌트 — 컨테이너 클래스(`-mx-4` 풀블리드 / `sm:w-full` / `xl:w-108`)와 맞춘다.
 * xl 의 `w-108` 은 432px 이다. 이 값이 실제 레이아웃과 어긋나면 필요보다 큰 이미지를 받는다.
 */
// sm~xl 은 단일 컬럼이라 콘텐츠 폭을 그대로 쓴다(최대 1280 컨테이너 - 좌우 여백).
const CAROUSEL_SIZES = "(min-width: 1280px) 432px, (min-width: 640px) 90vw, 100vw";

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
 *            좌상단 액션 오버레이 대신 **우하단 확대 버튼**만 두고(추천/북마크/신고는 페이지 헤더로 이동),
 *            화살표 대신 **스와이프**로 넘긴다. 카운터는 좌상단 8px.
 * - desktop: 좌상단 액션 오버레이 + **우하단 Carousel Navigation**(카운터·화살표 일체형, 499:2806).
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
        // tablet(sm~xl): 단일 컬럼이라 폭이 그대로 콘텐츠 폭이다. 정사각으로 두면
        // 1000px 넘는 화면에서 이미지 한 장이 화면을 통째로 먹는다.
        // 4:3 으로 눕히고 뷰포트 높이의 60% 로 상한을 둬서 스크롤 없이 아래 내용이 보이게 한다.
        "sm:mx-0 sm:aspect-[4/3] sm:max-h-[60svh] sm:w-full sm:rounded-md",
        // xl: 좌측 고정 컬럼(시안 값) — 상한이 필요 없다
        "xl:aspect-auto xl:h-156 xl:max-h-none xl:w-108",
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
            // 슬라이드 위치(translate %)는 래퍼가 맡는다 — `fill` 이미지는 자기 위치를 직접
            // 잡으므로 transform 을 같이 걸 수 없다. 래퍼가 컨테이너와 같은 크기라 % 기준은 동일하다.
            <div
              key={i}
              aria-hidden={i !== index}
              style={slideStyle(i)}
              className="absolute inset-0"
            >
              {isVisible(i) ? (
                <NextImage
                  src={src}
                  alt={i === index ? `${title} 아웃풋 ${index + 1}` : ""}
                  fill
                  sizes={CAROUSEL_SIZES}
                  // 현재 장은 상세 페이지의 LCP 요소다. 좌우 프리로드분(±1)은 lazy 로 둔다.
                  loading={i === index ? "eager" : "lazy"}
                  fetchPriority={i === index ? "high" : "auto"}
                  // mobile 시안은 4:3 프레임을 꽉 채우는 크롭(cover), 데스크톱은 원본 비율 유지(contain)
                  className="object-cover select-none sm:object-contain"
                  draggable={false}
                />
              ) : null}
            </div>
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
          {/* mobile: 좌상단 카운터만(시안). 넘기는 건 스와이프라 화살표가 필요 없다. */}
          <span
            data-testid="carousel-indicator"
            className="absolute top-2 left-2 rounded bg-dim px-1.5 py-0.5 text-title-3 text-white sm:hidden"
          >
            {index + 1}/{total}
          </span>
          {/*
            desktop: 카운터 + 화살표가 한 알약에 묶인 Table/Carousel Navigation 을 **우하단**에 둔다.
            (개정 전에는 카운터가 우상단, 화살표가 이미지 좌우 중앙에 따로 떠 있었다 — 시안 499:2806)
            loop: 모바일 스와이프가 순환하므로 버튼도 같이 순환시킨다.
          */}
          <CarouselNavigation
            page={index + 1}
            total={total}
            // 버튼은 한 칸씩만 움직이고 `go` 도 방향(±1)만 받는다.
            // "다음 쪽 번호"(끝에서는 1로 감김)와 같으면 앞으로, 아니면 뒤로.
            onPageChange={(next) => go(next === ((index + 1) % total) + 1 ? 1 : -1)}
            loop
            prevLabel="이전 이미지"
            nextLabel="다음 이미지"
            className="absolute right-4 bottom-4 hidden sm:inline-flex"
          />
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

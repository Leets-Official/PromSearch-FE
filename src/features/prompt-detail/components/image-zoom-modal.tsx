"use client";

import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "@/components/ui/icons";
import { useEffect, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import { useCarouselSwipe } from "@/hooks/use-carousel-swipe";
import { cn } from "@/lib/utils";

type ImageZoomModalProps = {
  images: string[];
  title: string;
  initialIndex?: number;
  onClose: () => void;
};

/**
 * 이미지 확대 모달 (Figma 893:2423) — 페이지 전체 dim(gray-900/60%) 위에 큰 이미지.
 * - 좌상단 `현재/전체` 카운트, 우상단 닫기(XIcon).
 * - 좌우 캐러셀 화살표(dim 배경 + 흰 화살표) + ←/→ 키.
 * - 휠/트랙패드/핀치 줌 + 드래그 팬(react-zoom-pan-pinch).
 * - 하단 썸네일 스트립: 현재는 밝게(+링), 나머지는 흐리게. 클릭 시 전환.
 *
 * 조건부 마운트 전제(부모가 열 때만 렌더) — 열릴 때마다 initialIndex 로 시작한다.
 *
 * 모바일(Figma "프롬프트 상세 - 사진 확대" 1345:6368)은 화면 폭을 채운 이미지 한 장 +
 * 상단 중앙 카운트만 남긴다(썸네일·좌우 화살표 없음 — 이미지 이동은 캐러셀 스와이프로).
 *
 * 스와이프는 캐러셀과 같은 트랙 방식(useCarouselSwipe)이라 손가락을 따라 이어서 넘어간다.
 * 줌/팬은 **현재 장**에만 걸고(TransformWrapper), 확대(scale>1) 중에는 스와이프를 끈다 —
 * 그렇지 않으면 확대한 그림을 옆으로 미는 동작과 장 넘김이 서로 잡아먹는다.
 */
export function ImageZoomModal({ images, title, initialIndex = 0, onClose }: ImageZoomModalProps) {
  const total = images.length;
  // 확대(scale>1)된 장의 인덱스. 확대 중에는 가로 드래그가 "팬"이라 장 넘김을 막는다.
  // 인덱스로 들고 있으면 장이 바뀌는 순간 자동으로 해제돼 별도 리셋 effect 가 필요 없다.
  const [zoomedAt, setZoomedAt] = useState<number | null>(null);
  const swipeEnabled = zoomedAt === null;
  // 훅 반환값은 반드시 구조분해로 받는다 — 객체째 들고 프로퍼티로 접근하면
  // 컴파일러가 "렌더 중 ref 접근"으로 본다(react-hooks/refs).
  const { index, isVisible, setContainer, go, goTo, touchHandlers, trackStyle, slideStyle } =
    useCarouselSwipe({ total, initialIndex, enabled: swipeEnabled });
  const zoomed = zoomedAt === index;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, go]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} 이미지 확대`}
      // 모바일 시안은 완전한 검정 배경, 데스크톱은 페이지 위에 얹히는 딤
      className="fixed inset-0 z-50 flex flex-col bg-black sm:bg-dim"
    >
      {/* 상단 바 — 카운트와 닫기가 같은 줄에서 수직 정렬된다(모바일 카운트는 가운데) */}
      <div className="absolute inset-x-0 top-0 z-10 flex h-14 shrink-0 items-center px-4">
        <span className="absolute left-1/2 -translate-x-1/2 text-title-1 text-white sm:static sm:translate-x-0">
          {index + 1}/{total}
        </span>
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          // 44px 탭 타깃의 내부 패딩(10px)만큼 당겨, 아이콘이 화면 여백 16px 에 플러시되게 한다
          // (뒤로가기 헤더의 -ml-1.5 와 같은 규칙)
          className="-mr-2.5 ml-auto flex size-11 items-center justify-center rounded-md text-white hover:bg-white/10"
        >
          <XIcon className="size-6" />
        </button>
      </div>

      {/* 좌우 화살표 — 데스크톱 전용(모바일 시안에는 없다) */}
      {total > 1 ? (
        <>
          <button
            type="button"
            aria-label="이전 이미지"
            onClick={() => go(-1)}
            className="absolute top-1/2 left-4 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-md bg-dim text-white transition-colors hover:bg-dim/80 sm:flex"
          >
            <ChevronLeftIcon className="size-6" />
          </button>
          <button
            type="button"
            aria-label="다음 이미지"
            onClick={() => go(1)}
            className="absolute top-1/2 right-4 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-md bg-dim text-white transition-colors hover:bg-dim/80 sm:flex"
          >
            <ChevronRightIcon className="size-6" />
          </button>
        </>
      ) : null}

      {/* 확대 영역 — 바깥(배경) 클릭 시 닫힘 */}
      <div
        ref={setContainer}
        className="relative min-h-0 flex-1 overflow-hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        {...touchHandlers}
        style={{ touchAction: zoomed ? "none" : "pan-y" }}
      >
        <div className="absolute inset-0" style={trackStyle}>
          {images.map((src, i) =>
            isVisible(i) ? (
              <div
                key={i}
                aria-hidden={i !== index}
                style={slideStyle(i)}
                className="absolute inset-0 flex items-center justify-center px-0 sm:px-20"
              >
                {i === index ? (
                  /*
                    wrapper·content 를 **둘 다** 확대 영역 크기로 고정하는 게 핵심이다.
                    라이브러리 기본값은 content 가 fit-content 라, 이미지가 로드되기 전에는
                    높이가 0 이다. 그 상태에서 초기 중앙 정렬이 계산되면 오프셋이
                    "영역 높이의 절반"으로 굳어, 나중에 로드된 이미지가 아래쪽으로 밀려 붙는다.
                    content 를 영역과 같은 크기로 두면 오프셋이 항상 0 이라 로드 타이밍과 무관하고,
                    이미지는 그 안에서 object-contain 으로 가운데 놓인다.
                  */
                  <TransformWrapper
                    centerOnInit
                    doubleClick={{ mode: "toggle" }}
                    minScale={1}
                    maxScale={5}
                    onTransform={(_, state) => setZoomedAt(state.scale > 1.01 ? index : null)}
                  >
                    <TransformComponent
                      wrapperClass="!h-full !w-full"
                      contentClass="!h-full !w-full !items-center !justify-center"
                    >
                      <ZoomSlideImage src={src} alt={`${title} 아웃풋 ${index + 1}`} />
                    </TransformComponent>
                  </TransformWrapper>
                ) : (
                  /* 이웃 장은 줌 없이 미리 그려만 둔다(스와이프 중 옆에 보이는 그림) */
                  <ZoomSlideImage src={src} alt="" />
                )}
              </div>
            ) : null,
          )}
        </div>
      </div>

      {/* 썸네일 스트립 — 현재는 밝게(+링), 나머지는 흐리게. 모바일 시안에는 없다. */}
      {total > 1 ? (
        <div className="hidden items-center justify-center gap-2 p-4 sm:flex">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              aria-label={`${i + 1}번 이미지 보기`}
              aria-current={i === index}
              onClick={() => goTo(i)}
              className={cn(
                "size-16 shrink-0 overflow-hidden rounded-md ring-2 transition-opacity",
                i === index
                  ? "opacity-100 ring-white"
                  : "opacity-40 ring-transparent hover:opacity-70",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * 확대 영역을 꽉 채우고 object-contain 으로 비율을 유지한다.
 * 크기를 영역에 맡기므로(고정 vh 없음) 이미지 원본 비율·로드 타이밍과 무관하게 항상 가운데다.
 */
function ZoomSlideImage({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} draggable={false} className="size-full object-contain select-none" />
  );
}

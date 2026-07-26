"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import { cn } from "@/lib/utils";

type ImageZoomModalProps = {
  images: string[];
  title: string;
  initialIndex?: number;
  onClose: () => void;
};

/**
 * 이미지 확대 모달 (Figma 893:2423) — 페이지 전체 dim(gray-900/60%) 위에 큰 이미지.
 * - 좌상단 `현재/전체` 카운트, 우상단 닫기(X).
 * - 좌우 캐러셀 화살표(dim 배경 + 흰 화살표) + ←/→ 키.
 * - 휠/트랙패드/핀치 줌 + 드래그 팬(react-zoom-pan-pinch).
 * - 하단 썸네일 스트립: 현재는 밝게(+링), 나머지는 흐리게. 클릭 시 전환.
 *
 * 조건부 마운트 전제(부모가 열 때만 렌더) — 열릴 때마다 initialIndex 로 시작한다.
 */
export function ImageZoomModal({ images, title, initialIndex = 0, onClose }: ImageZoomModalProps) {
  const [index, setIndex] = useState(initialIndex);
  const total = images.length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + total) % total);
      else if (e.key === "ArrowRight") setIndex((i) => (i + 1) % total);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, total]);

  const go = (delta: number) => setIndex((i) => (i + delta + total) % total);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} 이미지 확대`}
      className="fixed inset-0 z-50 flex flex-col bg-dim"
    >
      {/* 좌상단 카운트 */}
      <span className="absolute top-4 left-4 z-10 text-title-1 text-white">
        {index + 1}/{total}
      </span>

      {/* 우상단 닫기 */}
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex size-11 items-center justify-center rounded-md text-white hover:bg-white/10"
      >
        <X className="size-6" />
      </button>

      {/* 좌우 화살표 */}
      {total > 1 ? (
        <>
          <button
            type="button"
            aria-label="이전 이미지"
            onClick={() => go(-1)}
            className="absolute top-1/2 left-4 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-md bg-dim text-white transition-colors hover:bg-dim/80"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            type="button"
            aria-label="다음 이미지"
            onClick={() => go(1)}
            className="absolute top-1/2 right-4 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-md bg-dim text-white transition-colors hover:bg-dim/80"
          >
            <ChevronRight className="size-6" />
          </button>
        </>
      ) : null}

      {/* 확대 영역 — 바깥(배경) 클릭 시 닫힘 */}
      <div
        className="flex min-h-0 flex-1 items-center justify-center px-20"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <TransformWrapper
          key={index}
          centerOnInit
          doubleClick={{ mode: "toggle" }}
          minScale={1}
          maxScale={5}
        >
          <TransformComponent
            wrapperClass="!h-full !w-full !items-center !justify-center"
            contentClass="!items-center !justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[index]}
              alt={`${title} 아웃풋 ${index + 1}`}
              className="max-h-[70vh] max-w-[80vw] object-contain"
            />
          </TransformComponent>
        </TransformWrapper>
      </div>

      {/* 썸네일 스트립 — 현재는 밝게(+링), 나머지는 흐리게 */}
      {total > 1 ? (
        <div className="flex items-center justify-center gap-2 p-4">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              aria-label={`${i + 1}번 이미지 보기`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
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

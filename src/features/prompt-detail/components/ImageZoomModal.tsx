"use client";

import { X } from "lucide-react";
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
 * 이미지 확대 모달 — dim(gray-900/60%) 배경 위에 큰 이미지.
 * - 휠/트랙패드/핀치 줌 + 드래그 팬(react-zoom-pan-pinch).
 * - 하단 썸네일 스트립: 현재 보고 있는 이미지는 opacity-0(빈 자리로 위치 표시), 나머지는 흐리게.
 * - 닫기: X 버튼 · ESC · 배경 클릭.
 *
 * 조건부 마운트 전제(부모가 열 때만 렌더) — 열릴 때마다 fresh mount 되어 initialIndex 로 시작한다.
 */
export function ImageZoomModal({ images, title, initialIndex = 0, onClose }: ImageZoomModalProps) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} 이미지 확대`}
      className="fixed inset-0 z-50 flex flex-col bg-dim"
    >
      <div className="flex items-center justify-end p-4">
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="flex size-11 items-center justify-center rounded-md text-white hover:bg-white/10"
        >
          <X className="size-6" />
        </button>
      </div>

      {/* 확대 영역 — 바깥(배경) 클릭 시 닫힘 */}
      <div
        className="flex min-h-0 flex-1 items-center justify-center px-6"
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
              className="max-h-[75vh] max-w-[85vw] object-contain"
            />
          </TransformComponent>
        </TransformWrapper>
      </div>

      {/* 썸네일 스트립 */}
      {images.length > 1 ? (
        <div className="flex items-center justify-center gap-2 p-4">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              aria-label={`${i + 1}번 이미지 보기`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                "size-16 shrink-0 overflow-hidden rounded-md transition-opacity",
                // 현재 이미지는 opacity-0(빈 자리로 위치 표시), 나머지는 흐리게
                i === index ? "opacity-0" : "opacity-40 hover:opacity-70",
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

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type OutputCarouselProps = {
  images: string[];
  title: string;
};

/** 아웃풋 이미지 캐러셀 — 다중 이미지, `현재/전체` 인디케이터, 이전/다음(순환) */
export function OutputCarousel({ images, title }: OutputCarouselProps) {
  const [index, setIndex] = useState(0);
  const total = images.length;
  const hasMultiple = total > 1;

  const go = (delta: number) => setIndex((i) => (i + delta + total) % total);

  return (
    <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-md bg-bg-disabled lg:aspect-auto lg:h-[624px] lg:w-[432px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[index]}
        alt={`${title} 아웃풋 ${index + 1}`}
        className="size-full object-cover"
      />

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
    </div>
  );
}

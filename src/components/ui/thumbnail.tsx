"use client";

import { useState } from "react";
import NextImage from "next/image";

import { ImageFallback } from "@/components/ui/image-fallback";

import { cn } from "@/lib/utils";

/**
 * 썸네일 이미지 컨테이너. Figma thumbnail(209:3676): 288x162 = 16:9 비율.
 * - radius 8px(=rounded-md), object-cover 로 크롭.
 * - src 미지정 시 placeholder(bg-bg-secondary) 노출.
 *
 * `next/image` 를 쓰는 이유: 원본은 사용자가 올린 결과물 사진(수천 px)인데 카드는 288px 로만
 * 그린다. 그대로 내려받으면 화면 폭의 몇 배를 전송하게 되므로, **표시 크기에 맞춘 리사이즈 +
 * AVIF/WebP 변환**을 서버에 맡긴다. 갤러리 카드 썸네일은 실측상 홈의 LCP 요소다.
 *
 * 컨테이너가 `aspect-video` 로 자리를 미리 잡으므로 `fill` 을 써도 레이아웃 시프트가 없다(CLS 0 유지).
 */
type ThumbnailProps = React.ComponentProps<"div"> & {
  src?: string;
  alt?: string;
  /** 이미지 fit 방식. 기본 cover. */
  fit?: "cover" | "contain";
  /**
   * 뷰포트별 표시 폭 힌트 — 브라우저가 srcset 후보 중 무엇을 받을지 정하는 기준.
   * 기본값은 갤러리 그리드(모바일 1열 → sm 2열 → lg 3열) 기준이며, 다른 레이아웃에서 쓰면
   * 반드시 그 폭을 넘겨야 한다(안 그러면 필요보다 큰 이미지를 받는다).
   */
  sizes?: string;
  /**
   * 첫 화면에 보이는 카드면 `true`. 지연 로딩을 끄고 즉시 받아 LCP 를 앞당긴다.
   * 화면 밖 카드까지 켜면 대역폭만 낭비하므로 상단 몇 장에만 쓴다.
   */
  eager?: boolean;
};

/** 갤러리 그리드(`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) 기준 기본 폭 힌트 */
const DEFAULT_SIZES = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

function Thumbnail({
  className,
  src,
  alt = "",
  fit = "cover",
  sizes = DEFAULT_SIZES,
  eager = false,
  ...props
}: ThumbnailProps) {
  /*
    로드 실패(대개 presigned URL 403) 상태.

    src 가 바뀌면 새 이미지는 다시 시도해야 하므로 실패 표시를 지운다.
    effect 가 아니라 **렌더 중 조정**이다 — effect 로 하면 옛 실패 화면이 한 번 그려진 뒤
    다시 그려져 깜빡인다(이 저장소가 쓰는 "props 변화로 state 조정" 패턴).
  */
  const [failed, setFailed] = useState(false);
  const [lastSrc, setLastSrc] = useState(src);
  if (src !== lastSrc) {
    setLastSrc(src);
    setFailed(false);
  }

  return (
    <div
      data-slot="thumbnail"
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-md bg-bg-secondary",
        className,
      )}
      {...props}
    >
      {src && !failed ? (
        <NextImage
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          // 이미지가 깨졌을 때 빈칸만 남지 않도록 대체 표시로 바꾼다
          onError={() => setFailed(true)}
          // Next 16 에서 `priority` 는 폐지됐다 → 즉시 로딩은 loading/fetchPriority 로 표현한다.
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          className={fit === "cover" ? "object-cover" : "object-contain"}
        />
      ) : failed ? (
        <ImageFallback compact />
      ) : null}
    </div>
  );
}

export { Thumbnail };
export type { ThumbnailProps };

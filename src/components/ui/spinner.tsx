"use client";

import { useEffect, useRef } from "react";
import type { AnimationItem } from "lottie-web";

import { cn } from "@/lib/utils";
import loadingAnimation from "@/components/ui/loading-animation.json";

/**
 * 로딩 표시 — 디자이너가 준 Lottie(점 4개가 순서대로 튀는 애니메이션)를 재생합니다.
 *
 * - 원본: lottie.host `G4g7pw51oM.json`. 저장소에는 포인트 컬러만 브랜드(#E63946)로 바꾼
 *   `loading-animation.json` 을 둡니다(그 외 키프레임은 원본 그대로).
 *   → 색이 JSON 에 박혀 있어 `text-*` 유틸리티로는 색이 바뀌지 않습니다.
 * - 원본 아트보드(500x500)에는 여백이 많아 점이 실제로 있는 영역만 잘라 그립니다(viewBoxSize).
 *   그래서 기본 비율이 가로로 긴 형태(약 3.3:1)이고, 크기는 `w-*`/`h-*` 로 조절합니다.
 * - 재생기는 필요할 때만 동적 import 합니다(shape 레이어만 쓰므로 light 빌드로 충분).
 * - `prefers-reduced-motion` 이면 반복 재생 대신 한 프레임만 정지 상태로 보여줍니다.
 */

/** 점이 실제로 그려지는 영역(원본 아트보드 좌표) — "minX minY width height" */
const CONTENT_VIEW_BOX = "44 151 430 132";

/** 정지 상태로 보여줄 프레임(첫 점이 올라온 시점) */
const STILL_FRAME = 14;

function Spinner({ className, ...props }: React.ComponentProps<"div">) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animation: AnimationItem | null = null;
    let cancelled = false;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    void (async () => {
      const lottie = (await import("lottie-web/build/player/lottie_light")).default;
      if (cancelled) return;

      animation = lottie.loadAnimation({
        container,
        renderer: "svg",
        loop: true,
        autoplay: !reduceMotion,
        animationData: loadingAnimation,
        rendererSettings: {
          viewBoxSize: CONTENT_VIEW_BOX,
          preserveAspectRatio: "xMidYMid meet",
        },
      });

      if (reduceMotion) animation.goToAndStop(STILL_FRAME, true);
    })();

    return () => {
      cancelled = true;
      animation?.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("h-4 w-13", className)}
      {...props}
    />
  );
}

export { Spinner };

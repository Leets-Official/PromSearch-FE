import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

/**
 * Text Input (Figma 228:541)
 * - 인풋 본체만 담당. Title/Caption 라벨은 폼 레이아웃에서 별도 구성한다.
 * - 치수: 높이 48px(h-12), radius 8px(rounded-md), 좌우 패딩 16px(px-4), 본문 Body-1(16px/24px).
 * - 상태별 border(시맨틱 토큰 매핑):
 *   · default / filled → stroke-disabled(#adaca7, gray-400)
 *   · hover / active(focus) → stroke-strong(black), focus 시 Interaction 그림자
 *   · disabled → bg-disabled(gray-200) + stroke-disabled, 텍스트 disabled
 *   · error(aria-invalid) → 브랜드 계열 red
 *   · success(data-success) → 성공 전용 파랑(#005eeb). 시맨틱 토큰이 없어 primitive 하드코딩(+주석).
 * - placeholder는 text-disabled, 입력값(filled)은 text-primary.
 * - 라이트 온리 프로젝트라 dark:* 는 사용하지 않는다(globals.css 주석 참고).
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        // 형태 · 치수
        "h-12 w-full min-w-0 rounded-md border px-4 text-body-1 transition-colors outline-none",
        // 색: 기본은 배경 primary + gray-400 테두리, placeholder/텍스트 토큰
        "border-stroke-disabled bg-bg-primary text-text-primary placeholder:text-text-disabled",
        // hover / focus(active) : 테두리 강조 + 포커스 그림자
        "hover:border-stroke-strong focus-visible:border-stroke-strong focus-visible:shadow-[0px_4px_8px_rgba(35,35,33,0.13)]",
        // disabled : 배경/테두리 disabled, 상호작용 차단
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-stroke-disabled disabled:bg-bg-disabled disabled:text-text-disabled disabled:placeholder:text-text-disabled",
        // error : aria-invalid 시 브랜드 red 테두리 (Figma #fd2600 ≈ red-500 계열)
        "aria-invalid:border-red-500 hover:aria-invalid:border-red-500 focus-visible:aria-invalid:border-red-500",
        // success : data-success 시 파란 테두리 — 성공 전용 색이라 시맨틱 토큰 없음(#005eeb 하드코딩)
        "data-success:border-[#005eeb] hover:data-success:border-[#005eeb] focus-visible:data-success:border-[#005eeb]",
        // file input 잔여 스타일(기존 동작 유지)
        "file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-body-3 file:font-medium file:text-text-primary",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Text Area (Figma 271:956)
 * - 여러 줄 입력 본체. Title/Caption/글자수 카운터는 폼 레이아웃에서 별도 구성한다.
 * - 치수: min-height 120px(min-h-30), radius 8px(rounded-md), 패딩 px-4 py-3, 본문 Body-1(16px/24px).
 * - 상태별 border는 Input과 동일한 규칙(시맨틱 토큰 매핑):
 *   · default / filled → stroke-disabled(gray-400)
 *   · hover / active(focus) → stroke-strong(black), focus 시 Interaction 그림자
 *   · disabled → bg-disabled(gray-200) + stroke-disabled
 *   · error(aria-invalid) → red-500 계열
 * - placeholder는 text-disabled, 입력값은 text-primary.
 * - 라이트 온리 프로젝트라 dark:* 미사용(globals.css 참고).
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // 형태 · 치수 (field-sizing-content 로 내용에 따라 늘어남, 최소 120px)
        "field-sizing-content min-h-30 w-full rounded-md border px-4 py-3 text-body-1 transition-colors outline-none",
        // 색: 배경 primary + gray-400 테두리, placeholder/텍스트 토큰
        "border-stroke-disabled bg-bg-primary text-text-primary placeholder:text-text-disabled",
        // hover / focus(active)
        "hover:border-stroke-strong focus-visible:border-stroke-strong focus-visible:shadow-[0px_4px_8px_rgba(35,35,33,0.13)]",
        // disabled
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-stroke-disabled disabled:bg-bg-disabled disabled:text-text-disabled disabled:placeholder:text-text-disabled",
        // error
        "aria-invalid:border-red-500 hover:aria-invalid:border-red-500 focus-visible:aria-invalid:border-red-500",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { CheckIcon, MinusIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * 체크박스 — Figma Checkbox(1085:2437 default / 1085:2438 selected).
 * - 20x20, radius 4px, 테두리 Stroke/brand(red-500).
 * - default : 배경 Background/primary.
 * - selected: 배경 Background/brand + 흰색 check 아이콘.
 * indeterminate(부분 선택)는 시안에 없지만 "전체 동의" 류에 필요해 minus 로 함께 지원한다.
 */
function Checkbox({ className, indeterminate, children, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      indeterminate={indeterminate}
      className={cn(
        "inline-flex size-5 shrink-0 items-center justify-center rounded-[4px] border border-stroke-brand bg-bg-primary transition-colors outline-none",
        // 선택/부분선택: 브랜드 배경으로 채움
        "data-indeterminate:bg-bg-brand data-checked:bg-bg-brand",
        // 포커스 링(기존 컴포넌트 패턴)
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        // 비활성화 — 시안에 없어 토큰 기준으로 보수적으로 처리
        "disabled:cursor-not-allowed disabled:border-stroke-disabled disabled:bg-bg-disabled",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-text-on-brand data-unchecked:hidden"
      >
        {children ??
          (indeterminate ? (
            <MinusIcon className="size-3.5" strokeWidth={3} />
          ) : (
            <CheckIcon className="size-3.5" strokeWidth={3} />
          ))}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };

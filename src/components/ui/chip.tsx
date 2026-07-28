"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Chip = 선택형 칩 (필터/토글 등에 사용).
 * Figma Chip(프레임 271:220, 심볼 271:218 default / 271:219 selected) 기준:
 * - 높이 36(h-9), radius 8px(rounded-md)
 * - 패딩 좌우 12(px-3) / 상하 8(py-2)  ← Spacing/Component lg·md
 * - 타이포 Title 3(text-title-3: 14/20, semibold)
 * 상태(state)
 * - default : 배경 bg-primary + 테두리 stroke-primary + 글자 text-primary
 * - selected: 배경 interaction-neutral-selected(red-400/25%) + 테두리 stroke-brand + 글자 text-brand
 * 선택 상태는 `selected` prop으로 제어하며, 접근성을 위해 aria-pressed로도 노출한다.
 */
const chipVariants = cva(
  "group/chip inline-flex h-9 w-fit shrink-0 cursor-pointer items-center justify-center gap-1 rounded-md border px-3 py-2 text-title-3 whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:border-stroke-disabled disabled:bg-bg-disabled disabled:text-text-disabled [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      state: {
        // 미선택: 기본 배경 + Stroke/primary(#e4e4e4) 테두리
        default: "border-stroke-primary bg-bg-primary text-text-primary hover:bg-bg-secondary",
        // 선택됨: 브랜드 강조 (배경 red-400/25% · 테두리·글자 brand)
        selected: "border-stroke-brand bg-interaction-neutral-selected text-text-brand",
      },
    },
    defaultVariants: {
      state: "default",
    },
  },
);

function Chip({
  className,
  state,
  selected,
  ...props
}: ButtonPrimitive.Props &
  Omit<VariantProps<typeof chipVariants>, "state"> & {
    /** 선택 상태. 지정 시 state variant보다 우선한다. */
    selected?: boolean;
    state?: VariantProps<typeof chipVariants>["state"];
  }) {
  // selected prop이 명시되면 그 값을, 아니면 state variant를 사용
  const resolvedState = selected ? "selected" : (state ?? "default");

  return (
    <ButtonPrimitive
      data-slot="chip"
      aria-pressed={selected ?? state === "selected"}
      className={cn(chipVariants({ state: resolvedState, className }))}
      {...props}
    />
  );
}

export { Chip, chipVariants };

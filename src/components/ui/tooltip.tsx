"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";

import { cn } from "@/lib/utils";

/**
 * Tooltip (base-ui 기반)
 * Figma "Style" 스펙:
 * - radius: Radius/md = 8px (rounded-md)
 * - background: Opacity/dim = rgba(35,35,33,0.60)  ← 반투명 딤 (bg-dim 토큰)
 * - box-shadow: 0 4px 8px 0 rgba(35,35,33,0.13)
 * - padding: 15px 45px 51px 17px  ※ 시안 프레임값(말풍선 자동 레이아웃 여백 포함)이라
 *   실제 텍스트 여백만 반영해 px-4/py-3 로 근사. 원값 그대로 필요하면 아래 주석 참고.
 * - gap: 4px, flex-col
 */
function TooltipProvider({ delay = 200, ...props }: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider delay={delay} {...props} />;
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 6,
  side = "bottom",
  align = "start",
  children,
  ...props
}: TooltipPrimitive.Popup.Props & {
  sideOffset?: number;
  side?: TooltipPrimitive.Positioner.Props["side"];
  align?: TooltipPrimitive.Positioner.Props["align"];
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner sideOffset={sideOffset} side={side} align={align}>
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "z-50 flex max-w-xs flex-col gap-1 px-4 py-3",
            "rounded-md bg-dim text-caption-1 text-white shadow-[0_4px_8px_0_rgba(35,35,33,0.13)]",
            "origin-[var(--transform-origin)] transition-[transform,opacity] data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
            className,
          )}
          {...props}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

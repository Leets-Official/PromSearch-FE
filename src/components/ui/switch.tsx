"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

/**
 * 토글 스위치 — Figma Toggle(1512:6791 on / 1512:6790 off).
 * - 트랙 44x24, radius/full, 내부 패딩 4px → 썸 16x16.
 * - on : 트랙 Background/brand(red-500), 썸이 오른쪽(translate 20px = 16+gap 4).
 * - off: 트랙 Background/disabled(#ececec), 썸이 왼쪽.
 * - 썸은 Background/elevated(white) + Interaction drop-shadow.
 */
function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors outline-none",
        "bg-bg-disabled data-checked:bg-bg-brand",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="size-4 rounded-full bg-bg-elevated shadow-[0_4px_8px_rgb(35_35_33/0.13)] transition-transform data-checked:translate-x-5"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

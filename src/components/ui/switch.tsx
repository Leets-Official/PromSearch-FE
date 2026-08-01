"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

/**
 * Switch (토글) — base-ui Switch 기반.
 * Figma 스펙:
 * - 트랙: 높이 24px, radius full, padding 4px(Spacing/Component xs)
 * - on:  Background/brand (#E63946)  / off: Background/disabled (#ECECEC)
 * - thumb: 흰 원, 트랙 안에서 좌↔우 이동
 */
function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // 트랙: 높이 24 / 폭 44 / radius full / 좌우 패딩 4
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors outline-none",
        // 상태 배경: on=brand, off=disabled
        "bg-bg-disabled data-checked:bg-bg-brand",
        // 포커스 링 · 비활성
        "focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "size-4 rounded-full bg-white shadow-sm transition-transform",
          // off: 왼쪽 / on: 오른쪽으로 (트랙 44 - 패딩 8 - thumb 16 = 20px 이동)
          "translate-x-0 data-checked:translate-x-5",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

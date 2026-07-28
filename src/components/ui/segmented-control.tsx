"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn } from "@/lib/utils";

/**
 * Segmented Control
 * - base-ui `Tabs` 프리미티브 기반(단일 선택 + value/onValueChange controlled API).
 *   ToggleGroup은 값이 배열(다중 선택 지향)이라, 단일 선택 세그먼트에는 Tabs가 더 적합.
 * - 배경 트랙(Background/primary + Stroke/secondary) 안에서 선택된 세그먼트가
 *   Interaction/Neutral/selected 배경 + Stroke/brand 테두리 + Text/brand 로 강조된다.
 * - 세그먼트 개수는 가변(SegmentedControlItem 을 원하는 만큼 배치).
 * Figma 271:338 기준: 트랙 radius 6px(rounded-sm)/padding 4px, 세그먼트 radius 4px, 세로 패딩 8px.
 */

/** 트랙(Root) — value / onValueChange 로 제어. */
function SegmentedControl({ className, ...props }: TabsPrimitive.Root.Props) {
  return <TabsPrimitive.Root data-slot="segmented-control" className={className} {...props} />;
}

/** 세그먼트들을 감싸는 트랙 컨테이너. */
function SegmentedControlList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="segmented-control-list"
      className={cn(
        // 트랙: 배경 + 보조 스트로크, 내부 여백 4px, 세그먼트 간 gap 4px
        "inline-flex w-full items-center gap-1 rounded-sm border border-stroke-secondary bg-bg-primary p-1",
        className,
      )}
      {...props}
    />
  );
}

/** 개별 세그먼트. value 로 식별하며 선택 시 브랜드 강조. */
function SegmentedControlItem({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="segmented-control-item"
      className={cn(
        // 기본: 동일 폭(flex-1), title-3(14px semibold), 비활성 텍스트
        "flex flex-1 cursor-pointer items-center justify-center rounded-lg border border-transparent px-2 py-2 text-title-3 whitespace-nowrap text-text-disabled transition-colors outline-none select-none",
        // 선택(active): neutral-selected 배경 + brand 스트로크 + brand 텍스트
        // base-ui Tabs.Tab 은 활성 시 data-active 를 부여한다(data-selected 아님).
        "data-active:border-stroke-brand data-active:bg-interaction-neutral-selected data-active:text-text-brand",
        // 포커스 링(기존 컴포넌트 패턴)
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        // 비활성화
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

/** 선택된 세그먼트에 연결된 콘텐츠 패널(선택적). */
function SegmentedControlPanel({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="segmented-control-panel"
      className={cn("outline-none", className)}
      {...props}
    />
  );
}

export { SegmentedControl, SegmentedControlList, SegmentedControlItem, SegmentedControlPanel };

"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn } from "@/lib/utils";

/**
 * Tabs (밑줄형)
 * - base-ui `Tabs` 프리미티브(Tabs.Root/List/Tab/Indicator/Panel) 기반.
 * - 각 Tab 하단 밑줄로 상태 구분. 선택(default 대비 selected):
 *   텍스트 Text/disabled → Text/primary, 밑줄 Stroke/disabled → Stroke/strong(black).
 * - TabsIndicator 로 활성 탭 위치에 움직이는 밑줄 인디케이터를 표시(강조 밑줄).
 * Figma 412:934 기준: 탭 패딩 12px, 타이포 title-1(16px), 밑줄 1px.
 */

/** 루트 — value / onValueChange 로 제어. */
function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  );
}

/** 탭 버튼들의 가로 리스트. 하단에 기본(비활성) 밑줄을 깔고 그 위에 인디케이터를 얹는다. */
function TabsList({ className, children, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        // 리스트 전체 하단 라인(비활성 밑줄): Stroke/disabled
        "relative flex items-center border-b border-stroke-disabled",
        className,
      )}
      {...props}
    >
      {children}
      <TabsIndicator />
    </TabsPrimitive.List>
  );
}

/** 개별 탭 버튼. */
function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        // 기본: 패딩 12px, title-1(16px), 비활성 텍스트
        "flex cursor-pointer items-center justify-center p-3 text-title-1 whitespace-nowrap text-text-disabled transition-colors outline-none select-none",
        // 선택: 기본 텍스트 색으로 강조
        "data-selected:text-text-primary",
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

/** 활성 탭 위치를 따라 움직이는 강조 밑줄. base-ui 가 제공하는 CSS 변수로 위치/폭 계산. */
function TabsIndicator({ className, ...props }: TabsPrimitive.Indicator.Props) {
  return (
    <TabsPrimitive.Indicator
      data-slot="tabs-indicator"
      className={cn(
        // 활성 탭 좌표/폭에 맞춰 하단에 배치되는 강조 밑줄(Stroke/strong)
        "absolute bottom-0 left-0 h-0.5 w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] bg-stroke-strong transition-all duration-200",
        className,
      )}
      {...props}
    />
  );
}

/** 선택된 탭에 연결된 콘텐츠 패널. */
function TabsPanel({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-panel"
      className={cn("outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsIndicator, TabsPanel };

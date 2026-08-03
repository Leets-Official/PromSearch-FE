"use client";

import type { DetailTab } from "@/features/prompt-detail/hooks/use-detail-tab";
import { cn } from "@/lib/utils";

const TABS: { value: DetailTab; label: string }[] = [
  { value: "description", label: "설명" },
  { value: "recipe", label: "레시피" },
  { value: "comments", label: "댓글" },
];

type DetailTabsProps = {
  active: DetailTab;
  onSelect: (tab: DetailTab) => void;
};

/** 설명/레시피/댓글 탭바(프레젠테이셔널) — 활성 상태는 상위(useDetailTab)가 관리 */
export function DetailTabs({ active, onSelect }: DetailTabsProps) {
  return (
    <div role="tablist" className="flex items-start">
      {TABS.map((tab) => {
        const selected = tab.value === active;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(tab.value)}
            className={cn(
              // 선택된 탭만 하단 언더바(stroke-strong), 나머지는 언더바 없음(투명)
              "border-b-2 p-3 text-title-1",
              selected
                ? "border-stroke-strong text-text-primary"
                : "border-transparent text-text-disabled",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

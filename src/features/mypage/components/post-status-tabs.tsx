"use client";

import { cn } from "@/lib/utils";
import { POST_STATUS_TABS, type PostStatus } from "@/mocks/data/mypage";

interface PostStatusTabsProps {
  value: PostStatus;
  onValueChange: (value: PostStatus) => void;
  className?: string;
}

/** 게시글 상태 탭 (게시완료 / 임시저장 / 비공개) */
export function PostStatusTabs({ value, onValueChange, className }: PostStatusTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="게시글 상태"
      className={cn("flex items-center gap-4 border-b border-stroke-primary", className)}
    >
      {POST_STATUS_TABS.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onValueChange(tab.value)}
            className={cn(
              "-mb-px border-b-2 px-1 py-2 text-title-1 transition-colors outline-none focus-visible:text-text-primary",
              active
                ? "border-text-primary text-text-primary"
                : "border-transparent text-text-disabled hover:text-text-secondary",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

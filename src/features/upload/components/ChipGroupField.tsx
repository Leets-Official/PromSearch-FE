"use client";

import type { Option } from "@/features/gallery/categories";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/utils";

/**
 * 칩 선택 그룹(라벨 + 선택지 칩들). 단일/복수 여부는 호출부의 토글 로직이 결정하고,
 * 이 컴포넌트는 표시만 담당한다(선택 상태는 항상 배열로 받는다 — 단일은 길이 0~1).
 *
 * 시안(793:2168 등): 라벨 Title 1(Bold 16) + 선택 힌트(Caption 1, brand),
 * 칩 wrap, gap 8px.
 */
type ChipGroupFieldProps<T extends string> = {
  label: string;
  /** 라벨 옆 힌트(예: "복수선택이 가능해요.") */
  hint?: string;
  options: readonly Option<T>[];
  /** 선택된 값들(단일 선택은 0~1개) */
  selected: readonly T[];
  onToggle: (value: T) => void;
  /** 검증 에러 메시지 */
  error?: string;
  className?: string;
};

function ChipGroupField<T extends string>({
  label,
  hint,
  options,
  selected,
  onToggle,
  error,
  className,
}: ChipGroupFieldProps<T>) {
  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      <div className="flex items-center gap-2">
        <span className="text-title-1 text-text-primary">{label}</span>
        {hint ? <span className="text-caption-1 text-text-brand">{hint}</span> : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <Chip
            key={opt.value}
            type="button"
            selected={selected.includes(opt.value)}
            onClick={() => onToggle(opt.value)}
          >
            {opt.label}
          </Chip>
        ))}
      </div>

      {error ? <span className="text-body-3 text-red-500">{error}</span> : null}
    </div>
  );
}

export { ChipGroupField };

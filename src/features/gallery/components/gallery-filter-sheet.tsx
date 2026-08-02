"use client";

import { BottomSheet, BottomSheetGroup } from "@/components/ui/bottom-sheet";
import { Chip } from "@/components/ui/chip";
import { AI_MODELS, OUTPUT_TYPES, TASKS, type Option } from "@/features/gallery/categories";
import { useGalleryFilters } from "@/features/gallery/hooks/use-gallery-filters";

/**
 * 모바일 필터 바텀시트 — Figma "홈 - 필터"(1379:5033 / bottomsheet 1379:5220).
 *
 * 데스크톱은 태스크/모델/결과물이 각각 드롭다운이지만, 모바일에서는 **세 축이 한 시트에**
 * 칩 목록으로 들어간다(시안 그대로). 어느 트리거를 눌러도 같은 시트가 열린다.
 * 칩은 누르는 즉시 URL 쿼리에 반영된다(별도 "적용" 버튼이 시안에 없음).
 */

/** 한 축(태스크/모델/결과물)의 칩 목록 — 다중 선택 토글. */
function FilterChipGroup<T extends string>({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: readonly Option<T>[];
  value: T[];
  onChange: (value: T[]) => void;
}) {
  const toggle = (option: T) =>
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);

  return (
    <BottomSheetGroup title={title}>
      <div className="flex flex-wrap content-start items-start gap-2">
        {options.map((option) => (
          <Chip
            key={option.value}
            size="lg"
            selected={value.includes(option.value)}
            onClick={() => toggle(option.value)}
          >
            {option.label}
          </Chip>
        ))}
      </div>
    </BottomSheetGroup>
  );
}

type GalleryFilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function GalleryFilterSheet({ open, onOpenChange }: GalleryFilterSheetProps) {
  const { query, setTasks, setModels, setOutputTypes } = useGalleryFilters();

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="필터">
      <FilterChipGroup title="태스크" options={TASKS} value={query.tasks} onChange={setTasks} />
      <FilterChipGroup title="모델" options={AI_MODELS} value={query.models} onChange={setModels} />
      <FilterChipGroup
        title="결과물 타입"
        options={OUTPUT_TYPES}
        value={query.outputTypes}
        onChange={setOutputTypes}
      />
    </BottomSheet>
  );
}

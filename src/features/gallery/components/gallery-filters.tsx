"use client";

import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { AI_MODELS, OUTPUT_TYPES, TASKS, type Option } from "@/features/gallery/categories";
import { useGalleryFilters } from "@/features/gallery/hooks/use-gallery-filters";

import { GalleryFilterSheet } from "./gallery-filter-sheet";

/**
 * 상단 필터 — 태스크 / 모델 / 결과물 드롭다운(멀티 셀렉트). (시안 "태스크 전체 ▾")
 * 축 내부 OR, 축 간 AND. 사이드바 직군과도 AND 결합.
 * 미선택이면 "{라벨} 전체", 선택 시 "{라벨} N".
 *
 * 반응형(Figma "홈 - 필터" 1379:5033):
 * - desktop : 축마다 드롭다운 팝업
 * - mobile  : 트리거를 누르면 세 축이 한 바텀시트에 칩으로 열린다(GalleryFilterSheet)
 */

/** 트리거 표기 — 미선택 "{label} 전체", 1개 "{라벨}", 2개↑ "{첫 라벨} 외 +N". */
function triggerLabel<T extends string>(label: string, options: readonly Option<T>[], value: T[]) {
  const selected = options.filter((o) => value.includes(o.value));
  if (selected.length === 0) return { text: `${label} 전체`, hasValue: false };
  if (selected.length === 1) return { text: selected[0].label, hasValue: true };
  return { text: `${selected[0].label} 외 +${selected.length - 1}`, hasValue: true };
}
function FilterSelect<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly Option<T>[];
  value: T[];
  onChange: (value: T[]) => void;
}) {
  // 트리거 표기(Figma 1174:4704)
  const { text: triggerText, hasValue } = triggerLabel(label, options, value);

  return (
    <Select multiple value={value} onValueChange={(next) => onChange(next as T[])}>
      {/* 시안 드롭다운 = px-16/py-12/h-48 → SelectTrigger 기본 size(default).
          색은 트리거에 지정 → 텍스트와 화살표(text-current)가 함께 따라간다. */}
      <SelectTrigger
        className={`w-40 ${hasValue ? "text-text-primary" : "text-text-disabled"}`}
        aria-label={`${label} 필터`}
      >
        <span>{triggerText}</span>
      </SelectTrigger>
      {/* 트리거 아래로 펼침(선택 항목을 트리거에 겹치지 않게) */}
      <SelectContent
        className="min-w-[200px]"
        align="start"
        alignItemWithTrigger={false}
        sideOffset={4}
      >
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} checkbox>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * 모바일 필터 트리거 — 생김새는 드롭다운(시안 109x36)이지만 팝업 대신 바텀시트를 연다.
 * 시트가 세 축을 모두 담으므로 어느 트리거를 눌러도 같은 시트가 열린다.
 */
function FilterSheetTrigger({
  label,
  hasValue,
  onClick,
}: {
  label: string;
  hasValue: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label} 필터`}
      aria-haspopup="dialog"
      className={`flex h-9 flex-1 items-center justify-between gap-2 rounded-md border border-stroke-disabled bg-bg-primary px-3 text-title-3 whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
        hasValue ? "text-text-primary" : "text-text-disabled"
      }`}
    >
      <span className="truncate">{label}</span>
      <ChevronDownIcon className="size-5 shrink-0" />
    </button>
  );
}

export function GalleryFilters() {
  const { query, setTasks, setModels, setOutputTypes } = useGalleryFilters();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      {/* desktop: 축별 드롭다운 */}
      <div data-slot="gallery-filters" className="hidden flex-wrap items-center gap-2 sm:flex">
        <FilterSelect label="태스크" options={TASKS} value={query.tasks} onChange={setTasks} />
        <FilterSelect label="모델" options={AI_MODELS} value={query.models} onChange={setModels} />
        <FilterSelect
          label="결과물"
          options={OUTPUT_TYPES}
          value={query.outputTypes}
          onChange={setOutputTypes}
        />
      </div>

      {/* mobile: 트리거 3개가 폭을 균등 분할, 누르면 통합 바텀시트 */}
      <div data-slot="gallery-filters-mobile" className="flex items-center gap-2 sm:hidden">
        <FilterSheetTrigger
          label="태스크"
          hasValue={query.tasks.length > 0}
          onClick={() => setSheetOpen(true)}
        />
        <FilterSheetTrigger
          label="모델"
          hasValue={query.models.length > 0}
          onClick={() => setSheetOpen(true)}
        />
        <FilterSheetTrigger
          label="결과물"
          hasValue={query.outputTypes.length > 0}
          onClick={() => setSheetOpen(true)}
        />
      </div>

      <GalleryFilterSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}

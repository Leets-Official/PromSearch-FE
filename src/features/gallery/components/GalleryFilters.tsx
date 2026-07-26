"use client";

import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { AI_MODELS, OUTPUT_TYPES, TASKS, type Option } from "@/features/gallery/categories";
import { useGalleryFilters } from "@/features/gallery/hooks/use-gallery-filters";

/**
 * 상단 필터 — 태스크 / 모델 / 결과물 드롭다운(멀티 셀렉트). (시안 "태스크 전체 ▾")
 * 축 내부 OR, 축 간 AND. 사이드바 직군과도 AND 결합.
 * 미선택이면 "{라벨} 전체", 선택 시 "{라벨} N".
 */
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
  // 트리거 표기(Figma 1174:4704):
  // - 미선택: "{label} 전체" (text-disabled)
  // - 1개: "{첫 라벨}"  / 2개↑: "{첫 라벨} 외 +{N-1}"  (text-primary)
  const selected = options.filter((o) => value.includes(o.value));
  const hasValue = selected.length > 0;
  const triggerText = !hasValue
    ? `${label} 전체`
    : selected.length === 1
      ? selected[0].label
      : `${selected[0].label} 외 +${selected.length - 1}`;

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

export function GalleryFilters() {
  const { query, setTasks, setModels, setOutputTypes } = useGalleryFilters();

  return (
    <div data-slot="gallery-filters" className="flex flex-wrap items-center gap-2">
      <FilterSelect label="태스크" options={TASKS} value={query.tasks} onChange={setTasks} />
      <FilterSelect label="모델" options={AI_MODELS} value={query.models} onChange={setModels} />
      <FilterSelect
        label="결과물"
        options={OUTPUT_TYPES}
        value={query.outputTypes}
        onChange={setOutputTypes}
      />
    </div>
  );
}

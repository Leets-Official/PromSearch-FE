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
  return (
    <Select multiple value={value} onValueChange={(next) => onChange(next as T[])}>
      {/* 시안 드롭다운 = px-16/py-12/h-48 → SelectTrigger 기본 size(default) */}
      <SelectTrigger className="w-40" aria-label={`${label} 필터`}>
        <span className={value.length > 0 ? "text-text-primary" : "text-text-secondary"}>
          {value.length > 0 ? `${label} ${value.length}` : `${label} 전체`}
        </span>
      </SelectTrigger>
      <SelectContent className="min-w-[200px]">
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

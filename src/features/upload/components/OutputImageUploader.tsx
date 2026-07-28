"use client";

import * as React from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

/**
 * 결과물 이미지 업로더 (시안 793:2361).
 * - 144×81 타일. 첫 타일은 추가(+) 버튼, 이후 업로드한 이미지 썸네일.
 * - 썸네일 호버 시 딤 + 휴지통 아이콘으로 삭제.
 * - 최대 10장, 중복(같은 파일) 제외. 파일 읽는 동안 + 타일에 로딩 스피너 노출.
 * - 목 단계라 파일을 data URL 로 읽어 보관한다(BE 연동 시 업로드 후 URL 로 교체).
 */
type OutputImageUploaderProps = {
  label: string;
  hint?: string;
  value: string[];
  onChange: (next: string[]) => void;
  className?: string;
};

/** 결과물 이미지 최대 장수 */
const MAX_IMAGES = 10;

const TILE = "h-[81px] w-[144px] shrink-0 rounded-md";

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function OutputImageUploader({
  label,
  hint,
  value,
  onChange,
  className,
}: OutputImageUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [isReading, setIsReading] = React.useState(false);

  const isFull = value.length >= MAX_IMAGES;

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;

    setIsReading(true);
    try {
      const dataUrls = await Promise.all(files.map(readAsDataURL));
      // 중복 제거(기존 value + 이번 배치 내), 최대 10장까지만 반영
      const seen = new Set(value);
      const additions: string[] = [];
      for (const url of dataUrls) {
        if (seen.has(url)) continue;
        seen.add(url);
        additions.push(url);
      }
      if (additions.length > 0) {
        onChange([...value, ...additions].slice(0, MAX_IMAGES));
      }
    } finally {
      setIsReading(false);
      // 같은 파일 재선택 허용(값 초기화)
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-title-1 text-text-primary">{label}</span>
        {hint ? <span className="text-caption-1 text-text-brand">{hint}</span> : null}
        <span className="text-caption-1 text-text-secondary">
          {value.length}/{MAX_IMAGES}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isReading || isFull}
          aria-label={
            isFull ? `이미지는 최대 ${MAX_IMAGES}장까지 첨부할 수 있어요` : "결과물 이미지 추가"
          }
          className={cn(
            TILE,
            "flex items-center justify-center bg-bg-secondary text-text-secondary transition-colors hover:bg-bg-disabled focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-bg-secondary",
          )}
        >
          {isReading ? <Spinner className="size-6" /> : <PlusIcon className="size-6" />}
        </button>

        {value.map((src, index) => (
          <div key={`${index}-${src.slice(0, 16)}`} className={cn(TILE, "group relative")}>
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL 미리보기(목) */}
            <img
              src={src}
              alt={`결과물 이미지 ${index + 1}`}
              className="pointer-events-none absolute inset-0 size-full rounded-md border border-stroke-primary object-cover"
            />
            {/* 호버 시에만 딤 + 휴지통 즉시 노출(transition 없음). 마우스가 벗어나면 바로 사라진다. */}
            <div className="absolute inset-0 flex items-center justify-center rounded-md bg-dim opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label={`결과물 이미지 ${index + 1} 삭제`}
                className="flex size-9 items-center justify-center rounded-md text-text-on-brand focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <Trash2Icon className="size-6" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => void handleFiles(e.target.files)}
      />
    </div>
  );
}

export { OutputImageUploader };

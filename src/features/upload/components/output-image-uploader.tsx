"use client";

import * as React from "react";
// 추가/삭제 아이콘은 디자인 시스템 세트에 없어 lucide 를 유지한다(시안 추가 시 icons.tsx 로 이동).
import { ImageIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

import { MAX_IMAGES, useImageUpload } from "../hooks/use-image-upload";
import type { PromptImageValue } from "../schema";

/**
 * 결과물 이미지 업로더 (시안 793:2361).
 * - 144×81 타일. 첫 타일은 추가(+) 버튼, 이후 업로드한 이미지 썸네일.
 * - 썸네일 호버 시 딤 + 휴지통 아이콘으로 삭제.
 * - 모바일(시안 1360:8994)은 정사각 타일 3열 그리드이고, 호버가 없는 터치 환경이라
 *   삭제 버튼을 항상 노출한다.
 * - 최대 10장.
 *
 * 파일은 **S3 로 직접** 올라간다(Presigned). 그래서 타일은 단순 미리보기가 아니라
 * 진행 상태를 함께 보여준다: 업로드 중 → (워터마크) 처리 중 → 완료 / 실패.
 * 실패한 타일은 남겨서 사용자가 지우고 다시 시도할 수 있게 한다.
 */
type OutputImageUploaderProps = {
  label: string;
  hint?: string;
  value: PromptImageValue[];
  onChange: (next: PromptImageValue[]) => void;
  /** 검증 에러 메시지 */
  error?: string;
  className?: string;
};

// mobile: 폭을 3등분한 정사각(그리드 셀 채움) / sm~: 시안 데스크톱 값 144x81 고정
const TILE = "aspect-square w-full rounded-md sm:aspect-auto sm:h-[81px] sm:w-[144px] sm:shrink-0";

/** 상태별 오버레이 문구. ready 면 없음(이미지만 보임) */
const STATUS_LABEL: Partial<Record<PromptImageValue["status"], string>> = {
  uploading: "업로드 중",
  processing: "처리 중",
  failed: "실패",
};

function OutputImageUploader({
  label,
  hint,
  value,
  onChange,
  error,
  className,
}: OutputImageUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const {
    addFiles,
    removeAt,
    isUploading,
    error: uploadError,
  } = useImageUpload({
    value,
    onChange,
  });

  const isFull = value.length >= MAX_IMAGES;
  const message = error ?? uploadError;

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-title-1 text-text-primary">{label}</span>
        {hint ? <span className="text-caption-1 text-text-brand">{hint}</span> : null}
        <span className="text-caption-1 text-text-secondary">
          {value.length}/{MAX_IMAGES}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading || isFull}
          aria-label={
            isFull ? `이미지는 최대 ${MAX_IMAGES}장까지 첨부할 수 있어요` : "결과물 이미지 추가"
          }
          className={cn(
            TILE,
            "flex items-center justify-center bg-bg-secondary text-text-secondary transition-colors hover:bg-bg-disabled focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-bg-secondary",
          )}
        >
          {isUploading ? <Spinner className="h-6 w-20" /> : <PlusIcon className="size-6" />}
        </button>

        {value.map((image, index) => (
          <div key={image.imageId} className={cn(TILE, "group relative")}>
            {image.previewUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element -- 로컬 objectURL 미리보기 */
              <img
                src={image.previewUrl}
                alt={`결과물 이미지 ${index + 1}`}
                className="pointer-events-none absolute inset-0 size-full rounded-md border border-stroke-primary object-cover"
              />
            ) : (
              /* 임시저장에서 복원한 이미지 — 응답에 조회용 URL 이 없어 자리표시만 둔다(요청서 U-1) */
              <div className="absolute inset-0 flex items-center justify-center rounded-md border border-stroke-primary bg-bg-secondary text-text-disabled">
                <ImageIcon className="size-6" />
              </div>
            )}

            {/* 진행 상태 — 완료된 이미지에는 아무것도 덮지 않는다 */}
            {STATUS_LABEL[image.status] ? (
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center rounded-md text-caption-1 text-text-on-brand",
                  image.status === "failed" ? "bg-red-500/70" : "bg-dim",
                )}
              >
                {STATUS_LABEL[image.status]}
              </div>
            ) : null}

            {/*
              sm~ : 호버 시에만 딤 + 중앙 휴지통 즉시 노출(transition 없음).
              mobile: 호버가 없으므로 딤 없이 우상단 삭제 버튼을 상시 노출(이미지를 가리지 않게).
            */}
            <div className="absolute inset-0 flex items-start justify-end rounded-md p-1 sm:items-center sm:justify-center sm:bg-dim sm:p-0 sm:opacity-0 sm:group-hover:opacity-100">
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label={`결과물 이미지 ${index + 1} 삭제`}
                className="flex size-7 items-center justify-center rounded-full bg-dim text-text-on-brand focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:size-9 sm:rounded-md sm:bg-transparent"
              >
                <Trash2Icon className="size-4 sm:size-6" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {message ? <span className="text-body-3 text-red-500">{message}</span> : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        hidden
        onChange={(e) => {
          void addFiles(e.target.files);
          // 같은 파일 재선택 허용(값 초기화)
          e.target.value = "";
        }}
      />
    </div>
  );
}

export { OutputImageUploader };

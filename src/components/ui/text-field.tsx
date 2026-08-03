"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Text Field 컴포지트 (Figma Text Input 228:527).
 *
 * 구조: [Title(gap 8)] → [필드 + (선택)등록 버튼] → [카운터 or 캡션(gap 4)].
 * - 하단 캡션은 error/success 상태에서만 노출(색상 대응). 그 외엔 글자수 카운터.
 * - `submitLabel`(등록) 은 기본 off — 넘기면 필드 내부 우측에 텍스트 버튼 노출(댓글창 등).
 * - bare `Input`/`Textarea` 프리미티브는 그대로 두고, 라벨·카운터·인라인 버튼이
 *   필요한 폼에서 이 컴포지트를 쓴다.
 */
type TextFieldState = "default" | "error" | "success";

type TextFieldProps = Omit<React.ComponentProps<"input">, "size"> & {
  /** 상단 타이틀(Title 1) */
  title?: string;
  /** 필수 표기(*) */
  required?: boolean;
  /** 글자수 카운터 표시(분모). 지정 시 `현재/max` 노출 */
  maxLength?: number;
  /** 필드 내부 우측 텍스트 버튼 라벨(예: "등록"). 없으면 미표시(기본 off) */
  submitLabel?: string;
  /** submitLabel 버튼 클릭 */
  onSubmit?: () => void;
  /** 하단 캡션(error/success 상태에서 노출) */
  caption?: string;
  /** 시각 상태 */
  state?: TextFieldState;
};

function TextField({
  className,
  title,
  required,
  maxLength,
  submitLabel,
  onSubmit,
  caption,
  state = "default",
  value,
  defaultValue,
  onChange,
  disabled,
  ...props
}: TextFieldProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(String(defaultValue ?? ""));
  const text = isControlled ? String(value ?? "") : internal;
  const count = [...text].length;

  const showCounter = maxLength !== undefined && state === "default";
  const showCaption = Boolean(caption) && state !== "default";

  const borderByState =
    state === "error"
      ? "border-red-500"
      : state === "success"
        ? "border-[#005eeb]" // 성공 전용 파랑 — 시맨틱 토큰 없음(Input 과 동일 규칙)
        : "border-stroke-disabled hover:border-stroke-strong focus-within:border-stroke-strong";

  return (
    <div data-slot="text-field" className={cn("flex w-full flex-col gap-2", className)}>
      {title ? (
        <div className="flex items-center gap-1 text-title-1">
          <span className="text-text-primary">{title}</span>
          {required ? <span className="text-text-secondary">*</span> : null}
        </div>
      ) : null}

      <div className="flex w-full flex-col gap-1">
        <div
          data-disabled={disabled ? "" : undefined}
          className={cn(
            "flex h-12 items-center gap-3 rounded-md border bg-bg-primary px-4 transition-colors",
            "focus-within:shadow-[0px_4px_8px_rgba(35,35,33,0.13)]",
            borderByState,
            disabled && "pointer-events-none bg-bg-disabled",
          )}
        >
          <input
            data-slot="text-field-input"
            aria-invalid={state === "error" || undefined}
            value={value}
            defaultValue={defaultValue}
            disabled={disabled}
            maxLength={maxLength}
            onChange={(e) => {
              if (!isControlled) setInternal(e.target.value);
              onChange?.(e);
            }}
            className={cn(
              "h-full w-full min-w-0 border-0 bg-transparent text-body-1 outline-none",
              "text-text-primary placeholder:text-text-disabled disabled:cursor-not-allowed disabled:text-text-disabled",
            )}
            {...props}
          />
          {submitLabel ? (
            <button
              type="button"
              onClick={onSubmit}
              disabled={disabled}
              className="shrink-0 text-body-3 text-text-brand disabled:text-text-disabled"
            >
              {submitLabel}
            </button>
          ) : null}
        </div>

        {showCounter ? (
          <span className="self-end text-body-3 text-text-secondary">
            {count}/{maxLength}
          </span>
        ) : null}
        {showCaption ? (
          <span
            className={cn("text-body-3", state === "error" ? "text-red-500" : "text-[#005eeb]")}
          >
            {caption}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export { TextField };
export type { TextFieldProps };

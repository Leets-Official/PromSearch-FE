"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";

import { cn } from "@/lib/utils";
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react";

const Select = SelectPrimitive.Root;

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  );
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("flex flex-1 text-left", className)}
      {...props}
    />
  );
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default";
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        // 레이아웃/형태: Figma Dropdown 트리거 — Radius/md(8) → rounded-md,
        // 가로 패딩 Spacing/xl(16) → px-4, Body 1(16/24) 타이포, bg-bg-primary
        "flex w-full items-center justify-between gap-2 rounded-md border bg-bg-primary px-4 text-body-1 whitespace-nowrap transition-colors outline-none select-none",
        // 사이즈: default=48(시안), sm=36 (가로 패딩만 소폭 축소)
        "data-[size=default]:h-12 data-[size=sm]:h-9 data-[size=sm]:px-3",
        // default 상태: 테두리 stroke-disabled(#adaca7)
        "border-stroke-disabled",
        // hover 상태: 테두리 stroke-strong(#000)
        "hover:border-stroke-strong",
        // active(열림) 상태: base-ui data-popup-open — 테두리 강조 + 드롭섀도(Interaction effect)
        "data-popup-open:border-stroke-strong data-popup-open:shadow-md",
        // 값/placeholder 텍스트 색: 값=text-primary(기본), placeholder=text-disabled
        "text-text-primary data-placeholder:text-text-disabled",
        // 포커스 링(기존 컴포넌트 공통 패턴)
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        // 비활성: stroke-disabled 유지 + 상호작용 차단
        "disabled:cursor-not-allowed disabled:opacity-50",
        // 오류(aria-invalid) 상태
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        // select-value 내부 정렬
        "*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5",
        // 아이콘 기본 처리
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
        className,
      )}
      {...props}
    >
      {children}
      {/* 화살표 아이콘: 트리거 텍스트 색을 상속(currentColor) → 미선택/placeholder 시 함께 흐려짐.
          열림 시 base-ui가 data-popup-open을 부여 → 위로 회전 */}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="pointer-events-none size-5 shrink-0 text-current transition-transform data-popup-open:rotate-180" />
        }
      />
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            "relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className,
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("px-1.5 py-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  checkbox = false,
  ...props
}: SelectPrimitive.Item.Props & {
  /** 좌측 체크박스형(멀티 셀렉트 필터). Figma Dropdown/Option Item 1174:4660 */
  checkbox?: boolean;
}) {
  if (checkbox) {
    return (
      <SelectPrimitive.Item
        data-slot="select-item"
        className={cn(
          // Figma: h-48, px-16, gap-12, Body 1(16/28), 선택 상태와 무관하게 텍스트 primary
          "relative flex h-12 w-full cursor-default items-center gap-3 px-4 text-body-1 text-text-primary outline-hidden select-none",
          "focus:bg-bg-secondary data-disabled:pointer-events-none data-disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {/* 좌측 체크박스 — 기본은 브랜드 테두리 빈 상자, 선택 시 브랜드 채움 + 흰 체크 */}
        <span className="relative flex size-5 shrink-0 items-center justify-center rounded-[4px] border border-stroke-brand">
          <SelectPrimitive.ItemIndicator
            render={
              <span className="absolute inset-[-1px] flex items-center justify-center rounded-[4px] bg-stroke-brand text-text-on-brand" />
            }
          >
            <CheckIcon className="size-4" />
          </SelectPrimitive.ItemIndicator>
        </span>
        <SelectPrimitive.ItemText className="flex-1 whitespace-nowrap">
          {children}
        </SelectPrimitive.ItemText>
      </SelectPrimitive.Item>
    );
  }

  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
        }
      >
        <CheckIcon className="pointer-events-none" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};

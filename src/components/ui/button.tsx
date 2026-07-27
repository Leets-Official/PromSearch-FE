import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * 색상은 디자인 시스템 Interaction 시맨틱 토큰을 따릅니다.
 * - brand   : default red-500 → hover red-400 → pressed red-600 → disabled gray-200
 * - neutral : default gray-200 → hover white → pressed gray-300 → selected(aria-pressed) red-400/25%
 * - ghost   : brand 강조(테두리+브랜드 텍스트). Figma Button/Brand type=ghost 대응.
 *
 * 크기(size)는 Figma 시안(48/36px)에 맞춰 조정했습니다.
 * - Figma radius/md(8px) = rounded-md, gap/타이포/패딩 모두 Component Spacing 토큰 기준.
 * - lg     → Figma size=48 (CTA): h-48, px-16, gap-8, Title 2(16px)
 * - default→ 48/36 사이 중간 사이즈(h-40)
 * - sm     → Figma size=36: h-36, px-12, gap-6, Title 3(14px)
 * - icon   → Figma Button/Icon 44x44 (아이콘 24px + 패딩 10px), 정사각
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        // solid 브랜드: 기본 red-500, hover 시 상승 그림자(Figma Interaction drop-shadow)
        brand:
          "bg-interaction-brand text-text-on-brand shadow-none hover:bg-interaction-brand-hover hover:shadow-[0_4px_8px_rgb(35_35_33/0.13)] active:bg-interaction-brand-pressed disabled:bg-interaction-brand-disabled disabled:text-text-disabled disabled:shadow-none",
        neutral:
          "bg-interaction-neutral text-text-primary shadow-none hover:bg-interaction-neutral-hover hover:shadow-[0_4px_8px_rgb(35_35_33/0.13)] active:bg-interaction-neutral-pressed aria-pressed:bg-interaction-neutral-selected disabled:bg-interaction-neutral-disabled disabled:text-text-disabled disabled:shadow-none",
        // ghost(Brand ghost): 흰 배경 + 브랜드 테두리/텍스트, pressed 시 브랜드 tint 배경
        ghost:
          "border-stroke-brand bg-bg-primary text-text-brand hover:border-interaction-brand-hover hover:shadow-[0_4px_8px_rgb(35_35_33/0.13)] active:border-interaction-brand-pressed active:bg-brand-tint aria-expanded:bg-bg-secondary disabled:border-stroke-disabled disabled:bg-bg-disabled disabled:text-text-disabled disabled:shadow-none",
        // plain(Button/Icon·툴바·닫기): 투명 배경 + 회색 hover, 테두리 없음
        plain:
          "text-text-primary hover:bg-bg-secondary active:bg-bg-secondary aria-expanded:bg-bg-secondary disabled:text-text-disabled",
        outline:
          "border-input bg-bg-elevated text-text-primary hover:bg-bg-secondary aria-expanded:bg-bg-secondary disabled:text-text-disabled",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 disabled:text-text-disabled",
        link: "text-text-brand underline-offset-4 hover:underline disabled:text-text-disabled",
      },
      size: {
        // Figma size=48 CTA: h-48, px-16(xl), gap-8(md), Title 1(Bold 16/20), 아이콘 24px (2026.07 라벨 Title 2→1)
        lg: "h-12 gap-2 px-4 text-title-1 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-6",
        // 48/36 사이 중간 사이즈
        default:
          "h-10 gap-2 px-3.5 text-title-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        // Figma size=36: h-36, px-12(lg), gap-6(sm), Title 3(14px), 아이콘 20px
        sm: "h-9 gap-1.5 px-3 text-title-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        // 더 작은 유틸 사이즈(그룹/툴바용) — 기존 사용처 유지
        xs: "h-6 gap-1 rounded-sm px-2 text-caption-1 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        // Figma Button/Icon: 44x44 정사각(아이콘 24 + 패딩 10)
        icon: "size-11 [&_svg:not([class*='size-'])]:size-6",
        "icon-xs":
          "size-6 rounded-sm in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-9 in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-5",
        "icon-lg": "size-12 [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "brand",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "brand",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

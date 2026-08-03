import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badge = 디자이너 시안의 "Tag" 컴포넌트.
 * Figma Tag(심볼 209:3680) 기준 정렬:
 * - 높이 28(h-7), radius 4px(rounded-sm 대신 시안 정확값 rounded-[4px])
 * - 패딩 좌우 8(px-2) / 상하 6(py-1.5)  ← Spacing/Component md·sm
 * - 타이포 Caption 1(text-caption-1: 12/16, semibold)
 * - 기본색: 배경 brand-tint(red-500/10%) + 글자 text-brand
 * 기존 variant(default/secondary/destructive/outline/ghost/link)는 유지하되,
 * default를 Tag 시안에 맞춘다.
 */
const badgeVariants = cva(
  "group/badge inline-flex h-7 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[4px] border border-transparent px-2 py-1.5 text-caption-1 whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        // Tag 시안 기본형: 브랜드 틴트 배경 + 브랜드 텍스트
        default: "bg-brand-tint text-text-brand [a]:hover:bg-brand-tint/80",
        secondary: "bg-bg-secondary text-text-secondary [a]:hover:bg-bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 [a]:hover:bg-destructive/20",
        outline: "border-stroke-primary text-text-primary [a]:hover:bg-bg-secondary",
        ghost: "text-text-primary hover:bg-bg-secondary",
        link: "text-text-brand underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };

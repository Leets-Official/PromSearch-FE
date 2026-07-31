import { Button as ButtonPrimitive } from "@base-ui/react/button";

import { cn } from "@/lib/utils";

/**
 * 콘텐츠 액션 바 — Figma Button/Contents Action(1006:2286, 144x40).
 *
 * 이미지/썸네일 **위에 얹는** 액션 버튼 묶음이라 배경이 Opacity/dim(#23232199) 이고
 * 아이콘은 Stroke/on-brand(흰색)다. 버튼 40x40, radius/md(8px), 버튼 간 gap 12px.
 * (일반 배경 위에서 쓰는 아이콘 버튼은 Button size="icon" variant="plain" 을 쓸 것)
 */

function ContentsActionBar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="contents-action-bar"
      className={cn("inline-flex items-center gap-3", className)}
      {...props}
    />
  );
}

type ContentsActionProps = ButtonPrimitive.Props & {
  /** 아이콘 전용 버튼이라 접근성 라벨 필수 */
  "aria-label": string;
};

function ContentsAction({ className, ...props }: ContentsActionProps) {
  return (
    <ButtonPrimitive
      data-slot="contents-action"
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-dim text-text-on-brand transition-[filter] outline-none select-none",
        "hover:brightness-125 active:brightness-90",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:size-6 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

export { ContentsActionBar, ContentsAction };
export type { ContentsActionProps };

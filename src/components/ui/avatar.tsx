import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * 원형 프로필 아바타. base-ui `Avatar` primitive 사용.
 * - Figma Profile(223:154): 44x44 원형(radius/full).
 * - size prop 으로 가변: sm(36) / md(44, 기본) / lg(72, Card/Profile 시안) / xl(80, Profile 시안 1315:6084).
 * - 이미지 로드 실패/미지정 시 fallback(이니셜/아이콘) 노출.
 */
const avatarVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-bg-secondary align-middle select-none",
  {
    variants: {
      size: {
        sm: "size-9", // 36px
        md: "size-11", // 44px — Figma Profile 기본
        lg: "size-18", // 72px — Card/Profile 시안
        xl: "size-20", // 80px — Profile(1315:6084) 시안
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

function Avatar({
  className,
  size = "md",
  ...props
}: AvatarPrimitive.Root.Props & VariantProps<typeof avatarVariants>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(avatarVariants({ size }), className)}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      // object-cover 로 비율 유지, 원형 크롭
      className={cn("size-full object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({ className, ...props }: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      // 이미지 없을 때 배경 + 보조 텍스트 색상. 아이콘/이니셜 모두 수용.
      className={cn(
        "flex size-full items-center justify-center bg-bg-secondary text-title-3 text-text-secondary [&_svg]:size-1/2",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback, avatarVariants };

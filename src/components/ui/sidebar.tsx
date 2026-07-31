import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * 사이드바 네비게이션.
 *
 * Figma "Side bar/Menu" 시안 기준:
 * - 메뉴 아이템: gap 8px, py 12px, radius 8px(rounded-md), 폭은 컨테이너(200px) 100% 채움.
 * - state=default  : text-primary(주 항목) / text-secondary(하위 항목), Title 1(600)
 * - state=pressed  : bg-bg-secondary(#f2f2f2)
 * - state=selected : bg-brand-tint + text-brand + bold 강조
 *
 * type=home / type=mypage 는 메뉴 "구성 예시"일 뿐이므로 하드코딩하지 않고
 * Sidebar > SidebarMenu > SidebarMenuItem 을 children 으로 조립하도록 설계.
 */

// 사이드바 최상위 컨테이너 — 세로 스택, 폭 200px 기본
function Sidebar({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav data-slot="sidebar" className={cn("flex w-50 flex-col gap-3", className)} {...props} />
  );
}

// 메뉴 그룹(리스트). 그룹 내부는 아이템 간 gap 4px
function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn("flex w-full list-none flex-col gap-1", className)}
      {...props}
    />
  );
}

// 그룹 라벨(예: "직군별") — 클릭 불가능한 섹션 제목
function SidebarGroupLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-label"
      className={cn("flex w-full items-center px-3 py-3 text-title-1 text-text-primary", className)}
      {...props}
    />
  );
}

const sidebarMenuItemVariants = cva(
  // 공통: 가로 배치 + 아이콘/라벨 간격, radius, 상태 전환. 아이콘 크기 통일.
  // 시안: 선택 시 배경 없음 — 텍스트 색만 brand(빨강)로. 항목은 px 없이 플러시 정렬.
  "group/sidebar-item flex w-full cursor-pointer items-center gap-2 rounded-md border border-transparent bg-transparent py-3 text-left whitespace-nowrap outline-none transition-colors select-none hover:bg-bg-secondary focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:text-text-disabled data-selected:text-text-brand [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      // 시안: md(주 항목: 홈/인기/직군별 = Title 1·text-primary) / sm(하위 항목: 학생~ = Title 2·text-secondary)
      // px-3: hover 배경이 텍스트에 붙지 않도록 여백 확보(그룹라벨도 동일 px 로 정렬)
      // 모바일(Side bar/Menu(Mobile) 1206:3230)은 라벨만 14px 로 줄어든다(구조·여백 동일).
      // md: 14/20 Bold → 16/20 Bold, sm: 14/20 SemiBold → 16/20 SemiBold
      size: {
        md: "px-3 text-title-3 font-bold text-text-primary sm:text-title-1 [&_svg:not([class*='size-'])]:size-5",
        sm: "px-3 text-title-3 text-text-secondary sm:text-title-2 [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

type SidebarMenuItemProps = useRender.ComponentProps<"button"> &
  VariantProps<typeof sidebarMenuItemVariants> & {
    // 현재 활성(선택) 상태 — data-selected 로 노출되어 시안의 selected 스타일 적용
    active?: boolean;
  };

/**
 * 메뉴 아이템.
 * - 기본은 <button> 렌더. Next.js <Link> 와 함께 쓰려면 render 로 교체:
 *   <SidebarMenuItem render={<Link href="/popular" />}>인기 프롬프트</SidebarMenuItem>
 * - active 로 selected 상태 제어.
 */
function SidebarMenuItem({
  className,
  size = "md",
  active,
  render,
  ...props
}: SidebarMenuItemProps) {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        className: cn(sidebarMenuItemVariants({ size }), className),
        // active 를 data 속성 + aria-current 로 매핑 (시안 selected 스타일 트리거)
        // Tailwind v4 는 data-selected: 를 [data-selected="true"] 로 컴파일하므로 값은 반드시 "true".
        ...(active ? { "data-selected": "true" } : {}),
        "aria-current": active ? ("page" as const) : undefined,
      },
      props,
    ),
    render,
    state: {
      slot: "sidebar-menu-item",
      size,
      selected: active,
    },
  });
}

export { Sidebar, SidebarMenu, SidebarGroupLabel, SidebarMenuItem, sidebarMenuItemVariants };

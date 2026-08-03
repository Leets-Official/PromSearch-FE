"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Sidebar, SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

const ITEMS = [
  { href: "/mypage", label: "프로필" },
  { href: "/mypage/bookmarks", label: "북마크" },
  { href: "/mypage/revenue", label: "수익" },
  { href: "/mypage/settings", label: "설정" },
] as const;

// 프로필 하위(편집·게시글 전체)에서도 "프로필"이 선택 상태를 유지하도록 매핑
const PROFILE_PATHS = ["/mypage", "/mypage/edit", "/mypage/posts"];

/** 마이페이지 좌측 네비게이션 (프로필/북마크/수익/설정) */
export function MyPageSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/mypage"
      ? PROFILE_PATHS.includes(pathname)
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Sidebar>
      <SidebarMenu>
        {ITEMS.map((item) => (
          <SidebarMenuItem
            key={item.href}
            active={isActive(item.href)}
            render={<Link href={item.href} />}
          >
            {item.label}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </Sidebar>
  );
}

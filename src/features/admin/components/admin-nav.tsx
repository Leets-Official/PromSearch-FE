"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";

import { Sidebar, SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { ADMIN_NAV_ITEMS } from "@/features/admin/constants";
import { cn } from "@/lib/utils";

/**
 * 어드민 사이드바 (시안 Side bar 551:3673).
 * 항목 4개(신고 게시글/신고 댓글/유저 등급/어드민 계정)를 폭 200px 세로 스택으로 배치하고,
 * 현재 경로에 해당하는 항목을 selected(브랜드 색)로 표시한다.
 *
 * 모바일/태블릿(lg 미만)에는 사이드바 시안이 없어 {@link AdminNavMobile} 로
 * 콘텐츠 상단의 가로 스크롤 메뉴로 대체한다(항목 라벨은 줄바꿈 없이 유지).
 */

/** 현재 경로가 해당 메뉴에 속하는지 — 하위 경로도 활성으로 본다 */
function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** 마우스 클릭 후 포커스 링이 남지 않도록(키보드 이동은 유지) — CategoryNav 와 동일 규칙 */
function blurOnMouseClick(e: MouseEvent<HTMLElement>) {
  if (e.detail !== 0) e.currentTarget.blur();
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <Sidebar aria-label="어드민 메뉴">
      <SidebarMenu>
        {ADMIN_NAV_ITEMS.map((item) => (
          <SidebarMenuItem
            key={item.href}
            active={isActivePath(pathname, item.href)}
            onClick={blurOnMouseClick}
            render={<Link href={item.href} />}
          >
            {item.label}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </Sidebar>
  );
}

/**
 * 좁은 폭(lg 미만)용 가로 메뉴. 사이드바 자리를 대신하며 화면이 좁아지면 가로로만 스크롤된다
 * (라벨은 `whitespace-nowrap` 이라 세로로 길어지지 않는다).
 */
export function AdminNavMobile({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="어드민 메뉴"
      className={cn(
        // 좌우 여백 밖까지 스크롤되도록 음수 마진으로 컨테이너 패딩을 상쇄
        "-mx-4 overflow-x-auto border-b border-stroke-primary px-4 sm:-mx-20 sm:px-20",
        className,
      )}
    >
      <ul className="flex w-max list-none items-center gap-1">
        {ADMIN_NAV_ITEMS.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={blurOnMouseClick}
                className={cn(
                  "block rounded-md px-3 py-3 text-title-3 whitespace-nowrap transition-colors outline-none",
                  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                  active ? "text-text-brand" : "text-text-primary hover:bg-bg-secondary",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

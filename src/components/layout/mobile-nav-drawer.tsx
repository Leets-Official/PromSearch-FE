"use client";

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { UserIcon, XIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/hooks/use-auth-status";

/**
 * 모바일 네비게이션 드로어 — Figma "홈 - 햄버거 메뉴(사이드바)"(1382:6016 / 1382:6022).
 *
 * 데스크톱에서 좌측에 상주하는 사이드바를, 모바일(lg 미만)에서는 헤더 햄버거로 여는 드로어로 제공한다.
 * 시안 스펙:
 * - 백드롭: Opacity/dim
 * - 패널  : 좌측 고정, 폭 284px, Background/primary, padding 16/12, 세로 gap 16
 * - 구성  : [닫기 X 24px] → [프로필 40px + 이름/로그인(Heading 2)] → [메뉴]
 *
 * 백드롭·프로필·닫기는 공통이고, 메뉴 내용만 children 으로 주입받는다.
 * (갤러리는 <CategoryNav/>, 마이페이지는 <MyPageSidebar/> 를 넘긴다 — 단일 드로어 재사용)
 * 시안의 드로어는 항목이 패널 여백에 플러시 정렬되고 폭을 꽉 채우므로,
 * 데스크톱용 좌우 패딩(px-3)·고정폭(w-50)만 아래 래퍼에서 무력화한다.
 */
type MobileNavDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAuthenticated: boolean;
  user: AuthUser | null;
  /** 비회원 프로필 영역 클릭 → 상위에서 로그인 모달을 연다 */
  onLoginClick?: () => void;
  /** 드로어에 표시할 메뉴 (데스크톱 사이드바와 동일 컴포넌트를 넘긴다) */
  children: ReactNode;
};

export function MobileNavDrawer({
  open,
  onOpenChange,
  isAuthenticated,
  user,
  onLoginClick,
  children,
}: MobileNavDrawerProps) {
  return (
    <DrawerPrimitive.Root open={open} onOpenChange={onOpenChange} swipeDirection="left">
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Backdrop
          data-slot="mobile-nav-backdrop"
          // 스와이프 중에는 진행도에 맞춰 딤이 옅어진다(--drawer-swipe-progress)
          className="fixed inset-0 z-50 bg-dim opacity-[calc(1-var(--drawer-swipe-progress))] transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0"
        />
        <DrawerPrimitive.Viewport className="fixed inset-0 z-50 flex items-stretch justify-start">
          <DrawerPrimitive.Popup
            data-slot="mobile-nav-drawer"
            // 메뉴 항목을 눌러 이동하면 드로어를 닫는다(SPA 네비라 언마운트되지 않으므로 명시적으로)
            onClick={(event) => {
              if ((event.target as HTMLElement).closest("a")) onOpenChange(false);
            }}
            className="flex h-full w-71 max-w-[85vw] [transform:translateX(var(--drawer-swipe-movement-x))] flex-col gap-4 overflow-y-auto overscroll-contain bg-bg-primary px-4 py-3 transition-transform duration-200 ease-out outline-none data-ending-style:[transform:translateX(-100%)] data-starting-style:[transform:translateX(-100%)] data-swiping:select-none"
          >
            <DrawerPrimitive.Title className="sr-only">메뉴</DrawerPrimitive.Title>

            <DrawerPrimitive.Content className="flex flex-col gap-4">
              {/* 닫기 — 시안은 24px 아이콘이 패널 여백(16px)에 플러시. 36px 버튼을 음수마진으로 정렬 */}
              <div className="flex items-center">
                <DrawerPrimitive.Close
                  render={<Button variant="plain" size="icon-sm" className="-ml-1.5" />}
                  aria-label="메뉴 닫기"
                >
                  <XIcon />
                </DrawerPrimitive.Close>
              </div>

              {/* 프로필 — 회원이면 이름, 비회원이면 "로그인"(클릭 시 로그인 모달) */}
              <button
                type="button"
                className="flex items-center gap-2 rounded-md text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                onClick={() => {
                  if (!isAuthenticated) {
                    onOpenChange(false);
                    onLoginClick?.();
                  }
                }}
              >
                <Avatar size="sm" className="size-10 border border-stroke-primary">
                  {user?.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
                  <AvatarFallback>
                    {user ? (
                      user.name.charAt(0)
                    ) : (
                      <UserIcon className="size-6 text-text-disabled" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0 truncate text-heading-2 text-text-primary">
                  {isAuthenticated && user ? user.name : "로그인"}
                </span>
              </button>

              {/* 메뉴 — 주입된 사이드바. 드로어에서는 플러시 정렬 + 폭 100% */}
              <div className="[&_[data-slot=sidebar-group-label]]:px-0 [&_[data-slot=sidebar-menu-item]]:px-0 [&_[data-slot=sidebar]]:w-full">
                {children}
              </div>
            </DrawerPrimitive.Content>
          </DrawerPrimitive.Popup>
        </DrawerPrimitive.Viewport>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
}

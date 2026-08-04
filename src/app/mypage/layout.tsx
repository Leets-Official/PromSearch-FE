import type { ReactNode } from "react";

import { MyPageTopBar } from "@/features/mypage/components/mypage-top-bar";
import { MyPageSidebar } from "@/features/mypage/components/mypage-sidebar";
import { MobileBackHeader } from "@/components/layout/mobile-back-header";

export const dynamic = "force-dynamic";

/**
 * 마이페이지 레이아웃 — 3구간 반응형.
 * - lg+     : 앱 헤더 + 좌측 사이드바
 * - sm~lg   : 앱 헤더 + 햄버거(사이드바 자리 대체)
 * - sm 미만 : 뒤로가기 헤더 + (프로필 메인의 메뉴 리스트가 네비 역할)
 */
export default function MyPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg-primary">
      <div className="mx-auto flex w-full max-w-7xl flex-col">
        {/* 웹(sm+): 앱 헤더 (햄버거는 헤더 내부에서 lg 미만일 때 노출) */}
        <div className="hidden sm:block">
          <MyPageTopBar />
        </div>
        {/* 모바일(sm 미만): 뒤로가기 헤더 */}
        <div className="sm:hidden">
          <MobileBackHeader />
        </div>

        <div className="flex gap-8 px-4 py-6 sm:px-20 sm:py-8">
          {/* 사이드바: lg+ 에서만. sm~lg 구간은 헤더 햄버거가 대신 */}
          <aside className="hidden shrink-0 lg:block">
            <MyPageSidebar />
          </aside>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}

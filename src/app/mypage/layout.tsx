import type { ReactNode } from "react";

import { GalleryTopBar } from "@/features/gallery/components/gallery-top-bar";
import { MyPageSidebar } from "@/features/mypage/components/mypage-sidebar";

// (main) 셸과 동일 이유로 동적 렌더링 (헤더 내부 검색/필터가 useSearchParams 사용 시)
export const dynamic = "force-dynamic";

/**
 * 마이페이지 셸 — (main) 과 동일한 헤더를 쓰되 사이드바만 MyPageSidebar 로 교체.
 * 폭·여백(max-w-7xl / px-20 / gap-8)은 (main) 레이아웃과 맞춰 정렬을 통일한다.
 */
export default function MyPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg-primary">
      <div className="mx-auto flex w-full max-w-7xl flex-col">
        <GalleryTopBar />
        <div className="flex gap-8 px-20 py-8">
          <aside className="hidden shrink-0 lg:block">
            <MyPageSidebar />
          </aside>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}

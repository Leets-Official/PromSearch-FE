import type { ReactNode } from "react";

import { CategoryNav } from "@/features/gallery/components/category-nav";
import { GalleryTopBar } from "@/features/gallery/components/gallery-top-bar";

// URL 필터(nuqs useSearchParams) + 클라이언트 데이터 페칭에 의존하는 세그먼트라 동적 렌더링.
// (정적 프리렌더 시 useSearchParams 가 Suspense 경계를 요구하는 문제 회피)
export const dynamic = "force-dynamic";

/**
 * (main) 공용 셸 — 헤더 + 사이드바 + 본문.
 *
 * 레이아웃 폭: 디자이너 기준 1280px 고정 컨테이너를 중앙 정렬하고, 그보다 넓은 해상도는
 * 좌우를 배경색 여백으로 흘린다.
 * 홈/상세/마이 등이 이 셸을 공유한다. 루트(/) 랜딩은 이 그룹 밖이라 셸이 적용되지 않는다.
 *
 * 사이드바는 lg 미만에서 숨고, 대신 헤더 햄버거 → MobileNavDrawer 로 접근한다.
 * (GalleryTopBar 의 햄버거도 `lg:hidden` 이라 두 구간이 정확히 맞물린다)
 */
export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg-primary">
      <div className="mx-auto flex w-full max-w-7xl flex-col">
        <GalleryTopBar />
        {/* 여백: 모바일 16px(시안 375 → 콘텐츠 343), 데스크톱 80px.
            헤더(GalleryTopBar)와 동일하게 맞춰 사이드바/콘텐츠가 로고/검색과 정렬된다. */}
        <div className="flex gap-8 px-4 py-4 sm:px-20 sm:py-8">
          <aside className="hidden shrink-0 lg:block">
            <CategoryNav />
          </aside>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}

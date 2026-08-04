import type { ReactNode } from "react";

import { AdminGuard } from "@/features/admin/components/admin-guard";
import { AdminHeader } from "@/features/admin/components/admin-header";
import { AdminNav, AdminNavMobile } from "@/features/admin/components/admin-nav";

// 목록 필터(nuqs useSearchParams) + 클라이언트 데이터 페칭에 의존하는 세그먼트라 동적 렌더링.
export const dynamic = "force-dynamic";

/**
 * 어드민 셸 — 헤더 + 사이드바 + 본문 (시안 551:3669 wrapper).
 *
 * 레이아웃 폭/여백은 `(main)` 셸과 동일 규칙(1280 컨테이너 중앙 정렬, 좌우 80px·모바일 16px)이라
 * 서비스 화면과 어드민 화면을 오가도 로고/콘텐츠 정렬이 흔들리지 않는다.
 * 다만 사이드바 메뉴와 헤더 구성이 달라 `(main)` 을 재사용하지 않고 별도 셸로 둔다.
 *
 * 좁은 폭(lg 미만)에는 사이드바 시안이 없어 가로 메뉴(AdminNavMobile)로 대체한다.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg-primary">
      <div className="mx-auto flex w-full max-w-7xl flex-col">
        <AdminHeader />

        <div className="flex flex-col gap-4 px-4 py-4 sm:px-20 sm:py-8">
          <AdminNavMobile className="lg:hidden" />

          <div className="flex gap-8">
            <aside className="hidden shrink-0 lg:block">
              <AdminNav />
            </aside>
            {/* min-w-0: 표가 넘칠 때 컨테이너가 밀리지 않고 표 내부에서 가로 스크롤되도록 */}
            <main className="min-w-0 flex-1">
              <AdminGuard>{children}</AdminGuard>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

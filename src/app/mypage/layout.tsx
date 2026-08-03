import type { ReactNode } from "react";

import { MyPageTopBar } from "@/features/mypage/components/mypage-top-bar";
import { MyPageSidebar } from "@/features/mypage/components/mypage-sidebar";

export const dynamic = "force-dynamic";

export default function MyPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg-primary">
      <div className="mx-auto flex w-full max-w-7xl flex-col">
        <MyPageTopBar />
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

"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";

import { getQueryClient } from "@/lib/query-client";
import { MswProvider } from "@/mocks/msw-provider";
import { ToastProvider } from "@/components/ui/toast";

// 앱 전역 클라이언트 프로바이더 (TanStack Query, nuqs 등).
// 클라이언트 상태가 필요한 Provider는 여기에 모은다.
export default function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {/* 어드민만 아직 목이다(BE 연동은 PS-70). NEXT_PUBLIC_API_MOCKING=enabled 일 때만 켜진다. */}
      <MswProvider>
        {/* 토스트는 어느 화면에서든 띄울 수 있어야 하므로 전역에 하나만 둔다 */}
        <ToastProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
        </ToastProvider>
      </MswProvider>
      {/* ReactQueryDevtools 제거 — 좌하단 플로팅 버튼이 모바일 업로드 FAB(우하단)·
          상세 플로팅 액션과 겹쳐 실기기 확인을 방해했다. 필요하면 일시적으로만 되살릴 것. */}
    </QueryClientProvider>
  );
}

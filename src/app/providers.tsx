"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { getQueryClient } from "@/lib/query-client";
import { MswProvider } from "@/mocks/MswProvider";
import { DevPreviewProvider } from "@/components/dev-toolbar/dev-preview-context";
import { DevToolbar } from "@/components/dev-toolbar/DevToolbar";
import { DEV_PREVIEW_DEFAULT, type DevPreview } from "@/lib/dev-preview";

// 앱 전역 클라이언트 프로바이더 (TanStack Query, nuqs 등).
// 클라이언트 상태가 필요한 Provider는 여기에 모은다.
export default function Providers({
  children,
  // 서버(루트 레이아웃)가 쿠키에서 읽어 내려주는 dev 프리뷰 초기값(SSR/CSR 일치 시드).
  initialDevPreview = DEV_PREVIEW_DEFAULT,
}: {
  children: ReactNode;
  initialDevPreview?: DevPreview;
}) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <DevPreviewProvider initialPreview={initialDevPreview}>
        {/* BE 스펙 확정 전 dev 에서 MSW 목 워커 시작(NEXT_PUBLIC_API_MOCKING=enabled) */}
        <MswProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
        </MswProvider>
        <DevToolbar />
      </DevPreviewProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import PromptDetailPage from "./page";

let mockId = "1";
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: mockId }),
  // 모바일 헤더(MobilePageHeader)의 뒤로가기
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));
vi.mock("@/analytics/track", () => ({ track: vi.fn() }));
vi.mock("@/hooks/use-auth-status", () => ({
  useAuthStatus: () => ({ status: "authenticated", isAuthenticated: true, user: null }),
}));

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const NuqsWrapper = withNuqsTestingAdapter({ searchParams: "" });
  return render(<PromptDetailPage />, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>
        <NuqsWrapper>{children}</NuqsWrapper>
      </QueryClientProvider>
    ),
  });
}

describe("PromptDetailPage", () => {
  it("존재하는 id → 상세를 렌더한다", async () => {
    mockId = "1"; // 목 시드 1번 = ACTIVE
    renderPage();

    await waitFor(() => expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument());
  });

  it("없는/비공개 id → 404 안내", async () => {
    mockId = "5"; // 시드상 hidden → 404
    renderPage();

    await waitFor(() => expect(screen.getByText("프롬프트를 찾을 수 없어요")).toBeInTheDocument());
  });
});

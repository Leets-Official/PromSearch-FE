import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { server } from "@/mocks/server";

import PromptDetailPage from "./page";

/** 상세 응답 1건 — 목이 없으므로 테스트가 직접 세운다. */
function detailEnvelope() {
  return HttpResponse.json({
    success: true,
    code: "COMMON-200",
    message: "성공했습니다.",
    result: {
      promptId: 1,
      title: "프롬프트 제목",
      author: { userId: 12, nickname: "작성자", profileImageUrl: null },
      outputType: "TEXT",
      contentType: "FREE",
      pricePoint: 0,
      promptBody: "전문",
      description: "설명",
      access: { locked: false, reason: "FREE" },
      viewerInteraction: { liked: false, bookmarked: false },
      images: [{ imageId: "a", imageUrl: "https://cdn/1.jpg", sortOrder: 0, thumbnail: true }],
      tags: [],
      statistics: { viewCount: 1, copyCount: 0, commentCount: 0, likeCount: 0 },
      customAiModel: null,
      createdAt: "2026-07-23T10:30:00+09:00",
      updatedAt: "2026-07-23T10:30:00+09:00",
    },
  });
}

function notFoundEnvelope() {
  return HttpResponse.json(
    { success: false, code: "COMMON-404", message: "요청한 리소스를 찾을 수 없습니다." },
    { status: 404 },
  );
}

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
    mockId = "1";
    server.use(http.get("/api/v1/prompts/:id", () => detailEnvelope()));
    renderPage();

    await waitFor(() => expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument());
  });

  it("없는/비공개 id → 404 안내", async () => {
    mockId = "5";
    server.use(http.get("/api/v1/prompts/:id", () => notFoundEnvelope()));
    renderPage();

    await waitFor(() => expect(screen.getByText("프롬프트를 찾을 수 없어요")).toBeInTheDocument());
  });
});

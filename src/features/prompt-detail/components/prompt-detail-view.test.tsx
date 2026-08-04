import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { track } from "@/analytics/track";
import { PromptDetailView } from "@/features/prompt-detail/components/prompt-detail-view";
import { makeDetail } from "@/features/prompt-detail/test-fixtures";

vi.mock("@/analytics/track", () => ({ track: vi.fn() }));
// 모바일 헤더(MobilePageHeader)의 뒤로가기
vi.mock("next/navigation", () => ({ useRouter: () => ({ back: vi.fn(), push: vi.fn() }) }));
vi.mock("@/hooks/use-auth-status", () => ({
  useAuthStatus: () => ({ status: "authenticated", isAuthenticated: true, user: null }),
}));

beforeEach(() => vi.clearAllMocks());

function renderView(detail = makeDetail(), searchParams = "") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const NuqsWrapper = withNuqsTestingAdapter({ searchParams });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <NuqsWrapper>{children}</NuqsWrapper>
    </QueryClientProvider>
  );
  return render(<PromptDetailView detail={detail} />, { wrapper });
}

describe("PromptDetailView", () => {
  it("진입 시 prompt_view 를 1회 발송한다", () => {
    renderView(makeDetail({ id: "prompt-001", tier: "premium" }));

    expect(track).toHaveBeenCalledWith("prompt_view", {
      prompt_id: "prompt-001",
      user_status: "authenticated",
      tier: "premium",
      source: "detail",
    });
  });

  it("기본 탭(설명)에서 설명 본문을 보여준다", () => {
    renderView(makeDetail({ descriptionBody: "설명 본문 텍스트" }));
    expect(screen.getByText("설명 본문 텍스트")).toBeInTheDocument();
  });

  it("레시피 탭으로 전환하면 열람 상태에서 복사하기가 보인다", async () => {
    const user = userEvent.setup();
    renderView(makeDetail({ access: { locked: false, reason: null }, recipeBody: "전문" }));

    await user.click(screen.getByRole("tab", { name: "레시피" }));
    expect(screen.getByRole("button", { name: /복사하기/ })).toBeInTheDocument();
  });

  it("복사하기(탭 행) 클릭 → 클립보드 복사 + prompt_copy_click 발송", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn();
    renderView(
      makeDetail({
        id: "prompt-001",
        access: { locked: false, reason: null },
        recipeBody: "복사될 전문",
      }),
      "?tab=recipe",
    );
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });

    await user.click(screen.getByRole("button", { name: /복사하기/ }));

    expect(writeText).toHaveBeenCalledWith("복사될 전문");
    expect(track).toHaveBeenCalledWith("prompt_copy_click", {
      prompt_id: "prompt-001",
      user_status: "authenticated",
      source: "detail",
    });
  });

  it("?tab=recipe 초기 URL 이면 레시피 탭이 활성이다", () => {
    renderView(
      makeDetail({ access: { locked: true, reason: "anonymous" }, recipeBody: "" }),
      "?tab=recipe",
    );
    expect(screen.getByRole("button", { name: /로그인하고 프롬프트 보기/ })).toBeInTheDocument();
  });
});

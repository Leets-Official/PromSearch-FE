import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import type { UserStatus } from "@/analytics/events";
import { PromptNotFoundError } from "@/features/prompt-detail/api/prompt-detail";
import { promptDetailKey, usePromptDetail } from "@/features/prompt-detail/hooks/use-prompt-detail";

// useAuthStatus 를 제어 가능한 값으로 모킹 — 뷰어 상태별 잠금을 검증
let mockStatus: UserStatus = "authenticated";
vi.mock("@/hooks/use-auth-status", () => ({
  useAuthStatus: () => ({
    status: mockStatus,
    isAuthenticated: mockStatus === "authenticated",
    user: null,
  }),
}));

function wrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "TestWrapper";
  return Wrapper;
}

describe("promptDetailKey", () => {
  it("뷰어 상태를 키에 포함한다(로그인 전환 시 리페치)", () => {
    expect(promptDetailKey("prompt-001", "anonymous")).toEqual([
      "prompt",
      "prompt-001",
      "anonymous",
    ]);
    expect(promptDetailKey("prompt-001", "authenticated")).not.toEqual(
      promptDetailKey("prompt-001", "anonymous"),
    );
  });
});

describe("usePromptDetail (MSW 목 연동)", () => {
  it("로그인 + free → 잠금 해제 상세를 받는다", async () => {
    mockStatus = "authenticated";
    const { result } = renderHook(() => usePromptDetail("prompt-001"), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data!.access).toEqual({ locked: false, reason: null });
    expect(result.current.data!.recipeBody.length).toBeGreaterThan(0);
  });

  it("비로그인 → anonymous 잠금 상세(전문 미전송)", async () => {
    mockStatus = "anonymous";
    const { result } = renderHook(() => usePromptDetail("prompt-001"), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data!.access).toEqual({ locked: true, reason: "anonymous" });
    expect(result.current.data!.recipeBody).toBe("");
  });

  it("없는/비공개 id → PromptNotFoundError, 재시도 없음", async () => {
    mockStatus = "authenticated";
    const { result } = renderHook(() => usePromptDetail("prompt-005"), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(PromptNotFoundError);
  });
});

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import type { UserStatus } from "@/analytics/events";
import { PromptNotFoundError } from "@/features/prompt-detail/api/prompt-detail";
import { promptDetailKey, usePromptDetail } from "@/features/prompt-detail/hooks/use-prompt-detail";
import { server } from "@/mocks/server";

// useAuthStatus 를 제어 가능한 값으로 모킹 — 쿼리 키가 뷰어 상태를 타는지 확인한다.
// (실제 잠금 판정은 서버가 하고, 그 매핑은 api/prompt-detail.test.ts 가 검증한다)
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

function detailEnvelope() {
  return HttpResponse.json({
    success: true,
    code: "COMMON-200",
    message: "성공했습니다.",
    result: {
      promptId: 1,
      title: "프롬프트",
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

describe("promptDetailKey", () => {
  it("뷰어 상태를 키에 포함한다(로그인 전환 시 리페치)", () => {
    expect(promptDetailKey("1", "anonymous")).toEqual(["prompt", "1", "anonymous"]);
    expect(promptDetailKey("1", "authenticated")).not.toEqual(promptDetailKey("1", "anonymous"));
  });
});

describe("usePromptDetail", () => {
  it("상세를 받아 도메인 모양으로 노출한다", async () => {
    mockStatus = "authenticated";
    server.use(http.get("/api/v1/prompts/:id", () => detailEnvelope()));

    const { result } = renderHook(() => usePromptDetail("1"), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data!.id).toBe("1");
    expect(result.current.data!.access).toEqual({ locked: false, reason: null });
  });

  it("없는/비공개 id → PromptNotFoundError, 재시도 없음", async () => {
    mockStatus = "authenticated";
    let calls = 0;
    server.use(
      http.get("/api/v1/prompts/:id", () => {
        calls += 1;
        return HttpResponse.json(
          { success: false, code: "COMMON-404", message: "요청한 리소스를 찾을 수 없습니다." },
          { status: 404 },
        );
      }),
    );

    const { result } = renderHook(() => usePromptDetail("999"), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(PromptNotFoundError);
    expect(calls).toBe(1);
  });
});

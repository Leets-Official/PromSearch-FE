import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { delay, http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { useLikePrompt } from "@/features/prompt-detail/hooks/use-like-prompt";
import { promptDetailKey } from "@/features/prompt-detail/hooks/use-prompt-detail";
import { makeDetail } from "@/features/prompt-detail/test-fixtures";
import type { PromptDetail } from "@/features/prompt-detail/types";
import { server } from "@/mocks/server";

const KEY = promptDetailKey("1", "authenticated");

function seedDetail(client: QueryClient, liked = false, likes = 10) {
  client.setQueryData<PromptDetail>(
    KEY,
    makeDetail({ liked, stats: { views: 0, copies: 0, likes } }),
  );
}

function setup(liked = false, likes = 10) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  seedDetail(client, liked, likes);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const view = renderHook(() => useLikePrompt("1"), { wrapper });
  return { client, ...view };
}

const current = (client: QueryClient) => client.getQueryData<PromptDetail>(KEY)!;

describe("useLikePrompt", () => {
  it("클릭 즉시 낙관적으로 liked/카운트를 뒤집는다(서버 응답 전)", async () => {
    // 서버 응답을 무한 지연 → onSuccess 가 낙관적 값을 덮지 않게 해 순수 낙관 상태를 관찰
    server.use(
      http.post("/api/v1/prompts/:id/likes", async () => {
        await delay("infinite");
        return HttpResponse.json({
          success: true,
          code: "COMMON-200",
          message: "성공했습니다.",
          result: { promptId: 1, liked: true, likeCount: 11 },
        });
      }),
    );
    const { client, result } = setup(false, 10);

    result.current.mutate(false);

    await waitFor(() => expect(current(client).liked).toBe(true));
    expect(current(client).stats.likes).toBe(11);
  });

  it("서버 실패 시 이전 스냅샷으로 롤백한다", async () => {
    server.use(
      http.post("/api/v1/prompts/:id/likes", () => new HttpResponse(null, { status: 500 })),
    );
    const { client, result } = setup(false, 10);

    result.current.mutate(false);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(current(client).liked).toBe(false);
    expect(current(client).stats.likes).toBe(10);
  });
});

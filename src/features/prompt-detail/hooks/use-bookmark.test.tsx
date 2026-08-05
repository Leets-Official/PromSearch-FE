import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { delay, http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { useBookmark } from "@/features/prompt-detail/hooks/use-bookmark";
import { promptDetailKey } from "@/features/prompt-detail/hooks/use-prompt-detail";
import { makeDetail } from "@/features/prompt-detail/test-fixtures";
import type { PromptDetail } from "@/features/prompt-detail/types";
import { server } from "@/mocks/server";

const KEY = promptDetailKey("1", "authenticated");

function setup(bookmarked = false) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData<PromptDetail>(KEY, makeDetail({ bookmarked }));
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const view = renderHook(() => useBookmark("1"), { wrapper });
  return { client, ...view };
}

const current = (client: QueryClient) => client.getQueryData<PromptDetail>(KEY)!;

describe("useBookmark", () => {
  it("클릭 즉시 낙관적으로 bookmarked 를 뒤집는다(서버 응답 전)", async () => {
    server.use(
      http.post("/api/v1/prompts/:id/bookmarks", async () => {
        await delay("infinite");
        return HttpResponse.json({
          success: true,
          code: "COMMON-200",
          message: "성공",
          result: { bookmarked: true, bookmarkedAt: null },
        });
      }),
    );
    const { client, result } = setup(false);

    result.current.mutate(false);

    await waitFor(() => expect(current(client).bookmarked).toBe(true));
  });

  it("서버 실패 시 이전 상태로 롤백한다", async () => {
    server.use(
      http.post("/api/v1/prompts/:id/bookmarks", () => new HttpResponse(null, { status: 500 })),
    );
    const { client, result } = setup(false);

    result.current.mutate(false);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(current(client).bookmarked).toBe(false);
  });
});

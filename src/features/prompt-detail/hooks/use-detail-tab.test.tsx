import { act, renderHook, waitFor } from "@testing-library/react";
import { withNuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";

import { useDetailTab } from "@/features/prompt-detail/hooks/use-detail-tab";

function renderTab(initialSearchParams = "") {
  const onUrlUpdate = vi.fn<(e: UrlUpdateEvent) => void>();
  const view = renderHook(() => useDetailTab(), {
    wrapper: withNuqsTestingAdapter({ searchParams: initialSearchParams, onUrlUpdate }),
  });
  return { ...view, onUrlUpdate };
}

function lastParams(onUrlUpdate: ReturnType<typeof vi.fn>): URLSearchParams {
  const calls = onUrlUpdate.mock.calls;
  return (calls[calls.length - 1][0] as UrlUpdateEvent).searchParams;
}

describe("useDetailTab", () => {
  it("기본값은 description(빈 쿼리)", () => {
    const { result } = renderTab();
    expect(result.current.tab).toBe("description");
  });

  it("URL ?tab 값을 반영한다", () => {
    expect(renderTab("?tab=recipe").result.current.tab).toBe("recipe");
    expect(renderTab("?tab=comments").result.current.tab).toBe("comments");
  });

  it("잘못된 tab 값은 기본값(description)으로 폴백한다", () => {
    expect(renderTab("?tab=nope").result.current.tab).toBe("description");
  });

  it("setTab 은 URL ?tab 에 반영된다", async () => {
    const { result, onUrlUpdate } = renderTab();

    act(() => result.current.setTab("recipe"));

    await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
    expect(lastParams(onUrlUpdate).get("tab")).toBe("recipe");
  });
});

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { resetCardImpressionSessionForTest, useCardImpression } from "@/hooks/use-card-impression";
import { track } from "@/analytics/track";

vi.mock("@/analytics/track", () => ({
  track: vi.fn(),
}));

type ObserverEntry = Pick<
  IntersectionObserverEntry,
  "intersectionRatio" | "isIntersecting" | "target"
>;

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  readonly callback: IntersectionObserverCallback;
  readonly disconnect = vi.fn();
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  trigger(entry: ObserverEntry) {
    this.callback([entry as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
}

describe("useCardImpression", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(track).mockClear();
    resetCardImpressionSessionForTest();
    MockIntersectionObserver.instances = [];
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("0.9초만 보이면 card_impression 을 보내지 않는다", () => {
    const target = document.createElement("article");
    const { result } = renderHook(() =>
      useCardImpression({
        cardId: "card-1",
        position: 1,
        userStatus: "anonymous",
      }),
    );

    act(() => result.current(target));
    act(() => {
      MockIntersectionObserver.instances[0].trigger({
        intersectionRatio: 0.5,
        isIntersecting: true,
        target,
      });
      vi.advanceTimersByTime(900);
    });

    expect(track).not.toHaveBeenCalled();
  });

  it("1초 이상 50% 노출되면 card_impression 을 1회 보낸다", () => {
    const target = document.createElement("article");
    const { result } = renderHook(() =>
      useCardImpression({
        cardId: "card-1",
        position: 1,
        source: "home",
        userStatus: "anonymous",
      }),
    );

    act(() => result.current(target));
    act(() => {
      MockIntersectionObserver.instances[0].trigger({
        intersectionRatio: 0.5,
        isIntersecting: true,
        target,
      });
      vi.advanceTimersByTime(1000);
    });

    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith("card_impression", {
      card_id: "card-1",
      position: 1,
      source: "home",
      user_status: "anonymous",
    });
  });

  it("보이는 중 1초 전에 벗어나면 타이머를 취소한다", () => {
    const target = document.createElement("article");
    const { result } = renderHook(() =>
      useCardImpression({
        cardId: "card-1",
        position: 1,
        userStatus: "authenticated",
      }),
    );

    act(() => result.current(target));
    act(() => {
      MockIntersectionObserver.instances[0].trigger({
        intersectionRatio: 0.6,
        isIntersecting: true,
        target,
      });
      vi.advanceTimersByTime(900);
      MockIntersectionObserver.instances[0].trigger({
        intersectionRatio: 0,
        isIntersecting: false,
        target,
      });
      vi.advanceTimersByTime(200);
    });

    expect(track).not.toHaveBeenCalled();
  });

  it("같은 세션에서 같은 카드는 한 번만 기록한다", () => {
    const target = document.createElement("article");
    const { result, rerender } = renderHook(() =>
      useCardImpression({
        cardId: "card-1",
        position: 1,
        userStatus: "anonymous",
      }),
    );

    act(() => result.current(target));
    act(() => {
      MockIntersectionObserver.instances[0].trigger({
        intersectionRatio: 0.6,
        isIntersecting: true,
        target,
      });
      vi.advanceTimersByTime(1000);
    });

    rerender();

    act(() => {
      MockIntersectionObserver.instances[0].trigger({
        intersectionRatio: 0.6,
        isIntersecting: true,
        target,
      });
      vi.advanceTimersByTime(1000);
    });

    expect(track).toHaveBeenCalledTimes(1);
  });
});

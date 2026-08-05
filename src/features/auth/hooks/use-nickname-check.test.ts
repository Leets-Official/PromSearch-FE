import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useNicknameCheck } from "@/features/auth/hooks/use-nickname-check";

describe("useNicknameCheck", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("초기 상태는 idle이다", () => {
    const checkNickname = vi.fn();
    const { result } = renderHook(() => useNicknameCheck({ checkNickname }));

    expect(result.current.status).toBe("idle");
  });

  it("닉네임을 지우면 즉시 idle로 돌아간다", async () => {
    const checkNickname = vi.fn().mockResolvedValue(true);
    const { result } = renderHook(() => useNicknameCheck({ checkNickname }));

    act(() => result.current.setNickname("길동"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(result.current.status).toBe("available");

    act(() => result.current.setNickname(""));
    expect(result.current.status).toBe("idle");
  });

  it("입력 직후(디바운스 대기 중)에는 checking 상태다", () => {
    const checkNickname = vi.fn().mockResolvedValue(true);
    const { result } = renderHook(() => useNicknameCheck({ checkNickname, debounceMs: 400 }));

    act(() => result.current.setNickname("길동"));

    expect(result.current.status).toBe("checking");
    expect(checkNickname).not.toHaveBeenCalled(); // 디바운스 전이라 아직 호출 안 됨
  });

  it("디바운스 이후 checkNickname이 호출되고, 사용 가능하면 available", async () => {
    const checkNickname = vi.fn().mockResolvedValue(true);
    const { result } = renderHook(() => useNicknameCheck({ checkNickname, debounceMs: 400 }));

    act(() => result.current.setNickname("길동"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(result.current.status).toBe("available");
    expect(checkNickname).toHaveBeenCalledWith("길동", expect.any(AbortSignal));
  });

  it("사용 불가능하면 taken 상태가 된다", async () => {
    const checkNickname = vi.fn().mockResolvedValue(false);
    const { result } = renderHook(() => useNicknameCheck({ checkNickname, debounceMs: 400 }));

    act(() => result.current.setNickname("관리자"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(result.current.status).toBe("taken");
  });

  it("checkNickname이 실패하면 idle로 되돌린다", async () => {
    const checkNickname = vi.fn().mockRejectedValue(new Error("network error"));
    const { result } = renderHook(() => useNicknameCheck({ checkNickname, debounceMs: 400 }));

    act(() => result.current.setNickname("길동"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(result.current.status).toBe("idle");
  });

  it("디바운스 중 다시 타이핑하면 이전 타이머가 취소되고 마지막 값만 확인한다", async () => {
    const checkNickname = vi.fn().mockResolvedValue(true);
    const { result } = renderHook(() => useNicknameCheck({ checkNickname, debounceMs: 400 }));

    act(() => result.current.setNickname("길"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200); // 디바운스 완료 전
    });
    act(() => result.current.setNickname("길동"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(result.current.status).toBe("available");
    expect(checkNickname).toHaveBeenCalledTimes(1);
    expect(checkNickname).toHaveBeenCalledWith("길동", expect.any(AbortSignal));
  });

  it("응답을 기다리는 동안(아직 오지 않음) 값을 바꾸면 옛 응답이 와도 최신 상태를 덮지 않는다", async () => {
    let resolveFirst: (value: boolean) => void = () => {};
    const firstPromise = new Promise<boolean>((resolve) => {
      resolveFirst = resolve;
    });
    const checkNickname = vi
      .fn()
      .mockImplementationOnce(() => firstPromise)
      .mockResolvedValueOnce(false);

    const { result } = renderHook(() => useNicknameCheck({ checkNickname, debounceMs: 400 }));

    act(() => result.current.setNickname("길동"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400); // 첫 요청 발사, 아직 응답 안 옴
    });

    act(() => result.current.setNickname("철수"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400); // 두 번째 요청 발사 및 완료
    });

    expect(result.current.status).toBe("taken"); // "철수" 결과

    // 이제 첫 번째("길동") 요청이 뒤늦게 응답해도 현재 표시("철수" 상태)를 덮지 않아야 한다
    await act(async () => {
      resolveFirst(true);
      await Promise.resolve();
    });

    expect(result.current.status).toBe("taken");
  });
});

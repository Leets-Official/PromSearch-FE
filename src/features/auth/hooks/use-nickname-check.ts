"use client";

import { useCallback, useEffect, useState } from "react";

export type NicknameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

const NICKNAME_PATTERN = /^[가-힣a-zA-Z0-9]{1,10}$/;

interface UseNicknameCheckOptions {
  checkNickname: (nickname: string, signal: AbortSignal) => Promise<boolean>;
  debounceMs?: number;
}

/** 닉네임 입력값 변경 시 디바운스 후 checkNickname 을 호출한다. 실제 API 호출은 주입받는다. */
export function useNicknameCheck({ checkNickname, debounceMs = 400 }: UseNicknameCheckOptions) {
  const [nickname, setNicknameState] = useState("");
  const [requestStatus, setRequestStatus] = useState<NicknameStatus>("idle");
  const [respondedNickname, setRespondedNickname] = useState<string | null>(null);

  const setNickname = useCallback((value: string) => {
    setNicknameState(value);
  }, []);

  const isValidNickname = NICKNAME_PATTERN.test(nickname);

  useEffect(() => {
    // 빈 값, 형식 오류는 API를 호출하지 않는다.
    if (!nickname || !isValidNickname) {
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const available = await checkNickname(nickname, controller.signal);
        if (controller.signal.aborted) return;

        setRespondedNickname(nickname);
        setRequestStatus(available ? "available" : "taken");
      } catch {
        if (controller.signal.aborted) return;

        setRespondedNickname(nickname);
        setRequestStatus("idle");
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [nickname, isValidNickname, checkNickname, debounceMs]);

  const status: NicknameStatus = !nickname
    ? "idle"
    : !isValidNickname
      ? "invalid"
      : respondedNickname !== nickname
        ? "checking"
        : requestStatus;

  return { nickname, setNickname, status };
}

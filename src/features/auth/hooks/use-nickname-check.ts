"use client";

import { useCallback, useEffect, useState } from "react";

export type NicknameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

interface UseNicknameCheckOptions {
  checkNickname: (nickname: string, signal: AbortSignal) => Promise<boolean>;
  debounceMs?: number;
}

/** 닉네임 입력값 변경 시 디바운스 후 checkNickname 을 호출한다. 실제 API 호출은 주입받는다. */
export function useNicknameCheck({ checkNickname, debounceMs = 400 }: UseNicknameCheckOptions) {
  const [nickname, setNicknameState] = useState("");
  // API 응답 결과만 저장한다("available"/"taken"/"idle" — 실패 시).
  const [requestStatus, setRequestStatus] = useState<NicknameStatus>("idle");
  // 가장 최근에 응답(성공/실패)을 받은 닉네임. 렌더 중 비교에 쓰이므로 ref 가 아닌 state로 관리한다
  // (ref.current 는 렌더 바디에서 읽을 수 없다 — react-hooks/refs).
  const [respondedNickname, setRespondedNickname] = useState<string | null>(null);

  const setNickname = useCallback((value: string) => {
    setNicknameState(value);
  }, []);

  useEffect(() => {
    // 빈 값이면 API 를 호출하지 않는다. 표시할 상태("idle")는 아래 파생값이 이미 처리한다.
    if (!nickname) return;

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
  }, [nickname, checkNickname, debounceMs]);

  // 렌더 중 파생:
  // - 입력값이 비어 있으면 항상 idle
  // - 아직 이 닉네임에 대한 응답을 받지 못했으면(디바운스 대기 중이거나 요청 진행 중) checking
  // - 응답을 받았으면 그 결과(available/taken/idle)
  const status: NicknameStatus = !nickname
    ? "idle"
    : respondedNickname !== nickname
      ? "checking"
      : requestStatus;

  return { nickname, setNickname, status };
}

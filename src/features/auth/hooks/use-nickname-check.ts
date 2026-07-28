"use client";

import { useEffect, useRef, useState } from "react";

export type NicknameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

const NICKNAME_MAX = 10;
const DEBOUNCE_MS = 300;

function isValidFormat(nickname: string) {
  const trimmed = nickname.trim();
  return trimmed.length > 0 && trimmed.length <= NICKNAME_MAX;
}

interface UseNicknameCheckOptions {
  checkNickname: (nickname: string, signal: AbortSignal) => Promise<boolean>;
}

/** API 호출 결과만 담는 상태. 어떤 닉네임에 대한 결과인지 함께 저장해 stale 방지 */
type CheckResult =
  | { phase: "idle" }
  | { phase: "checking"; nickname: string }
  | { phase: "done"; nickname: string; available: boolean };

export function useNicknameCheck({ checkNickname }: UseNicknameCheckOptions) {
  const [nickname, setNickname] = useState("");
  const [result, setResult] = useState<CheckResult>({ phase: "idle" });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();

    // 형식 미달이거나 빈 값이면 API 호출 안 함 (setState 없음 → cascading render 경고 해소)
    if (!isValidFormat(nickname)) return;

    const controller = new AbortController();
    abortRef.current = controller;

    // checking 표시는 콜백 안에서 (effect 본문의 동기 setState가 아님)
    const timer = setTimeout(async () => {
      setResult({ phase: "checking", nickname });
      try {
        const available = await checkNickname(nickname, controller.signal);
        if (!controller.signal.aborted) {
          setResult({ phase: "done", nickname, available });
        }
      } catch {
        if (!controller.signal.aborted) setResult({ phase: "idle" });
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [nickname, checkNickname]);

  // status는 렌더 중 파생값으로 계산 (effect에서 setState 하지 않음)
  const status = deriveStatus(nickname, result);

  return { nickname, setNickname, status };
}

/** nickname과 API 결과로부터 표시용 status 계산 */
function deriveStatus(nickname: string, result: CheckResult): NicknameStatus {
  if (nickname.length === 0) return "idle";
  if (!isValidFormat(nickname)) return "invalid";
  // 결과가 현재 입력값과 일치할 때만 유효 (입력이 바뀌면 이전 결과는 무시)
  if (result.phase === "done" && result.nickname === nickname) {
    return result.available ? "available" : "taken";
  }
  return "checking";
}

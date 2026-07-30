"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { SignUpForm, type SignUpValues } from "./signup-form";
import { useNicknameCheck } from "@/features/auth/hooks/use-nickname-check";

/** 회원가입 폼 컨테이너 — useNicknameCheck 연결 + 제출 처리 */
export function SignUpFormContainer() {
  const router = useRouter();

  const checkNickname = useCallback(async (nickname: string, signal: AbortSignal) => {
    await new Promise((r) => setTimeout(r, 300));
    if (signal.aborted) throw new Error("aborted");
    return nickname !== "관리자"; //
  }, []);

  const { setNickname, status } = useNicknameCheck({ checkNickname });

  const handleSubmit = (values: SignUpValues) => {
    // TODO: 회원가입 API 호출 후 성공 시 이동
    console.log("signup", values);
    // router.push("/home");
  };

  return (
    <SignUpForm nicknameStatus={status} onNicknameChange={setNickname} onSubmit={handleSubmit} />
  );
}

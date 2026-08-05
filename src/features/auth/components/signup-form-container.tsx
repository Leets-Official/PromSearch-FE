"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { SignUpForm, type SignUpValues } from "./signup-form";
import { useNicknameCheck } from "@/features/auth/hooks/use-nickname-check";

/** 회원가입 폼 컨테이너 — useNicknameCheck 연결 + 제출 처리 */
export function SignUpFormContainer() {
  const router = useRouter();

  const checkNickname = useCallback(async (nickname: string, signal: AbortSignal) => {
    // TODO: 실제 닉네임 중복확인 API 로 교체
    await new Promise((r) => setTimeout(r, 300));
    if (signal.aborted) throw new Error("aborted");
    return nickname !== "관리자"; // 목: "관리자"만 사용 불가로 처리
  }, []);

  const { setNickname, status } = useNicknameCheck({ checkNickname });

  const handleSubmit = (values: SignUpValues) => {
    // TODO: 회원가입 API 호출 후 성공 시 router.push("/home")
    console.log("signup", values);
  };

  return (
    <SignUpForm nicknameStatus={status} onNicknameChange={setNickname} onSubmit={handleSubmit} />
  );
}

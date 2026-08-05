"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { api, getErrorMessage } from "@/lib/api";
import { SignUpForm, type SignUpValues } from "./signup-form";
import { useNicknameCheck } from "@/features/auth/hooks/use-nickname-check";
import { useSignup } from "@/features/auth/hooks/use-signup";
import { toJobTagIds, toTaskTagIds } from "@/features/auth/lib/tag-mapping";
import { toAgreementsPayload } from "@/features/auth/lib/agreements";
import type { NicknameAvailabilityResponse } from "@/features/auth/api/types";

/** 회원가입 폼 컨테이너 — useNicknameCheck 연결 + 제출 처리 */
export function SignUpFormContainer() {
  const router = useRouter();

  // [USER-005] 닉네임 중복 확인
  const checkNickname = useCallback(async (nickname: string, signal: AbortSignal) => {
    const result = await api.get<NicknameAvailabilityResponse>("/users/nicknames/availability", {
      params: { nickname },
      signal,
    });
    return result.available;
  }, []);

  const { setNickname, status } = useNicknameCheck({ checkNickname });

  const {
    mutate: submitSignup,
    isPending,
    error,
  } = useSignup({
    onSuccess: () => router.push("/home"),
  });

  const handleSubmit = (values: SignUpValues) => {
    submitSignup({
      nickname: values.nickname,
      email: values.id,
      password: values.password,
      interestJobTagIds: toJobTagIds(values.jobs),
      interestTaskTagIds: toTaskTagIds(values.tasks),
      agreements: toAgreementsPayload(values.agreedTerms),
      // TODO: avatarFile → 프로필 이미지 업로드(USER-007~009, src/features/upload/api/image.ts)
      // 연동 후 presigned 업로드 결과를 profileImageUrl 로 채운다. 이번 범위에서는 미전송.
    });
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <SignUpForm nicknameStatus={status} onNicknameChange={setNickname} onSubmit={handleSubmit} />
      {isPending && (
        <p className="text-body-3 text-text-secondary" role="status">
          가입 처리 중입니다…
        </p>
      )}
      {error && (
        <p role="alert" className="text-body-3 text-text-brand">
          {getErrorMessage(error, "회원가입 중 오류가 발생했습니다.")}
        </p>
      )}
    </div>
  );
}

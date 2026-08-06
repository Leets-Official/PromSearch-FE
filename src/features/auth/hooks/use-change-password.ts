"use client";

import { useMutation } from "@tanstack/react-query";

import { isApiError } from "@/lib/api";
import { changeMyPassword, type ChangePasswordRequest } from "@/features/auth/api/profile";

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) => changeMyPassword(payload),
  });
}

/** 400(현재 비밀번호 불일치 등)을 폼 에러 메시지로 매핑 */
export function getChangePasswordErrorMessage(error: unknown): string {
  if (isApiError(error) && error.status === 400) {
    return "현재 비밀번호가 일치하지 않습니다.";
  }
  return "비밀번호 변경 중 오류가 발생했습니다.";
}

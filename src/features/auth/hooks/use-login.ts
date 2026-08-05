"use client";

import { useMutation } from "@tanstack/react-query";

import { isApiError } from "@/lib/api";
import { setTokens } from "@/lib/api/token-store";
import { login } from "@/features/auth/api/auth";
import type { LoginRequest, LoginResponse } from "@/features/auth/api/types";

interface UseLoginOptions {
  onSuccess?: (data: LoginResponse) => void;
}

export function useLogin({ onSuccess }: UseLoginOptions = {}) {
  return useMutation({
    mutationFn: (payload: LoginRequest) => login(payload),
    onSuccess: (data) => {
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      onSuccess?.(data);
    },
  });
}

/** ApiError → 로그인 폼용 에러 메시지 매핑 */
export function getLoginErrorMessage(error: unknown): string {
  if (isApiError(error) && error.status === 401) {
    return "아이디 또는 비밀번호가 일치하지 않습니다.";
  }
  return "로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
}

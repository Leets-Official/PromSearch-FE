"use client";

import { useMutation } from "@tanstack/react-query";

import { setTokens } from "@/lib/api/token-store";
import { signup, login } from "@/features/auth/api/auth";
import type { SignupRequest } from "@/features/auth/api/types";

interface UseSignupOptions {
  onSuccess?: () => void;
}

/** AUTH-001(회원가입)은 토큰을 주지 않으므로, 성공 후 동일 credential 로 로그인해 자동 로그인 처리 */
export function useSignup({ onSuccess }: UseSignupOptions = {}) {
  return useMutation({
    mutationFn: async (payload: SignupRequest) => {
      await signup(payload);
      return login({ email: payload.email, password: payload.password });
    },
    onSuccess: (data) => {
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      onSuccess?.();
    },
  });
}

"use client";

import { useMutation } from "@tanstack/react-query";

import { setTokens } from "@/lib/api/token-store";
import { oauthLogin } from "@/features/auth/api/auth";
import type { LoginResponse, OAuthProvider } from "@/features/auth/api/types";

interface UseOAuthLoginOptions {
  onSuccess?: (data: LoginResponse) => void;
}

/** OAuth 콜백 페이지에서 인가 코드를 받은 뒤 호출 */
export function useOAuthLogin({ onSuccess }: UseOAuthLoginOptions = {}) {
  return useMutation({
    mutationFn: ({
      provider,
      code,
      redirectUri,
    }: {
      provider: OAuthProvider;
      code: string;
      redirectUri: string;
    }) => oauthLogin(provider, { code, redirectUri }),
    onSuccess: (data) => {
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      onSuccess?.(data);
    },
  });
}

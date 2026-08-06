"use client";

import { useCallback } from "react";

import { buildOAuthAuthorizeUrl } from "@/features/auth/lib/oauth-config";
import type { OAuthProvider } from "@/features/auth/api/types";

/** SocialLoginButton onClick 에 그대로 연결 — 클릭 시 카카오/구글 로그인 화면으로 리다이렉트 */
export function useSocialLoginRedirect() {
  return useCallback((provider: OAuthProvider) => {
    window.location.href = buildOAuthAuthorizeUrl(provider);
  }, []);
}

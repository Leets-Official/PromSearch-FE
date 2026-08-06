"use client";

import { useMutation } from "@tanstack/react-query";

import { setTokens } from "@/lib/api/token-store";
import { signup, login } from "@/features/auth/api/auth";
import { updateMyProfile } from "@/features/auth/api/profile";
import { uploadProfileImage } from "@/features/profile-image/api/image";
import type { SignupRequest } from "@/features/auth/api/types";

interface SignupWithAvatar extends SignupRequest {
  avatarFile?: File | null;
}

interface UseSignupOptions {
  onSuccess?: () => void;
}

/**
 * AUTH-001(회원가입)은 토큰을 주지 않으므로, 성공 후 동일 credential 로 로그인해 자동 로그인 처리한다.
 * 프로필 이미지는 인증이 필요한 API(USER-007~008)라, 로그인이 끝난 뒤에만 업로드할 수 있다.
 * 이미지 업로드가 실패해도 가입 자체는 성공으로 처리한다(사진은 마이페이지에서 나중에도 바꿀 수 있음).
 */
export function useSignup({ onSuccess }: UseSignupOptions = {}) {
  return useMutation({
    mutationFn: async ({ avatarFile, ...payload }: SignupWithAvatar) => {
      await signup(payload);
      const loginResult = await login({ email: payload.email, password: payload.password });
      setTokens({ accessToken: loginResult.accessToken, refreshToken: loginResult.refreshToken });

      if (avatarFile) {
        try {
          const profileImageUrl = await uploadProfileImage(avatarFile);
          await updateMyProfile({ profileImageUrl });
        } catch {
          // 이미지 업로드 실패는 조용히 넘어간다 — 가입 자체는 성공으로 처리.
        }
      }

      return loginResult;
    },
    onSuccess: () => {
      onSuccess?.();
    },
  });
}

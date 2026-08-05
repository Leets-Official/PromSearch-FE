"use client";

import { useMutation } from "@tanstack/react-query";

import { updateMyProfile } from "@/features/auth/api/profile";
import { toJobTagIds, toTaskTagIds } from "@/features/auth/lib/tag-mapping";
import type { OnboardingResult } from "@/components/modals/onboarding/types";

/**
 * 온보딩 모달 완료 시 호출 (소셜 로그인 전용 — isNewUser=true 인 경우만).
 * NOTE: avatarFile 은 프로필 이미지 업로드(USER-007~009, src/features/upload/api/image.ts)가
 * 아직 없어 이번 범위에서 제외한다. 해당 API 붙으면 presigned 업로드 후 받은 URL을
 * profileImageUrl 로 채워 넣으면 된다.
 */
export function useOnboardingComplete() {
  return useMutation({
    mutationFn: (result: OnboardingResult) =>
      updateMyProfile({
        nickname: result.nickname,
        interestJobTagIds: toJobTagIds(result.jobs),
        interestTaskTagIds: toTaskTagIds(result.tasks),
      }),
  });
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { OnboardingModal } from "@/components/modals/onboarding/onboarding-modal";
import { useOAuthLogin } from "@/features/auth/hooks/use-oauth-login";
import { useOnboardingComplete } from "@/features/auth/hooks/use-onboarding-complete";
import { useNicknameCheck } from "@/features/auth/hooks/use-nickname-check";
import { getOAuthRedirectUri } from "@/features/auth/lib/oauth-config";
import { api } from "@/lib/api";
import type { NicknameAvailabilityResponse, OAuthProvider } from "@/features/auth/api/types";
import type { OnboardingResult } from "@/components/modals/onboarding/types";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const params = useParams<{ provider: OAuthProvider }>();
  const searchParams = useSearchParams();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // [USER-005] 닉네임 중복 확인 — 소셜에서 받은 기본 닉네임이 이미 사용 중일 수 있어 온보딩에서도 재확인
  const checkNickname = async (nickname: string, signal: AbortSignal) => {
    const result = await api.get<NicknameAvailabilityResponse>("/users/nicknames/availability", {
      params: { nickname },
      signal,
    });
    return result.available;
  };
  const { nickname, setNickname, status: nicknameStatus } = useNicknameCheck({ checkNickname });

  const { mutate: loginWithOAuth } = useOAuthLogin({
    onSuccess: (data) => {
      if (data.isNewUser) {
        setNickname(data.nickname); // 소셜에서 받은 기본 닉네임을 초기값으로
        setShowOnboarding(true);
      } else {
        router.replace("/");
      }
    },
  });

  const { mutate: completeOnboarding } = useOnboardingComplete();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;
    loginWithOAuth({
      provider: params.provider,
      code,
      redirectUri: getOAuthRedirectUri(params.provider),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnboardingComplete = (result: OnboardingResult) => {
    completeOnboarding(
      { ...result, nickname },
      {
        onSuccess: () => {
          setShowOnboarding(false);
          router.replace("/");
        },
      },
    );
  };

  return (
    <OnboardingModal
      open={showOnboarding}
      onOpenChange={setShowOnboarding}
      nicknameStatus={nicknameStatus}
      onNicknameChange={setNickname}
      onComplete={handleOnboardingComplete}
      onSkip={() => {
        setShowOnboarding(false);
        router.replace("/");
      }}
    />
  );
}

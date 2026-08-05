"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { OnboardingModal } from "@/components/modals/onboarding/onboarding-modal";
import { useOAuthLogin } from "@/features/auth/hooks/use-oauth-login";
import { useOnboardingComplete } from "@/features/auth/hooks/use-onboarding-complete";
import { useNicknameCheck } from "@/features/auth/hooks/use-nickname-check";
import { getOAuthRedirectUri } from "@/features/auth/lib/oauth-config";
import { checkNicknameAvailability } from "@/features/auth/api/profile";
import type { OAuthProvider } from "@/features/auth/api/types";
import type { OnboardingResult } from "@/components/modals/onboarding/types";

interface OAuthCallbackPageProps {
  /** [provider] 동적 라우트가 아닌 고정 경로(예: /auth/google/callback)에서는 직접 넘긴다 */
  provider?: OAuthProvider;
}

/**
 * OAuth 콜백 처리 공용 컴포넌트.
 * 카카오/구글이 인가 코드(code)를 붙여 돌려보내면 그 코드를 백엔드로 교환하고,
 * 신규 가입자(isNewUser=true)면 온보딩 모달을 띄운다.
 *
 * provider는 두 가지 방식으로 결정된다:
 * - [provider] 동적 라우트(예: /oauth/[provider]/callback, /login/oauth/[provider])에서는
 *   URL 파라미터로 자동 판별
 * - 고정 경로(예: /auth/google/callback)에서는 provider prop 으로 직접 지정
 */
export function OAuthCallbackPage({ provider: providerProp }: OAuthCallbackPageProps = {}) {
  const router = useRouter();
  const params = useParams<{ provider?: OAuthProvider }>();
  const provider = providerProp ?? params.provider;
  const searchParams = useSearchParams();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // [USER-005] 닉네임 중복 확인 — 소셜에서 받은 기본 닉네임이 이미 사용 중일 수 있어 온보딩에서도 재확인
  const {
    nickname,
    setNickname,
    status: nicknameStatus,
  } = useNicknameCheck({
    checkNickname: checkNicknameAvailability,
  });
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
    if (!code || !provider) return;
    loginWithOAuth({
      provider,
      code,
      redirectUri: getOAuthRedirectUri(provider),
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
      nickname={nickname}
      onNicknameChange={setNickname}
      onComplete={handleOnboardingComplete}
      onSkip={() => {
        setShowOnboarding(false);
        router.replace("/");
      }}
    />
  );
}

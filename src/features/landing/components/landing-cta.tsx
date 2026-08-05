"use client";

import { Logo } from "@/components/ui/logo";
import { SocialLoginButton } from "@/components/ui/social-login-button";
import { useSocialLoginRedirect } from "@/features/auth/hooks/use-social-login-redirect";

/**
 * 마지막 CTA (Figma 1637:11655) — gray-900 배경 + 세로 로고 + 2줄 카피 + 소셜 로그인 2종.
 * 시안의 Kakao/Google Login "square"(212x48, 라벨 포함) 형태를 쓴다.
 *
 * 시안이 확정되며 "지금 시작하기" 한 줄 헤드라인이 [로고 + 서비스 한 줄 소개]로 바뀌었다.
 */
export function LandingCta() {
  const redirectToOAuth = useSocialLoginRedirect();

  return (
    <section className="w-full bg-gray-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-4 py-15 sm:px-8 xl:px-20">
        {/* 시안 159x60(Logo/vertical 1971:6509) — 심볼 24px + 워드마크 119px 기본 크기 그대로 */}
        <Logo variant="vertical" />

        {/* 시안 24px SemiBold / 행간 24 / 자간 -0.005em. 좁은 화면에서는 18 → 24 로 키운다. */}
        <p className="flex flex-col gap-3 text-center text-[1.125rem]/[1.5] font-semibold tracking-[-0.005em] text-text-on-brand sm:text-[1.5rem]/[1.5]">
          <span>프롬프트를 찾고, 고르고, 활용하는 과정이 더 쉬워지도록.</span>
          <span>지금 바로 필요한 프롬프트를 찾아보세요.</span>
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <SocialLoginButton
            provider="kakao"
            shape="square"
            onClick={() => redirectToOAuth("kakao")}
          />
          <SocialLoginButton
            provider="google"
            shape="square"
            onClick={() => redirectToOAuth("google")}
          />
        </div>
      </div>
    </section>
  );
}

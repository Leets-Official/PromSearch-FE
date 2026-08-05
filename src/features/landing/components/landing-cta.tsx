"use client";

import { SocialLoginButton } from "@/components/ui/social-login-button";
import { useSocialLoginRedirect } from "@/features/auth/hooks/use-social-login-redirect";

/**
 * 마지막 CTA (Figma 1637:11655) — gray-900 배경 + "지금 시작하기" + 소셜 로그인 2종.
 * 시안의 Kakao/Google Login "square"(212x48, 라벨 포함) 형태를 쓴다.
 */
export function LandingCta() {
  const redirectToOAuth = useSocialLoginRedirect();

  return (
    <section className="w-full bg-gray-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-4 py-15 sm:px-8 xl:px-20">
        <h2 className="text-center text-[1.75rem]/[1] font-bold tracking-[-0.005em] text-text-on-brand sm:text-[2.5rem]/[1]">
          지금 시작하기
        </h2>
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

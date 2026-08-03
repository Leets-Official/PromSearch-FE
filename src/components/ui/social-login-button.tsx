import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

import { GoogleIcon, KakaoIcon } from "./brand-icons";

/**
 * 소셜 로그인 버튼 (Figma: Google Login / Kakao Login — 원형 아이콘 버전)
 *
 * 공통: 44px 원형(rounded-full), 아이콘 18px 단독 표시.
 * 색은 각 플랫폼의 고정 브랜드 색이라 시안 값을 그대로 임의값으로 사용합니다.
 * (디자인 토큰이 아닌 브랜드 컬러 — Google #f2f2f2, Kakao #fee500)
 * 텍스트가 없으므로 기존 문구는 aria-label로 제공합니다.
 */
const socialLoginButtonVariants = cva(
  "inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-transparent outline-none transition-[filter,box-shadow] select-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4.5 [&_svg]:shrink-0",
  {
    variants: {
      provider: {
        // Google: 연회색 원(#f2f2f2)
        google: "bg-[#f2f2f2] hover:brightness-95 focus-visible:border-ring",
        // Kakao: 카카오 옐로우 원(#fee500)
        // 로고는 단색(currentColor)이라 카카오 규정색인 검정을 명시
        kakao: "bg-[#fee500] text-black hover:brightness-95 focus-visible:border-[#fee500]",
      },
    },
    defaultVariants: {
      provider: "google",
    },
  },
);

type SocialLoginButtonProps = ButtonPrimitive.Props &
  Omit<VariantProps<typeof socialLoginButtonVariants>, "provider"> & {
    provider?: "google" | "kakao";
  };

/** provider별 로고 + 접근성 라벨 (아이콘 전용 버튼이라 텍스트 대신 aria-label 사용) */
const PROVIDER_META = {
  google: { icon: <GoogleIcon />, label: "구글로 시작하기" },
  kakao: { icon: <KakaoIcon />, label: "카카오로 시작하기" },
} as const;

function SocialLoginButton({
  className,
  provider = "google",
  "aria-label": ariaLabel,
  ...props
}: SocialLoginButtonProps) {
  const preset = PROVIDER_META[provider];
  return (
    <ButtonPrimitive
      data-slot="social-login-button"
      aria-label={ariaLabel ?? preset.label}
      className={cn(socialLoginButtonVariants({ provider, className }))}
      {...props}
    >
      {preset.icon}
    </ButtonPrimitive>
  );
}

export { SocialLoginButton, socialLoginButtonVariants };

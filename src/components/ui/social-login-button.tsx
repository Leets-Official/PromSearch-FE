import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

import { GoogleIcon, KakaoIcon } from "./brand-icons";

/**
 * 소셜 로그인 버튼 (Figma: Google/Kakao Login)
 *
 * 반응형:
 * - 모바일(기본): 가로 풀폭 + 라벨("구글로 시작하기") — 시안 로그인/온보딩 모바일
 * - sm+        : 44px 원형 + 아이콘 단독(라벨은 aria-label) — 데스크톱 로그인 모달
 *
 * 색은 플랫폼 고정 브랜드 색이라 시안 값을 임의값으로 사용(토큰 아님).
 * (Google #f2f2f2, Kakao #fee500)
 */
const socialLoginButtonVariants = cva(
  cn(
    // 공통
    "inline-flex shrink-0 items-center justify-center border border-transparent outline-none transition-[filter,box-shadow] select-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4.5 [&_svg]:shrink-0",
    // 모바일: 풀폭 pill + 라벨 (gap/패딩/타이포)
    "h-12 w-full gap-2 rounded-md px-4 text-title-3",
    // sm+: 원형 아이콘 단독 (라벨 숨김, 고정 44px)
    "sm:size-11 sm:w-11 sm:gap-0 sm:rounded-full sm:px-0",
  ),
  {
    variants: {
      provider: {
        google: "bg-[#f2f2f2] text-black hover:brightness-95 focus-visible:border-ring",
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
      {/* 라벨: 모바일만 노출, sm+ 에서는 숨김(원형 아이콘 버튼) */}
      <span className="sm:hidden">{preset.label}</span>
    </ButtonPrimitive>
  );
}

export { SocialLoginButton, socialLoginButtonVariants };

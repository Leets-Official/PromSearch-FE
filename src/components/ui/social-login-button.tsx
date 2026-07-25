import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

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
        kakao: "bg-[#fee500] hover:brightness-95 focus-visible:border-[#fee500]",
      },
    },
    defaultVariants: {
      provider: "google",
    },
  },
);

/** Google 멀티컬러 로고 (self-contained SVG) */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.583-5.036-3.71H.957v2.332A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A9 9 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A9 9 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58Z"
      />
    </svg>
  );
}

/** Kakao 말풍선 로고 (self-contained SVG) */
function KakaoIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path
        fill="#000000"
        d="M9 1.5C4.858 1.5 1.5 4.099 1.5 7.305c0 2.075 1.406 3.895 3.522 4.927-.155.556-.562 2.018-.643 2.331-.1.388.143.383.3.279.124-.082 1.964-1.334 2.76-1.876.343.05.697.076 1.061.076 4.142 0 7.5-2.599 7.5-5.804C16 4.099 13.142 1.5 9 1.5Z"
      />
    </svg>
  );
}

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

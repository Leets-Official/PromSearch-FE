import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

import { GoogleIcon, KakaoIcon } from "./brand-icons";

/**
 * 소셜 로그인 버튼 (Figma: Google Login / Kakao Login)
 *
 * 형태 두 가지:
 * - circle(기본, 로그인 모달) : 44px 원형, 아이콘 18px 단독 → 문구는 aria-label 로만 제공
 * - square(랜딩 CTA 1277:7729·1277:7730) : 212x48, radius 8, 아이콘 18px + 라벨(Title 2)
 *
 * 색은 각 플랫폼의 고정 브랜드 색이라 시안 값을 그대로 임의값으로 사용합니다.
 * (디자인 토큰이 아닌 브랜드 컬러 — Google #f2f2f2, Kakao #fee500)
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
      shape: {
        circle: "size-11 rounded-full",
        // 시안 212x48. 폭은 고정값으로 둔다 — w-full 로 두면 shrink-to-fit 부모 안에서
        // 퍼센트 폭이 자기 자신을 참조해 부모가 텍스트 폭으로만 잡히고 버튼이 한쪽으로 넘친다.
        square: "h-12 w-53 max-w-full gap-2 rounded-md px-3 text-title-2 text-text-primary",
      },
    },
    defaultVariants: {
      provider: "google",
      shape: "circle",
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
  shape = "circle",
  "aria-label": ariaLabel,
  ...props
}: SocialLoginButtonProps) {
  const preset = PROVIDER_META[provider];
  const isSquare = shape === "square";
  return (
    <ButtonPrimitive
      data-slot="social-login-button"
      // square 는 라벨이 보이므로 aria-label 로 중복 낭독하지 않는다
      aria-label={isSquare ? ariaLabel : (ariaLabel ?? preset.label)}
      className={cn(socialLoginButtonVariants({ provider, shape, className }))}
      {...props}
    >
      {preset.icon}
      {isSquare ? preset.label : null}
      {/* 라벨: 모바일만 노출, sm+ 에서는 숨김(원형 아이콘 버튼) */}
      <span className="sm:hidden">{preset.label}</span>
    </ButtonPrimitive>
  );
}

export { SocialLoginButton, socialLoginButtonVariants };

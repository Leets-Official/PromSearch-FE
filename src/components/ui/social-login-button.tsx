import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

import { GoogleIcon, KakaoIcon } from "./brand-icons";

/**
 * 소셜 로그인 버튼 (Figma: Google Login / Kakao Login)
 *
 * 형태 세 가지:
 * - circle(기본) : 44px 원형, 아이콘 18px 단독 → 문구는 aria-label 로만 제공
 * - square(랜딩 CTA 1277:7729·1277:7730) : 212x48, radius 8, 아이콘 18px + 라벨(Title 2)
 * - responsive(로그인 모달) : 모바일은 풀폭 사각형 + 라벨 노출, sm+ 는 44px 원형으로 전환
 *   (라벨은 항상 DOM에 존재하고 sm+ 에서만 sr-only 로 시각적으로 숨김)
 *
 * 색은 각 플랫폼의 고정 브랜드 색이라 시안 값을 그대로 임의값으로 사용합니다.
 * (디자인 토큰이 아닌 브랜드 컬러 — Google #f2f2f2, Kakao #fee500)
 */
const socialLoginButtonVariants = cva(
  "inline-flex shrink-0 items-center justify-center border border-transparent outline-none transition-[filter,box-shadow] select-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4.5 [&_svg]:shrink-0",
  {
    variants: {
      provider: {
        // Google: 연회색(#f2f2f2)
        google: "bg-[#f2f2f2] hover:brightness-95 focus-visible:border-ring",
        // Kakao: 카카오 옐로우(#fee500)
        // 로고는 단색(currentColor)이라 카카오 규정색인 검정을 명시
        kakao: "bg-[#fee500] text-black hover:brightness-95 focus-visible:border-[#fee500]",
      },
      shape: {
        circle: "size-11 rounded-full",
        // 시안 212x48. 폭은 고정값으로 둔다 — w-full 로 두면 shrink-to-fit 부모 안에서
        // 퍼센트 폭이 자기 자신을 참조해 부모가 텍스트 폭으로만 잡히고 버튼이 한쪽으로 넘친다.
        square: "h-12 w-53 max-w-full gap-2 rounded-md px-3 text-title-2 text-text-primary",
        // 모바일: 풀폭 사각형 + 라벨 / sm+: 44px 원형 (라벨은 sr-only 로 전환)
        responsive:
          "h-12 w-full gap-2 rounded-md px-3 text-title-2 text-text-primary sm:size-11 sm:w-11 sm:gap-0 sm:rounded-full sm:px-0",
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
  const isResponsive = shape === "responsive";
  // square·responsive 는 라벨이 텍스트로 보이므로(responsive 는 모바일에서만) aria-label 로 중복 낭독하지 않는다.
  // 라벨이 항상 안 보이는 circle 만 aria-label 로 접근성 이름을 제공한다.
  const showLabel = isSquare || isResponsive;

  return (
    <ButtonPrimitive
      data-slot="social-login-button"
      aria-label={showLabel ? ariaLabel : (ariaLabel ?? preset.label)}
      className={cn(socialLoginButtonVariants({ provider, shape, className }))}
      {...props}
    >
      {preset.icon}
      {isSquare && preset.label}
      {isResponsive && <span className="sm:sr-only">{preset.label}</span>}
    </ButtonPrimitive>
  );
}

export { SocialLoginButton, socialLoginButtonVariants };

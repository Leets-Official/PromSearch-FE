"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogPortal, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoSymbol } from "@/components/ui/logo";
import { SocialLoginButton } from "@/components/ui/social-login-button";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin?: (id: string, password: string) => void;
  onSignUp?: () => void;
  onGoogleLogin?: () => void;
  onKakaoLogin?: () => void;
}

/**
 * 로그인 모달 (Figma: Login Required Modal)
 *
 * 오버레이: DialogOverlay(bg-dim = --Opacity-dim)에 backdrop-blur 추가.
 *   → 이 모달(+온보딩)만 블러를 쓰므로 dialog.tsx는 수정하지 않고,
 *     여기서 Portal+Overlay+Popup을 직접 조립한다.
 * 카드: width 440px, padding 32px, gap 24px, radius 16px, bg-elevated + shadow.
 */
function LoginModal({
  open,
  onOpenChange,
  onLogin,
  onSignUp,
  onGoogleLogin,
  onKakaoLogin,
}: LoginModalProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const id = (form.elements.namedItem("id") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    onLogin?.(id, password);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        {/* 딤 + 블러 오버레이 (이 모달 전용) */}
        <DialogOverlay className="backdrop-blur-sm" />

        <DialogPrimitive.Popup
          data-slot="dialog-content"
          className={cn(
            "fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-4rem)] w-[440px]",
            "max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col items-center",
            "gap-4 overflow-y-auto overscroll-contain rounded-2xl bg-bg-elevated p-8",
            "shadow-[0_4px_8px_0_rgb(35_35_33/0.13)] outline-none",
            "duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
            "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          )}
        >
          {/* 닫기 버튼 */}
          <DialogPrimitive.Close
            render={
              <button
                type="button"
                aria-label="닫기"
                className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-md text-text-disabled transition-colors hover:text-text-secondary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <XIcon className="size-5" />
              </button>
            }
          />

          {/* 헤더: 로고 + 제목 + 설명 */}
          <div className="flex flex-col items-center gap-2 text-center">
            <LogoSymbol className="size-12 text-brand" />
            <DialogTitle className="!text-heading-1 text-text-primary">
              로그인이 필요해요
            </DialogTitle>
            <p className="text-body-3 text-text-secondary">
              멘트를 작성해야 합니다
              <br />
              로그인해야하는 이유를 설명하면 좋겠습니다
            </p>
          </div>

          {/* 입력 폼 */}
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
            <Input name="id" type="text" placeholder="아이디" autoComplete="username" />
            <Input
              name="password"
              type="password"
              placeholder="비밀번호"
              autoComplete="current-password"
            />
            <Button type="submit" variant="brand" size="lg" className="mt-2 w-full">
              로그인
            </Button>
          </form>

          {/* 회원가입 링크 */}
          <button
            type="button"
            onClick={onSignUp}
            className="rounded-sm text-title-3 text-text-brand hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            회원가입
          </button>

          {/* "또는" 구분선 */}
          <div className="flex w-full items-center gap-4">
            <span className="h-px flex-1 bg-stroke-primary" />
            <span className="text-caption-1 text-text-secondary">또는</span>
            <span className="h-px flex-1 bg-stroke-primary" />
          </div>

          {/* 소셜 로그인 (원형 아이콘) */}
          <div className="flex items-center justify-center gap-4">
            <SocialLoginButton provider="google" onClick={onGoogleLogin} />
            <SocialLoginButton provider="kakao" onClick={onKakaoLogin} />
          </div>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}

export { LoginModal };

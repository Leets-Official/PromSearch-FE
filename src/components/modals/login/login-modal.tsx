"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Dialog, DialogPortal, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoSymbol } from "@/components/ui/logo";
import { SocialLoginButton } from "@/components/ui/social-login-button";
import { validateEmail, validatePassword } from "@/features/auth/hooks/use-signup-validation";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin?: (id: string, password: string) => void;
  onSignUp?: () => void;
  onGoogleLogin?: () => void;
  onKakaoLogin?: () => void;
  error?: string | null;
}

/**
 * 로그인 모달 (Figma: Login Required Modal)
 *
 * 오버레이: DialogOverlay(bg-dim = --Opacity-dim)에 backdrop-blur 추가.
 *   → 이 모달(+온보딩)만 블러를 쓰므로 dialog.tsx는 수정하지 않고,
 *     여기서 Portal+Overlay+Popup을 직접 조립한다.
 * 카드: width 440px, padding 32px, gap 24px, radius 16px, bg-elevated + shadow.
 *
 * 검증: 제출 시점에 아이디(이메일 형식)·비밀번호(8~20자, 2종 조합)를 각각 검증하고,
 *   에러는 해당 인풋 바로 아래에 표시한다. 서버 에러(error prop)는 폼 하단에 별도 표시.
 */
function LoginModal({
  open,
  onOpenChange,
  onLogin,
  onSignUp,
  onGoogleLogin,
  onKakaoLogin,
  error,
}: LoginModalProps) {
  // 필드별 클라이언트 형식 에러(제출 시 검증)
  const [idError, setIdError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const id = (form.elements.namedItem("id") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    // 아이디·비밀번호를 각각 검증해 필드별 에러로 세팅 (둘 다 표시)
    const emailInvalid = validateEmail(id).status !== "valid";
    const pw = validatePassword(password);

    setIdError(emailInvalid ? "이메일 형식으로 입력해주세요." : null);
    setPasswordError(!pw.isValid ? (pw.message ?? "비밀번호 형식을 확인해주세요.") : null);

    // 하나라도 형식 오류면 제출 중단
    if (emailInvalid || !pw.isValid) return;

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
          {/* 헤더: 제목(앞) + 닫기(뒤) 한 줄 배치 */}
          <div className="mb-3 flex w-full items-center justify-between">
            <DialogTitle className="text-heading-1 text-text-primary">로그인</DialogTitle>
            <DialogPrimitive.Close
              render={
                <button
                  type="button"
                  aria-label="닫기"
                  className="flex size-9 items-center justify-center rounded-md text-stroke-secondary transition-colors hover:text-text-secondary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <XIcon className="size-6" />
                </button>
              }
            />
          </div>

          {/* 입력 폼 */}
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
            {/* 아이디 */}
            <label className="flex flex-col gap-2">
              <span className="text-title-1 text-text-primary">아이디</span>
              <Input
                name="id"
                type="email"
                placeholder="이메일을 입력해주세요."
                autoComplete="username"
                aria-invalid={idError ? true : undefined}
              />
              {idError && <span className="text-body-3 text-text-brand">{idError}</span>}
            </label>

            {/* 비밀번호 */}
            <label className="flex flex-col gap-2">
              <span className="text-title-1 text-text-primary">비밀번호</span>
              <Input
                name="password"
                type="password"
                placeholder="영문, 숫자, 특수문자 중 2가지 이상, 8~20자"
                autoComplete="current-password"
                aria-invalid={passwordError ? true : undefined}
              />
              {passwordError && (
                <span className="text-body-3 text-text-brand">{passwordError}</span>
              )}
            </label>

            {/* 서버 에러(로그인 실패 등)는 특정 필드에 속하지 않으므로 폼 하단에 별도 표시 */}
            {error && <span className="text-body-3 text-text-brand">{error}</span>}

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

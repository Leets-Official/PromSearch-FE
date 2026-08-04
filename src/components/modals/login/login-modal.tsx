"use client";

import { useRef, useState } from "react";
import { ChevronLeftIcon, XIcon } from "@/components/ui/icons";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SocialLoginButton } from "@/components/ui/social-login-button";
import { validateEmail, validatePassword } from "@/features/auth/lib/validation";

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
 * 반응형: 모바일은 전체화면 시트 + 상단 뒤로가기(<) 단독, sm+ 는 중앙 카드 + 제목 옆 X.
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
  const [idError, setIdError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setIdError(null);
      setPasswordError(null);
      formRef.current?.reset();
    }
    onOpenChange(next);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const id = (form.elements.namedItem("id") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const emailInvalid = validateEmail(id).status !== "valid";
    const pw = validatePassword(password);

    setIdError(emailInvalid ? "이메일 형식으로 입력해주세요." : null);
    setPasswordError(!pw.isValid ? (pw.message ?? "비밀번호 형식을 확인해주세요.") : null);

    if (emailInvalid || !pw.isValid) return;
    onLogin?.(id, password);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        fullScreenOnMobile
        className="items-stretch bg-bg-elevated sm:max-w-[440px] sm:items-center sm:rounded-2xl sm:p-8"
      >
        {/* 모바일 전용: 상단 뒤로가기 (단독). 아이콘 크게 + stroke-strong + 위아래 여백 */}
        <DialogPrimitive.Close
          render={
            <button
              type="button"
              aria-label="닫기"
              className="mb-2 -ml-2 flex size-11 items-center justify-center self-start rounded-md py-2 text-stroke-strong transition-colors hover:text-text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:hidden"
            >
              <ChevronLeftIcon className="size-7" />
            </button>
          }
        />

        {/* 헤더: 제목 + (sm+ 전용) X */}
        <div className="flex w-full items-center justify-between sm:mb-3">
          <DialogTitle className="text-heading-1 text-text-primary">로그인</DialogTitle>
          <DialogPrimitive.Close
            render={
              <button
                type="button"
                aria-label="닫기"
                className="hidden size-9 items-center justify-center rounded-md text-stroke-secondary transition-colors hover:text-text-secondary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:flex"
              >
                <XIcon className="size-6" />
              </button>
            }
          />
        </div>

        {/* 입력 폼 */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          className="flex w-full flex-col gap-4"
        >
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

          <label className="flex flex-col gap-2">
            <span className="text-title-1 text-text-primary">비밀번호</span>
            <Input
              name="password"
              type="password"
              placeholder="영문, 숫자, 특수문자 중 2가지 이상, 8~20자"
              autoComplete="current-password"
              aria-invalid={passwordError ? true : undefined}
            />
            {passwordError && <span className="text-body-3 text-text-brand">{passwordError}</span>}
          </label>

          {error && <span className="text-body-3 text-text-brand">{error}</span>}

          <Button type="submit" variant="brand" size="lg" className="mt-2 w-full">
            로그인
          </Button>
        </form>

        {/* 회원가입 링크 — 로그인 버튼과 간격 확대(mt) */}
        <button
          type="button"
          onClick={onSignUp}
          className="mt-2 rounded-sm text-title-3 text-text-brand hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          회원가입
        </button>

        {/* "또는" 구분선 */}
        <div className="mt-2 flex w-full items-center gap-4">
          <span className="h-px flex-1 bg-stroke-primary" />
          <span className="text-caption-1 text-text-secondary">또는</span>
          <span className="h-px flex-1 bg-stroke-primary" />
        </div>

        {/* 소셜 로그인 — 모바일 세로 풀폭 / sm+ 가로 아이콘 */}
        <div className="flex w-full min-w-0 flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:justify-center sm:gap-4">
          <SocialLoginButton provider="google" onClick={onGoogleLogin} />
          <SocialLoginButton provider="kakao" onClick={onKakaoLogin} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { LoginModal };

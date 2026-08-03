"use client";

import { useRef, useState } from "react";
import { XIcon } from "lucide-react";
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
 * DialogContent 사용 — 오버레이(딤)·포커스트랩·스크롤잠금은 dialog.tsx가 처리.
 * 닫기 버튼은 제목과 한 줄에 배치하므로 기본 닫기(showCloseButton)는 끈다.
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

  // 닫힐 때 초기화 (다음에 열면 깨끗한 상태).
  // 이 모달은 GalleryTopBar에 항상 마운트된 채 open prop만 토글되는 구조라
  // state·입력값이 유지된다. X버튼·ESC·딤 클릭 등 모든 닫기 경로가 여기로 모인다.
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setIdError(null);
      setPasswordError(null);
      formRef.current?.reset(); // uncontrolled 입력값(이메일·비밀번호)도 비운다
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
        className="flex w-[440px] max-w-[calc(100%-2rem)] flex-col items-center gap-4 rounded-2xl bg-bg-elevated p-8 sm:max-w-[440px]"
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

        {/* 소셜 로그인 */}
        <div className="flex items-center justify-center gap-4">
          <SocialLoginButton provider="google" onClick={onGoogleLogin} />
          <SocialLoginButton provider="kakao" onClick={onKakaoLogin} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { LoginModal };

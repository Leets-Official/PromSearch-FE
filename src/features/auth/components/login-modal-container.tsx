"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { LoginModal } from "@/components/modals/login/login-modal";
import { useLogin, getLoginErrorMessage } from "@/features/auth/hooks/use-login";
import { useSocialLoginRedirect } from "@/features/auth/hooks/use-social-login-redirect";

export function LoginModalContainer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const redirectToOAuth = useSocialLoginRedirect();

  const { mutate } = useLogin({
    onSuccess: () => {
      onOpenChange(false);
      router.refresh();
    },
  });

  const handleLogin = (id: string, password: string) => {
    setError(null);
    mutate({ email: id, password }, { onError: (err) => setError(getLoginErrorMessage(err)) });
  };

  return (
    <LoginModal
      open={open}
      onOpenChange={onOpenChange}
      onLogin={handleLogin}
      error={error}
      onSignUp={() => router.push("/signup")}
      onGoogleLogin={() => redirectToOAuth("google")}
      onKakaoLogin={() => redirectToOAuth("kakao")}
    />
  );
}

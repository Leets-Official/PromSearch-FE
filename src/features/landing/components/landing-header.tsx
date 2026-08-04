"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppHeader } from "@/components/ui/app-header";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/modals/login/login-modal";

/**
 * 랜딩 전용 헤더 (Figma 1201:3084 — Header/desktop).
 *
 * (main) 셸의 GalleryTopBar 와 달리 검색·업로드·알림이 없고
 * 우측에 [회원가입] [로그인] 텍스트 액션만 둔다(비회원 진입 화면이므로 인증 분기도 없음).
 * 로그인은 홈과 동일하게 LoginModal 을 띄운다.
 */
export function LandingHeader() {
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <div className="mx-auto w-full max-w-7xl">
        <AppHeader
          className="bg-bg-primary backdrop-blur-none sm:px-20"
          end={
            <>
              {/* 시안: Title 2(16/20 SemiBold) · text/secondary · 패딩 12px.
                  Button 의 lg 프리셋(h-48/px-16/Title 1)에서 타이포·색만 시안 값으로 덮는다. */}
              <Button
                variant="plain"
                size="lg"
                className="px-2 text-title-3 text-text-secondary sm:px-3 sm:text-title-2"
                nativeButton={false}
                render={<Link href="/signup" />}
              >
                회원가입
              </Button>
              <Button
                variant="plain"
                size="lg"
                className="px-2 text-title-3 text-text-secondary sm:px-3 sm:text-title-2"
                onClick={() => setLoginOpen(true)}
              >
                로그인
              </Button>
            </>
          }
        />
      </div>

      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSignUp={() => router.push("/signup")}
        onLogin={() => {
          // TODO: 로그인 API 연동
        }}
        onGoogleLogin={() => {
          // TODO: OAuth 연동
        }}
        onKakaoLogin={() => {
          // TODO: OAuth 연동
        }}
      />
    </>
  );
}

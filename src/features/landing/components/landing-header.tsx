"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppHeader } from "@/components/ui/app-header";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { LoginModal } from "@/components/modals/login/login-modal";
import { HeaderAuthArea } from "@/components/layout/header-auth-area";
import { useAuthStatus } from "@/hooks/use-auth-status";

/**
 * 랜딩 전용 헤더 (Figma 1201:3084 — Header/desktop).
 *
 * (main) 셸의 GalleryTopBar 와 달리 검색·업로드가 없다.
 *
 * 우측은 인증 상태로 갈린다.
 * - 비회원 : [회원가입] [로그인] 텍스트 액션 → 로그인은 홈과 동일하게 LoginModal
 * - 회원   : 서비스 헤더와 같은 인증영역(알림 + 프로필). 이미 로그인한 사람에게
 *            "회원가입/로그인"을 계속 보여줄 이유가 없다.
 *
 * 로고는 **이동하지 않고 맨 위로 스크롤**한다. 여기가 이미 랜딩이라 `/` 로 보내면 아무 일도
 * 일어나지 않고, `/home` 으로 보내면 랜딩을 읽던 사람을 밖으로 밀어낸다.
 */
export function LandingHeader() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStatus();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <div className="mx-auto w-full max-w-7xl">
        <AppHeader
          className="bg-bg-primary backdrop-blur-none sm:px-8 xl:px-20"
          start={
            <button
              type="button"
              aria-label="맨 위로"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Logo variant="horizontal" />
            </button>
          }
          end={
            isAuthenticated ? (
              <HeaderAuthArea isAuthenticated user={user} />
            ) : (
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
            )
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

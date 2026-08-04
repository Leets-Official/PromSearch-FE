"use client";

import Link from "next/link";

import { AppHeader } from "@/components/ui/app-header";
import { Logo } from "@/components/ui/logo";
import { HeaderAuthArea } from "@/features/gallery/components/header-auth-area";
import { useAuthStatus } from "@/hooks/use-auth-status";

/**
 * 어드민 헤더 (시안 Header/desktop 551:3671).
 * 서비스 헤더와 달리 검색바·업로드가 없고 로고 + 인증영역만 둔다.
 * 좌우 여백은 시안 80px(sm 이상) / 모바일 16px 로 본문과 맞춘다.
 */
export function AdminHeader() {
  const { isAuthenticated, user } = useAuthStatus();

  return (
    <AppHeader
      className="sm:px-20"
      start={
        <Link href="/admin" aria-label="어드민 홈" className="flex items-center">
          {/* 모바일은 워드마크만(심볼+워드마크는 좁은 폭에서 넘친다) */}
          <Logo variant="wordmark" className="sm:hidden" />
          <Logo variant="horizontal" className="hidden sm:flex" />
        </Link>
      }
      end={<HeaderAuthArea isAuthenticated={isAuthenticated} user={user} />}
    />
  );
}

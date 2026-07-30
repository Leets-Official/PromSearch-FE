"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PencilIcon } from "lucide-react";

import { AppHeader } from "@/components/ui/app-header";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { SearchBar } from "@/components/ui/search-bar";
import { useAuthStatus } from "@/hooks/use-auth-status";
import { useGalleryFilters } from "@/features/gallery/hooks/use-gallery-filters";
import { LoginModal } from "@/components/modals/login/login-modal";
import { useNicknameCheck } from "@/features/auth/hooks/use-nickname-check";

import { HeaderAuthArea } from "./header-auth-area";

const SEARCH_DEBOUNCE_MS = 300;

/**
 * 홈 상단바 — 로고 · 검색 · 업로드 · (인증영역).
 * 검색 입력은 디바운스 후 URL `q` 로 반영한다(입력값이 현재 값과 다를 때만 → 마운트 시 page 리셋 방지).
 * 비회원 로그인 버튼 클릭 시 로그인 모달을 연다.
 */
export function GalleryTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { query, setSearch } = useGalleryFilters();
  const { isAuthenticated, user } = useAuthStatus();
  const [keyword, setKeyword] = useState(query.q);
  const [loginOpen, setLoginOpen] = useState(false);
  const onHome = pathname === "/home";

  useEffect(() => {
    if (keyword === query.q) return;
    const timer = setTimeout(() => {
      // 홈에서는 URL(q)만 갱신(제자리 필터). 다른 페이지(상세 등)에서는 홈 결과로 이동.
      if (onHome) {
        setSearch(keyword);
      } else {
        const q = keyword.trim();
        router.push(q ? `/home?q=${encodeURIComponent(q)}` : "/home");
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [keyword, query.q, setSearch, onHome, router]);

  return (
    <>
      <AppHeader
        className="px-20"
        start={
          <div className="flex w-50 items-center">
            <Logo variant="horizontal" />
          </div>
        }
        center={
          <>
            <SearchBar
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="검색어를 입력해주세요"
              aria-label="프롬프트 검색"
              className="max-w-none flex-1"
            />
            <Button variant="ghost" size="lg" nativeButton={false} render={<Link href="/upload" />}>
              <PencilIcon />
              업로드
            </Button>
          </>
        }
        // 비회원 로그인 버튼 클릭 → 로그인 모달 오픈
        end={
          <HeaderAuthArea
            isAuthenticated={isAuthenticated}
            user={user}
            onLoginClick={() => setLoginOpen(true)}
          />
        }
      />

      {/* 로그인 모달 */}
      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSignUp={() => router.push("/signup")}
        onLogin={(id, password) => {
          // TODO: 로그인 API 연동
          console.log("login", id, password);
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

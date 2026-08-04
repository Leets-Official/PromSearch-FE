"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BellIcon, ChevronLeftIcon, MenuIcon, PencilIcon, SearchIcon } from "@/components/ui/icons";

import { AppHeader } from "@/components/ui/app-header";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { SearchBar } from "@/components/ui/search-bar";
import { useAuthStatus } from "@/hooks/use-auth-status";
import { LoginModal } from "@/components/modals/login/login-modal";

// 헤더 공용 인프라 — features/gallery 에서 중립 위치로 이전한 것들
import { HeaderAuthArea } from "@/components/layout/header-auth-area";
import { MobileNavDrawer } from "@/components/layout/mobile-nav-drawer";

import { MyPageSidebar } from "./mypage-sidebar";

/**
 * 마이페이지 상단바 — GalleryTopBar 와 동일한 공용 조각으로 조립하되,
 * 갤러리 종속(useGalleryFilters)을 제거한 독립 버전.
 * - 검색: 입력 후 Enter → 홈 검색결과(/home?q=)로 이동 (필터 훅 미사용)
 * - 모바일 드로어 내용: MyPageSidebar 주입
 */
export function MyPageTopBar() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStatus();

  const [keyword, setKeyword] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const submitSearch = () => {
    const q = keyword.trim();
    router.push(q ? `/home?q=${encodeURIComponent(q)}` : "/home");
  };

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") submitSearch();
  };

  return (
    <>
      <AppHeader
        className="sm:px-20"
        start={
          <>
            {/* mobile: 햄버거 + 워드마크 (검색 모드에서는 뒤로가기) */}
            <div className="flex items-center gap-4 sm:hidden">
              {mobileSearchOpen ? (
                <Button
                  variant="plain"
                  size="icon-sm"
                  aria-label="검색 닫기"
                  onClick={() => setMobileSearchOpen(false)}
                >
                  <ChevronLeftIcon />
                </Button>
              ) : (
                <>
                  <Button
                    variant="plain"
                    size="icon-sm"
                    aria-label="메뉴 열기"
                    className="lg:hidden"
                    onClick={() => setNavOpen(true)}
                  >
                    <MenuIcon />
                  </Button>
                  <Logo variant="wordmark" />
                </>
              )}
            </div>

            {/* desktop: 로고 (사이드바 폭에 맞춘 정렬) */}
            <div className="hidden items-center sm:flex sm:w-50">
              <Button
                variant="plain"
                size="icon"
                aria-label="메뉴 열기"
                className="mr-2 lg:hidden"
                onClick={() => setNavOpen(true)}
              >
                <MenuIcon />
              </Button>
              <Logo variant="horizontal" />
            </div>
          </>
        }
        center={
          <>
            {/* mobile: 검색 모드일 때만 검색바 */}
            {mobileSearchOpen && (
              <div className="flex min-w-0 flex-1 sm:hidden">
                <SearchBar
                  autoFocus
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={onSearchKeyDown}
                  placeholder="검색어를 입력해주세요"
                  aria-label="프롬프트 검색"
                  className="max-w-none flex-1"
                />
              </div>
            )}

            {/* desktop: 검색바 + 업로드 상시 노출 */}
            <div className="hidden min-w-0 flex-1 items-center gap-6 sm:flex">
              <SearchBar
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={onSearchKeyDown}
                placeholder="검색어를 입력해주세요"
                aria-label="프롬프트 검색"
                className="max-w-none flex-1"
              />
              <Button
                variant="ghost"
                size="lg"
                nativeButton={false}
                render={<Link href="/upload" />}
              >
                <PencilIcon />
                업로드
              </Button>
            </div>
          </>
        }
        end={
          <>
            {/* mobile: 알림 + 검색 (검색 모드에서는 숨김) */}
            {!mobileSearchOpen && (
              <div className="flex items-center gap-6 sm:hidden">
                <Button variant="plain" size="icon-sm" aria-label="알림">
                  <BellIcon />
                </Button>
                <Button
                  variant="plain"
                  size="icon-sm"
                  aria-label="검색"
                  onClick={() => setMobileSearchOpen(true)}
                >
                  <SearchIcon />
                </Button>
              </div>
            )}

            {/* desktop: 알림 + 로그인/프로필 */}
            <div className="hidden items-center gap-2 sm:flex">
              <HeaderAuthArea
                isAuthenticated={isAuthenticated}
                user={user}
                onLoginClick={() => setLoginOpen(true)}
              />
            </div>
          </>
        }
      />

      {/* 모바일 드로어 — 마이페이지 사이드바 주입 */}
      <MobileNavDrawer
        open={navOpen}
        onOpenChange={setNavOpen}
        isAuthenticated={isAuthenticated}
        user={user}
        onLoginClick={() => setLoginOpen(true)}
      >
        <MyPageSidebar />
      </MobileNavDrawer>

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

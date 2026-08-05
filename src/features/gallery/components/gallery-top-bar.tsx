"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { BellIcon, ChevronLeftIcon, MenuIcon, PencilIcon, SearchIcon } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { AppHeader } from "@/components/ui/app-header";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { SearchBar } from "@/components/ui/search-bar";
import { useAuthStatus } from "@/hooks/use-auth-status";
import { LOGIN_REQUIRED_PARAM, LOGIN_REQUIRED_VALUE } from "@/lib/auth-routes";
import { useGalleryFilters } from "@/features/gallery/hooks/use-gallery-filters";
import { LoginModalContainer } from "@/features/auth/components/login-modal-container";

import { HeaderAuthArea } from "@/components/layout/header-auth-area";
import { MobileNavDrawer } from "@/components/layout/mobile-nav-drawer";
import { CategoryNav } from "@/features/gallery/components/category-nav";

const SEARCH_DEBOUNCE_MS = 300;

/**
 * 홈 상단바 — 로고 · 검색 · 업로드 · (인증영역).
 * 검색 입력은 디바운스 후 URL `q` 로 반영한다(입력값이 현재 값과 다를 때만 → 마운트 시 page 리셋 방지).
 * 비회원 로그인 버튼 클릭 시 로그인 모달을 연다.
 *
 * 반응형(Figma Header/mobile/* 1214:5885 · 1378:5042):
 * - desktop : [로고] · [검색바 + 업로드] · [인증영역]
 * - mobile  : [햄버거 + 워드마크] · [알림, 검색]  ← 검색 아이콘을 누르면 아래 search 모드
 * - mobile(search 모드): [뒤로가기] · [검색바]
 * 데스크톱/모바일 구성은 CSS(`sm:`)로 전환한다 — JS 로 뷰포트를 재면 SSR 과 어긋난다.
 *
 * 햄버거는 `lg:hidden` 이다. (main) 레이아웃의 사이드바가 `lg:block` 이라
 * "사이드바가 안 보이는 구간 = 햄버거가 보이는 구간"으로 정확히 맞물린다(사각지대 없음).
 */
export function GalleryTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { query, setSearch } = useGalleryFilters();
  const { isAuthenticated, user } = useAuthStatus();
  const [keyword, setKeyword] = useState(query.q);
  const [loginOpen, setLoginOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  // 모바일 전용 검색 모드(Header/mobile/search). 데스크톱은 검색바가 상시 노출이라 무관.
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const onHome = pathname === "/home";

  /*
    보호 라우트(`/upload` 등)에 비회원이 들어오면 `src/proxy.ts` 가 여기(`/home`)로 돌려보내며
    `?login=required&redirect=원래경로` 를 붙인다. **그 신호를 받아 모달을 여는 쪽이 여기다.**
    (이 컴포넌트가 (main) 레이아웃에 있어 리다이렉트 착지점을 항상 덮는다)

    `login` 파라미터는 모달을 연 뒤 URL 에서 지운다 — 남겨 두면 새로고침·뒤로가기 때마다
    다시 열린다. `redirect` 는 남긴다: 로그인이 성공하면 그 경로로 돌려보내야 한다.
  */
  const searchParams = useSearchParams();
  const loginRequired = searchParams.get(LOGIN_REQUIRED_PARAM) === LOGIN_REQUIRED_VALUE;

  // 모달 열기는 **렌더 중 조정**으로 처리한다(ReportModal 의 `wasOpen` 과 같은 패턴).
  // effect 안에서 setState 하면 한 번 그린 뒤 다시 그리게 되고, 그래서 lint 도 막는다.
  // 초기값이 false 라 "파라미터를 달고 처음 들어온 순간"이 변화로 잡힌다.
  const [sawLoginRequired, setSawLoginRequired] = useState(false);
  if (loginRequired !== sawLoginRequired) {
    setSawLoginRequired(loginRequired);
    // 이미 로그인한 채로 이 URL 에 닿았다면(뒤로가기 등) 열 이유가 없다 — 흔적만 지운다.
    if (loginRequired && !isAuthenticated) setLoginOpen(true);
  }

  // URL 정리는 화면 상태가 아니라 바깥 세계(주소창)를 건드리는 일이라 effect 가 맞다.
  useEffect(() => {
    if (!loginRequired) return;
    const next = new URLSearchParams(searchParams);
    next.delete(LOGIN_REQUIRED_PARAM);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [loginRequired, searchParams, pathname, router]);

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
        // 모바일 좌우 여백 16px, 데스크톱 시안 여백 80px.
        // 모바일 시안에서 상단바(로고·검색·알림)는 **홈에만** 있다. 상세/업로드는
        // 뒤로가기 헤더(MobilePageHeader)를 페이지 내부에서 렌더하므로 sm 미만에서 숨긴다.
        className={cn(
          // 스크롤해도 상단에 고정. 데스크톱 배경은 불투명(sm:bg-bg-primary)이고
          // 모바일은 bg/80 + blur 라 아래 콘텐츠가 비쳐도 시안 의도대로 보인다.
          "sticky top-0 z-40",
          "sm:px-20",
          !onHome && "hidden sm:flex",
          // 검색 모드: 아래 본문을 덮는 스크림 위로 헤더를 올린다
          mobileSearchOpen && "z-50 bg-bg-primary",
        )}
        start={
          <>
            {/* mobile: 햄버거 + 워드마크 (검색 모드에서는 뒤로가기).
                시안 간격 16px = gap 10px(gap-2.5) + 버튼 우측 패딩 6px. -ml-1.5 로 좌측 플러시. */}
            <div className="-ml-1.5 flex items-center gap-2.5 sm:hidden">
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
                  <Link href="/home" aria-label="프롬써치 홈" className="flex items-center">
                    <Logo variant="wordmark" />
                  </Link>
                </>
              )}
            </div>

            {/* desktop: 로고 + (사이드바 폭에 맞춘 정렬) */}
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
              <Link href="/home" aria-label="프롬써치 홈" className="flex items-center">
                <Logo variant="horizontal" />
              </Link>
            </div>
          </>
        }
        center={
          <>
            {/* mobile: 검색 모드일 때만 검색바(시안 1378:4726 — 뒤로가기 + 폭을 채운 검색바) */}
            {mobileSearchOpen && (
              <div className="flex min-w-0 flex-1 sm:hidden">
                <SearchBar
                  autoFocus
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="검색어를 입력해주세요"
                  aria-label="프롬프트 검색"
                  className="h-11 max-w-none flex-1"
                />
              </div>
            )}

            {/* sm+ : 검색바. 업로드는 lg 부터(그 아래는 UploadFab 이 대신한다) */}
            <div className="hidden min-w-0 flex-1 items-center gap-6 sm:flex">
              <SearchBar
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="검색어를 입력해주세요"
                aria-label="프롬프트 검색"
                className="max-w-none flex-1"
              />
              {/* 태블릿(sm~lg)은 헤더 폭이 빠듯해 검색바를 좁히므로 업로드를 FAB 로 내린다.
                  사이드바가 햄버거로 접히는 경계(lg)와 같은 지점에서 전환한다. */}
              <Button
                variant="ghost"
                size="lg"
                nativeButton={false}
                className="hidden lg:inline-flex"
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
            {/* mobile: 알림 + 검색 (검색 모드에서는 숨김 — 검색바가 폭을 다 쓴다) */}
            {/* 시안(1214:5885)의 아이콘 간격은 24px(24px 아이콘 박스 기준)인데 버튼은 36px(icon-sm)이라
                좌우 6px씩 패딩이 붙는다 → gap 은 24-12=12px(gap-3). -mr-1.5 로 마지막 아이콘을
                화면 여백 16px 에 플러시. */}
            {!mobileSearchOpen && (
              <div className="-mr-1.5 flex items-center gap-3 sm:hidden">
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

            {/* desktop: 알림 + 로그인/프로필. 비회원 로그인 클릭 → 로그인 모달 */}
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

      {/*
        모바일 검색 화면(시안 1378:4726) — 검색바 아래는 빈 화면이다.
        검색어가 비어 있는 동안만 본문을 덮고, 입력이 생기면 걷어내 **검색 결과**가 보이게 한다.
        (헤더 높이 56px 아래부터 화면 끝까지)
      */}
      {mobileSearchOpen && keyword.trim() === "" ? (
        <div
          data-slot="mobile-search-scrim"
          aria-hidden
          className="fixed inset-x-0 top-14 bottom-0 z-40 bg-bg-primary sm:hidden"
        />
      ) : null}

      {/* 모바일 네비게이션 드로어 (햄버거) — 갤러리 사이드바 주입 */}
      <MobileNavDrawer
        open={navOpen}
        onOpenChange={setNavOpen}
        isAuthenticated={isAuthenticated}
        user={user}
        onLoginClick={() => setLoginOpen(true)}
      >
        <CategoryNav variant="drawer" />
      </MobileNavDrawer>

      {/* 로그인 모달 */}
      <LoginModalContainer open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}

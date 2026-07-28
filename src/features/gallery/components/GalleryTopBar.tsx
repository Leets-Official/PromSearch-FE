"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PencilIcon } from "lucide-react";

import { AppHeader } from "@/components/ui/app-header";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { SearchBar } from "@/components/ui/search-bar";
import { useAuthStatus } from "@/hooks/use-auth-status";
import { useGalleryFilters } from "@/features/gallery/hooks/use-gallery-filters";

import { HeaderAuthArea } from "./HeaderAuthArea";

const SEARCH_DEBOUNCE_MS = 300;

/**
 * 홈 상단바 — 로고 · 검색 · 업로드 · (인증영역).
 * 검색 입력은 디바운스 후 URL `q` 로 반영한다(입력값이 현재 값과 다를 때만 → 마운트 시 page 리셋 방지).
 */
export function GalleryTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { query, setSearch } = useGalleryFilters();
  const { isAuthenticated, user } = useAuthStatus();
  const [keyword, setKeyword] = useState(query.q);
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
    <AppHeader
      // 시안(499:1208): 좌우 여백 80px(px-20) — 사이드바/카드/검색 모두 이 폭 안에 정렬된다.
      className="px-20"
      // 로고 영역 폭 = 사이드바 폭(w-50) → 로고가 사이드바 위로 정렬되고,
      // 헤더 gap-8(로고~검색) 과 본문 gap-8(사이드바~갤러리) 이 같아 검색창·본문 좌측이 정렬된다.
      start={
        <div className="flex w-50 items-center">
          <Logo variant="horizontal" />
        </div>
      }
      // 시안: 검색창(flex-1) 바로 옆에 업로드 버튼(gap 24px = center gap-6). 검색창이 우측 끝까지
      // 늘어나지 않고 업로드까지가 한 묶음이라, 뒤의 인증 영역과 32px(header gap-8) 벌어진다.
      center={
        <>
          <SearchBar
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="검색어를 입력해주세요"
            aria-label="프롬프트 검색"
            className="max-w-none flex-1"
          />
          {/* 업로드: 시안 = 브랜드 아웃라인(빨간 테두리+빨간 글자) + 연필 아이콘, h-48(size lg).
              비회원 로그인 게이트·업로드 폼은 CRUD 브랜치. 지금은 경로 링크만.
              render 로 <a>(Link) 를 쓰므로 nativeButton=false */}
          <Button variant="ghost" size="lg" nativeButton={false} render={<Link href="/upload" />}>
            <PencilIcon />
            업로드
          </Button>
        </>
      }
      // 우측 인증 영역만 남긴다(비회원=로그인 버튼 / 회원=알림+프로필).
      end={<HeaderAuthArea isAuthenticated={isAuthenticated} user={user} />}
    />
  );
}

"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { ChevronLeftIcon } from "@/components/ui/icons";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * 모바일 전용 상단 헤더 — Figma "Header/mobile/page"(1233:6473).
 *
 * 시안 스펙: 높이 56px · 좌우 16px · 배경 bg-bg-primary/80 + backdrop-blur 6px
 * - [좌] 뒤로가기 24px
 * - [우] 페이지별 액션 아이콘(상세: 추천·북마크·신고), 간격 24px
 *
 * (main) 셸의 상단바(GalleryTopBar)는 홈 전용 구성이라, 상세/업로드 같은 하위 페이지는
 * sm 미만에서 상단바를 감추고 이 헤더를 **페이지 내부에서** 렌더한다.
 * 셸의 본문 여백(px-4 py-4)을 음수 마진으로 상쇄해 시안처럼 화면 폭을 꽉 채운다.
 */
type MobilePageHeaderProps = {
  /** 우측 액션 영역(선택) */
  end?: ReactNode;
  /** 뒤로가기 동작 override (기본: router.back()) */
  onBack?: () => void;
  className?: string;
};

export function MobilePageHeader({ end, onBack, className }: MobilePageHeaderProps) {
  const router = useRouter();

  return (
    <div
      data-slot="mobile-page-header"
      className={cn(
        "sticky top-0 z-30 -mx-4 -mt-4 mb-2 flex h-14 items-center gap-4 bg-bg-primary/80 px-4 backdrop-blur-[6px] sm:hidden",
        className,
      )}
    >
      <Button
        variant="plain"
        size="icon-sm"
        aria-label="뒤로 가기"
        // 24px 아이콘이 화면 여백(16px)에 플러시되도록 버튼 패딩만큼 당긴다
        className="-ml-1.5"
        onClick={() => (onBack ? onBack() : router.back())}
      >
        <ChevronLeftIcon />
      </Button>

      {/* 시안 아이콘 간격 24px = gap 12px + 버튼 좌우 패딩 6px×2 (아이콘 24 / 버튼 36) */}
      {end != null ? <div className="ml-auto flex items-center gap-3">{end}</div> : null}
    </div>
  );
}

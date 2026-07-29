"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";

import { Sidebar, SidebarGroupLabel, SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { JOB_CATEGORIES } from "@/features/gallery/categories";
import { useGalleryFilters } from "@/features/gallery/hooks/use-gallery-filters";
import type { JobCategory } from "@/features/gallery/types";

/** 홈 갤러리 경로 — 사이드바는 어느 페이지에서든 홈으로 이동한다 */
const HOME_PATH = "/home";

type Nav = "home" | "popular" | "job";

/** 사이드바 항목 → 홈 갤러리 링크(nav/job 쿼리). 상세 등 다른 페이지에서도 홈으로 이동한다. */
function navHref(nav: Nav, job?: JobCategory): string {
  if (nav === "popular") return `${HOME_PATH}?nav=popular`;
  if (nav === "job" && job) return `${HOME_PATH}?nav=job&job=${job}`;
  return HOME_PATH;
}

/**
 * 좌측 카테고리 사이드바 — 홈 / 인기 프롬프트 / 직군별.
 *
 * 상세 등 `(main)` 셸을 공유하는 다른 페이지에서도 노출되므로, 클릭 시 현재 URL 에
 * 쿼리만 덧붙이지 않고 **항상 홈 갤러리(`/home`)로 이동**한다(Link). 활성 표시는 홈에서만.
 */
/**
 * 마우스 클릭으로 이동한 뒤 링크에 포커스 링이 남는 것을 막는다(SPA 네비 특성).
 * `e.detail === 0` = 키보드(Enter/Space) → blur 안 함(키보드 포커스 링은 유지, 접근성).
 */
function blurOnMouseClick(e: MouseEvent<HTMLElement>) {
  if (e.detail !== 0) e.currentTarget.blur();
}

export function CategoryNav() {
  const pathname = usePathname();
  const { query } = useGalleryFilters();
  const onHome = pathname === HOME_PATH;

  const isActive = (nav: Nav, job?: JobCategory) =>
    onHome && query.nav === nav && (nav === "job" ? query.job === job : true);

  return (
    <Sidebar>
      <SidebarMenu>
        <SidebarMenuItem
          active={isActive("home")}
          onClick={blurOnMouseClick}
          render={<Link href={navHref("home")} />}
        >
          홈
        </SidebarMenuItem>
        <SidebarMenuItem
          active={isActive("popular")}
          onClick={blurOnMouseClick}
          render={<Link href={navHref("popular")} />}
        >
          인기 프롬프트
        </SidebarMenuItem>
      </SidebarMenu>

      <div className="flex flex-col">
        <SidebarGroupLabel>직군별</SidebarGroupLabel>
        <SidebarMenu>
          {JOB_CATEGORIES.map((job) => (
            <SidebarMenuItem
              key={job.value}
              size="sm"
              active={isActive("job", job.value)}
              onClick={blurOnMouseClick}
              render={<Link href={navHref("job", job.value)} />}
            >
              {job.label}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </div>
    </Sidebar>
  );
}

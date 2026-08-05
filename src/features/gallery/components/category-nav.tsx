"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { MouseEvent } from "react";

import { Sidebar, SidebarGroupLabel, SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { JOB_CATEGORIES } from "@/features/gallery/categories";
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

/**
 * @param variant
 * - `sidebar`(기본): 데스크톱 좌측 상주 사이드바.
 * - `drawer`: 모바일 햄버거 드로어(시안 1379:5812 · 1382:6077). 시안이 PC 와 다른 점만 분기한다 —
 *   ① 첫 항목 라벨이 "홈" 이 아니라 **"최신 프롬프트"**, ② 상단 메뉴와 "직군별" 사이 **구분선**,
 *   ③ 항목 간격이 4/12px 이 아니라 전부 **8px**.
 */
export function CategoryNav({ variant = "sidebar" }: { variant?: "sidebar" | "drawer" }) {
  const pathname = usePathname();
  const onHome = pathname === HOME_PATH;
  const isDrawer = variant === "drawer";

  /*
    활성 표시는 **URL 을 직접 읽어서** 정한다.

    예전에는 `useGalleryFilters()`(nuqs)의 파싱된 상태를 봤는데, 이 컴포넌트는 (main)
    **레이아웃**에 살아 있어서 `<Link>` 로 쿼리만 바뀌는 이동에서는 그 값이 갱신되지 않았다.
    증상: 새로고침하면 맞는데 사이드바를 눌러 이동하면 활성 표시가 이전 항목에 머문다
    (직장인 화면인데 "인기 프롬프트"가 빨간 상태).

    `useSearchParams` 는 Next 라우터를 구독하므로 클라이언트 이동에도 바로 따라온다.
    파라미터 이름은 위 `navHref` 가 만드는 것과 같다(nav / job).
  */
  const searchParams = useSearchParams();
  const currentNav = searchParams.get("nav") ?? "home";
  const currentJob = searchParams.get("job");

  const isActive = (nav: Nav, job?: JobCategory) =>
    onHome && currentNav === nav && (nav === "job" ? currentJob === job : true);

  return (
    <Sidebar className={isDrawer ? "w-full gap-2" : undefined}>
      {/* 상단 메뉴(홈·인기) — 시안(Side bar I…401:5931·5932)에서는 이 둘이 루트의 직접 자식이라
          루트 gap(12)이 그대로 항목 간격이 된다. 우리 구조는 ul 로 한 번 감싸므로 여기에 12 를 준다. */}
      <SidebarMenu className={isDrawer ? "gap-2" : "gap-3"}>
        <SidebarMenuItem
          active={isActive("home")}
          onClick={blurOnMouseClick}
          render={<Link href={navHref("home")} />}
        >
          {isDrawer ? "최신 프롬프트" : "홈"}
        </SidebarMenuItem>
        <SidebarMenuItem
          active={isActive("popular")}
          onClick={blurOnMouseClick}
          render={<Link href={navHref("popular")} />}
        >
          인기 프롬프트
        </SidebarMenuItem>
      </SidebarMenu>

      {isDrawer ? <hr className="border-t border-stroke-primary" /> : null}

      {/* 직군별 그룹 — 시안 I…401:5934: [라벨] + [직군 목록] 을 gap 12 로 묶고,
          목록 안쪽 항목 간격은 16 이다(라벨과 목록 사이보다 항목 사이를 넓게 둔 의도). */}
      <div className={isDrawer ? "flex flex-col gap-2" : "flex flex-col gap-3"}>
        <SidebarGroupLabel>직군별</SidebarGroupLabel>
        <SidebarMenu className={isDrawer ? "gap-2" : "gap-4"}>
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

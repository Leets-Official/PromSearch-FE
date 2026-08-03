"use client";

import { useState } from "react";

import { CarouselNavigation } from "@/components/ui/carousel-navigation";
import { PaginationRoot } from "@/components/ui/pagination";
import { Sidebar, SidebarGroupLabel, SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

import { SpecCell, SpecGroup, SpecSection } from "./spec";

/**
 * Navigation 스펙 시트 (Figma Navigation 섹션 401:5929).
 * Side bar/Menu 상태(default/pressed/selected) + 전체 Side bar 예시 + Pagination.
 */

// 직군 목록 (Figma Side bar type=home)
const JOBS = ["학생", "직장인", "기획자", "개발자", "디자이너", "자영업자"];

export function NavigationSection() {
  const [page, setPage] = useState(1);
  const [active, setActive] = useState("home");
  const [slide, setSlide] = useState(1);

  return (
    <SpecSection id="navigation" label="Navigation">
      {/* Side bar / Menu — 상태. 모바일에서는 라벨만 14px 로 축소(1206:3230) */}
      <SpecGroup
        title="Side bar / Menu (default / pressed / selected · sm 미만이면 라벨 14px)"
        className="flex-col items-start gap-6"
      >
        <div className="flex flex-wrap gap-8">
          <SpecCell label="default" className="w-40 items-stretch">
            <SidebarMenuItem>Tab Name</SidebarMenuItem>
          </SpecCell>
          <SpecCell label="pressed" className="w-40 items-stretch">
            <SidebarMenuItem className="bg-bg-secondary">Tab Name</SidebarMenuItem>
          </SpecCell>
          <SpecCell label="selected" className="w-40 items-stretch">
            <SidebarMenuItem active>Tab Name</SidebarMenuItem>
          </SpecCell>
        </div>
      </SpecGroup>

      {/* 전체 Side bar */}
      <SpecGroup title="Side bar">
        <Sidebar>
          <SidebarMenu>
            <SidebarMenuItem active={active === "home"} onClick={() => setActive("home")}>
              홈
            </SidebarMenuItem>
            <SidebarMenuItem active={active === "popular"} onClick={() => setActive("popular")}>
              인기 프롬프트
            </SidebarMenuItem>
          </SidebarMenu>

          <div>
            <SidebarGroupLabel>직군별</SidebarGroupLabel>
            <SidebarMenu>
              {JOBS.map((job) => (
                <SidebarMenuItem
                  key={job}
                  size="sm"
                  active={active === job}
                  onClick={() => setActive(job)}
                >
                  {job}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>

          <div>
            <SidebarGroupLabel>프로필</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem active={active === "revenue"} onClick={() => setActive("revenue")}>
                수익
              </SidebarMenuItem>
              <SidebarMenuItem active={active === "settings"} onClick={() => setActive("settings")}>
                설정
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </Sidebar>
      </SpecGroup>

      {/* Pagination — 창 폭을 줄이면 모바일 치수(24px)로 전환 */}
      <SpecGroup title="Pagination (sm 미만이면 24px 모바일 치수로 전환)">
        <PaginationRoot page={page} pageCount={5} onPageChange={setPage} />
      </SpecGroup>

      {/* Table/Carousel Navigation (Figma 1006:2985) — 이미지 위에 얹히는 dim 컨트롤 */}
      <SpecGroup title="Carousel Navigation">
        <div className="flex items-center justify-center rounded-md bg-bg-secondary p-6">
          <CarouselNavigation page={slide} total={10} onPageChange={setSlide} />
        </div>
      </SpecGroup>
    </SpecSection>
  );
}

import {
  BellIcon,
  BookmarkIcon,
  ChevronLeftIcon,
  FlagIcon,
  HeartIcon,
  MenuIcon,
  PencilIcon,
  SearchIcon,
} from "@/components/ui/icons";

import { AppHeader } from "@/components/ui/app-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { SearchBar } from "@/components/ui/search-bar";

import { SpecCell, SpecGroup, SpecSection } from "./spec";

/**
 * Header 스펙 시트 (Figma Header 340:2585 · mobile 1214:5885/1233:6473/1378:5042 · Logo 401:6038).
 * 데스크톱 시안 구성: [로고] · [검색바(넓게)] · [업로드 버튼] · [알림 벨] · [아바타].
 * 모바일 3종은 같은 AppHeader 를 start/center/end 슬롯만 바꿔 조립한다.
 */

/** 모바일 헤더 미리보기 틀 — 시안 폭(375px)으로 고정해 실제 비율을 보여준다. */
function MobileFrame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="w-93.75 max-w-full overflow-hidden rounded-lg border border-stroke-secondary bg-bg-secondary">
        {children}
      </div>
      <span className="text-caption-1 text-text-disabled">{label}</span>
    </div>
  );
}
export function HeaderSection() {
  return (
    <SpecSection id="header" label="Header">
      {/* 상단 헤더 — 시안 그대로 */}
      <SpecGroup title="App Header" className="block p-0">
        <div className="w-full overflow-hidden rounded-lg border border-stroke-secondary">
          <AppHeader
            center={<SearchBar placeholder="Placeholder" className="max-w-2xl" />}
            end={
              <>
                <Button variant="ghost" size="sm">
                  <PencilIcon /> 업로드
                </Button>
                <Button variant="plain" size="icon" aria-label="알림">
                  <BellIcon />
                </Button>
                <Avatar size="sm">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </>
            }
          />
        </div>
      </SpecGroup>

      {/* 모바일 헤더 3종 — 컨테이너는 같고 슬롯 구성만 다르다 */}
      <SpecGroup
        title="App Header — mobile (home / page / search)"
        className="flex-col items-start"
      >
        <p className="text-caption-1 text-text-disabled">
          아래 틀은 시안 폭(375px)으로 <strong className="text-text-secondary">슬롯 구성</strong>을
          보여줍니다. 높이 56px·반투명 배경 같은 모바일 치수는 뷰포트 기준 미디어쿼리라 브라우저
          창을 640px 아래로 줄여야 적용됩니다.
        </p>

        <MobileFrame label="home — [메뉴 + 로고] · [알림, 검색]">
          <AppHeader
            start={
              <div className="flex items-center gap-4">
                <Button variant="plain" size="icon-sm" aria-label="메뉴">
                  <MenuIcon />
                </Button>
                <Logo variant="wordmark" />
              </div>
            }
            end={
              <>
                <Button variant="plain" size="icon-sm" aria-label="알림">
                  <BellIcon />
                </Button>
                <Button variant="plain" size="icon-sm" aria-label="검색">
                  <SearchIcon />
                </Button>
              </>
            }
          />
        </MobileFrame>

        <MobileFrame label="page — [뒤로가기] · [좋아요, 북마크, 신고]">
          <AppHeader
            start={
              <Button variant="plain" size="icon-sm" aria-label="뒤로가기">
                <ChevronLeftIcon />
              </Button>
            }
            end={
              <>
                <Button variant="plain" size="icon-sm" aria-label="좋아요">
                  <HeartIcon />
                </Button>
                <Button variant="plain" size="icon-sm" aria-label="저장">
                  <BookmarkIcon />
                </Button>
                <Button variant="plain" size="icon-sm" aria-label="신고">
                  <FlagIcon />
                </Button>
              </>
            }
          />
        </MobileFrame>

        <MobileFrame label="search — [뒤로가기] · [검색바]">
          <AppHeader
            start={
              <Button variant="plain" size="icon-sm" aria-label="뒤로가기">
                <ChevronLeftIcon />
              </Button>
            }
            center={<SearchBar placeholder="Placeholder" />}
          />
        </MobileFrame>
      </SpecGroup>

      {/* Logo variants */}
      <SpecGroup title="Logo">
        <SpecCell label="symbol">
          <Logo variant="symbol" />
        </SpecCell>
        <SpecCell label="wordmark">
          <Logo variant="wordmark" />
        </SpecCell>
        <SpecCell label="horizontal">
          <Logo variant="horizontal" />
        </SpecCell>
        <SpecCell label="vertical">
          <Logo variant="vertical" />
        </SpecCell>
      </SpecGroup>
    </SpecSection>
  );
}

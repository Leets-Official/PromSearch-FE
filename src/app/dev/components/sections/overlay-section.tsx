"use client";

import { ArrowUpDownIcon, MoreVerticalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DemoSection } from "../demo-section";

const LOGIN_GATE_CODE = `
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";

// User Flow의 "로그인 상태 분기 → 로그인/회원가입" 게이트.
// 열리면 body 스크롤이 자동으로 잠기고, 딤은 Opacity/dim 토큰(gray-900/30%)입니다.
<Dialog>
  <DialogTrigger render={<Button>프롬프트 복사</Button>} />
  <DialogContent>
    <DialogHeader>
      <DialogTitle>로그인이 필요해요</DialogTitle>
      <DialogDescription>
        프롬프트를 복사하려면 로그인해 주세요.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose render={<Button variant="neutral">다음에</Button>} />
      <Button>로그인/회원가입</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
`;

const SCROLL_CODE = `
// 콘텐츠가 화면보다 길면 모달 내부에서 스크롤됩니다.
// (DialogContent 에 max-h-[calc(100dvh-4rem)] + overflow-y-auto 적용됨)
<DialogContent>
  <DialogHeader>…</DialogHeader>
  {/* 긴 콘텐츠 */}
</DialogContent>
`;

const DROPDOWN_CODE = `
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuRadioGroup, DropdownMenuRadioItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// 정렬 드랍다운 — 팝업은 포털 + z-50, 화면을 넘으면 내부 스크롤
<DropdownMenu>
  <DropdownMenuTrigger render={<Button variant="outline">정렬</Button>} />
  <DropdownMenuContent>
    <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
      <DropdownMenuRadioItem value="latest">최신순</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="popular">인기순</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>

// 게시글 관리 메뉴 (마이페이지 > 내 게시글)
<DropdownMenu>
  <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="더보기"><MoreVerticalIcon /></Button>} />
  <DropdownMenuContent align="end">
    <DropdownMenuItem>수정</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive">삭제</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
`;

export function OverlaySection() {
  return (
    <div className="space-y-10">
      <DemoSection
        id="overlay-dialog"
        title="Dialog (모달) — 로그인 게이트"
        description="User Flow의 로그인 분기 유스케이스. 포털 렌더 + body 스크롤 잠금 + 포커스 트랩 + ESC 닫기가 Base UI로 처리되고, 딤은 디자인 시스템 dim 토큰입니다."
        code={LOGIN_GATE_CODE}
      >
        <Dialog>
          <DialogTrigger render={<Button>프롬프트 복사</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>로그인이 필요해요</DialogTitle>
              <DialogDescription>프롬프트를 복사하려면 로그인해 주세요.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="neutral">다음에</Button>} />
              <Button>로그인/회원가입</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DemoSection>

      <DemoSection
        id="overlay-scroll"
        title="Dialog — 긴 콘텐츠 스크롤"
        description="콘텐츠가 화면보다 길면 배경(body)은 잠긴 채 모달 내부만 스크롤됩니다. 직접 열어서 확인해 보세요."
        code={SCROLL_CODE}
      >
        <Dialog>
          <DialogTrigger render={<Button variant="outline">긴 모달 열기</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>프롬프트 상세</DialogTitle>
              <DialogDescription>스크롤해서 끝까지 내려보세요.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {Array.from({ length: 30 }, (_, i) => (
                <p key={i} className="text-body-3 text-text-secondary">
                  {i + 1}. 모달 내부 스크롤 확인용 문단입니다. 배경은 스크롤되지 않아야 합니다.
                </p>
              ))}
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="neutral">닫기</Button>} />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DemoSection>

      <DemoSection
        id="overlay-dropdown"
        title="DropdownMenu (드랍다운)"
        description="정렬 선택과 게시글 관리(더보기) 유스케이스. 포털 + z-50 으로 어디서든 겹침 문제 없이 뜨고, 화면을 넘치면 내부 스크롤됩니다."
        code={DROPDOWN_CODE}
      >
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline">
                <ArrowUpDownIcon data-icon="inline-start" />
                정렬
              </Button>
            }
          />
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="latest">
              <DropdownMenuRadioItem value="latest">최신순</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="popular">인기순</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="fork">fork 많은 순</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="더보기">
                <MoreVerticalIcon />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem>수정</DropdownMenuItem>
            <DropdownMenuItem>공유</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">삭제</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </DemoSection>
    </div>
  );
}

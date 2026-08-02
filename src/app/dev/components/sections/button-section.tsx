"use client";

import { BellIcon, BookmarkIcon, FlagIcon, HeartIcon, PencilIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ContentsAction, ContentsActionBar } from "@/components/ui/contents-action-bar";
import { SocialLoginButton } from "@/components/ui/social-login-button";

import { SpecCell, SpecGroup, SpecSection } from "./spec";

/**
 * Button 스펙 시트 (Figma Button 섹션 309:1898).
 * hover/pressed 는 실제 상호작용 상태라 정적으로 보이도록 각 상태의 토큰 클래스를
 * className 으로 강제 적용해 나열합니다(문서용). disabled 는 실제 disabled prop.
 */

// 상태별 강제 클래스 (컴포넌트 내부 hover:/active: 규칙과 동일한 토큰)
const BRAND_SOLID = {
  hover: "bg-interaction-brand-hover shadow-[0_4px_8px_rgb(35_35_33/0.13)]",
  pressed: "bg-interaction-brand-pressed",
};
const BRAND_GHOST = {
  hover: "border-interaction-brand-hover shadow-[0_4px_8px_rgb(35_35_33/0.13)]",
  pressed: "border-interaction-brand-pressed bg-brand-tint",
};
const NEUTRAL = {
  hover: "bg-interaction-neutral-hover shadow-[0_4px_8px_rgb(35_35_33/0.13)]",
  pressed: "bg-interaction-neutral-pressed",
};

function Label() {
  return (
    <>
      <PencilIcon /> Button
    </>
  );
}

export function ButtonSection() {
  return (
    <SpecSection id="button" label="Button">
      {/* Brand — solid / ghost, size 48 & 36 */}
      <SpecGroup title="Brand — solid · ghost (size 48 / 36)">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start gap-6">
            <SpecCell label="default">
              <Button size="lg">
                <Label />
              </Button>
            </SpecCell>
            <SpecCell label="hover">
              <Button size="lg" className={BRAND_SOLID.hover}>
                <Label />
              </Button>
            </SpecCell>
            <SpecCell label="pressed">
              <Button size="lg" className={BRAND_SOLID.pressed}>
                <Label />
              </Button>
            </SpecCell>
            <SpecCell label="disabled">
              <Button size="lg" disabled>
                <Label />
              </Button>
            </SpecCell>
          </div>
          <div className="flex flex-wrap items-start gap-6">
            <SpecCell label="ghost default">
              <Button variant="ghost" size="lg">
                <Label />
              </Button>
            </SpecCell>
            <SpecCell label="ghost hover">
              <Button variant="ghost" size="lg" className={BRAND_GHOST.hover}>
                <Label />
              </Button>
            </SpecCell>
            <SpecCell label="ghost pressed">
              <Button variant="ghost" size="lg" className={BRAND_GHOST.pressed}>
                <Label />
              </Button>
            </SpecCell>
            <SpecCell label="ghost disabled">
              <Button variant="ghost" size="lg" disabled>
                <Label />
              </Button>
            </SpecCell>
          </div>
          <div className="flex flex-wrap items-start gap-6">
            <SpecCell label="sm solid">
              <Button size="sm">
                <Label />
              </Button>
            </SpecCell>
            <SpecCell label="sm ghost">
              <Button variant="ghost" size="sm">
                <Label />
              </Button>
            </SpecCell>
          </div>
        </div>
      </SpecGroup>

      {/* Neutral — size 48 & 36 */}
      <SpecGroup title="Neutral (size 48 / 36)">
        <SpecCell label="default">
          <Button variant="neutral" size="lg">
            <Label />
          </Button>
        </SpecCell>
        <SpecCell label="hover">
          <Button variant="neutral" size="lg" className={NEUTRAL.hover}>
            <Label />
          </Button>
        </SpecCell>
        <SpecCell label="pressed">
          <Button variant="neutral" size="lg" className={NEUTRAL.pressed}>
            <Label />
          </Button>
        </SpecCell>
        <SpecCell label="disabled">
          <Button variant="neutral" size="lg" disabled>
            <Label />
          </Button>
        </SpecCell>
        <SpecCell label="sm">
          <Button variant="neutral" size="sm">
            <Label />
          </Button>
        </SpecCell>
      </SpecGroup>

      {/* Icon 버튼 (44x44) — Figma Button/Icon: 투명 default + 회색 배경(pressed) */}
      <SpecGroup title="Icon (44 × 44)">
        <SpecCell label="default">
          <Button variant="plain" size="icon" aria-label="알림">
            <BellIcon />
          </Button>
        </SpecCell>
        <SpecCell label="pressed">
          <Button variant="plain" size="icon" aria-label="알림" className="bg-bg-secondary">
            <BellIcon />
          </Button>
        </SpecCell>
      </SpecGroup>

      {/* Contents Action (Figma 1006:2286) — 이미지 위에 얹는 액션 바라 dim 배경 */}
      <SpecGroup title="Contents Action (40 × 40, 이미지 오버레이용)">
        {/* 실사용 맥락(이미지 위)을 보여주기 위해 회색 판 위에 배치 */}
        <div className="flex items-center justify-center rounded-md bg-bg-secondary p-6">
          <ContentsActionBar>
            <ContentsAction aria-label="좋아요">
              <HeartIcon />
            </ContentsAction>
            <ContentsAction aria-label="저장">
              <BookmarkIcon />
            </ContentsAction>
            <ContentsAction aria-label="신고">
              <FlagIcon />
            </ContentsAction>
          </ContentsActionBar>
        </div>
      </SpecGroup>

      {/* 소셜 로그인 */}
      <SpecGroup title="소셜 로그인" className="flex-col items-stretch sm:flex-row">
        <div className="w-full max-w-xs space-y-3">
          <SocialLoginButton provider="google" />
          <SocialLoginButton provider="kakao" />
        </div>
      </SpecGroup>
    </SpecSection>
  );
}

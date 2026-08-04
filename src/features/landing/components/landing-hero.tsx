import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ContentTypeTag } from "@/components/ui/content-type-tag";
import { PromptCard } from "@/components/ui/prompt-card";

/**
 * 랜딩 히어로 (Figma 1201:3087).
 *
 * [좌] 카피 + CTA  ·  [우] 살짝 기울어 겹쳐 놓은 프롬프트 카드 두 장.
 * 카드의 썸네일·제목·프로필은 **아직 확정되지 않은 자리표시자**라 시안대로
 * 회색 플레이스홀더(Thumbnail/AvatarFallback)와 더미 문구를 그대로 둔다.
 */

/** 시안의 카드 더미 데이터 — 실제 데이터 연동 전까지 자리표시용 */
const HERO_CARD = {
  title: "프롬프트 제목을 쓰는 곳입니다",
  author: { name: "작성자이름" },
  tags: ["직군", "AI모델", "태스크"],
} as const;

/**
 * 히어로의 장식용 카드 한 장.
 * 시안(1734:8146)의 "interaction" 판: 흰 배경 + radius 8 + 그림자, 콘텐츠 290px + 여백 15px(=320px).
 * 클릭 대상이 아니므로 포인터 이벤트를 끈다(PromptCard 의 hover/pressed 표현도 함께 비활성).
 */
function HeroPromptCard({ className }: { className?: string }) {
  return (
    <PromptCard
      aria-hidden
      className={cn(
        "pointer-events-none absolute w-80 rounded-md bg-bg-elevated p-3.75 shadow-[0_4px_12px_0_rgba(0,0,0,0.15)]",
        className,
      )}
      title={HERO_CARD.title}
      author={HERO_CARD.author}
      tags={[...HERO_CARD.tags]}
      badge={<ContentTypeTag type="image" />}
    />
  );
}

export function LandingHero() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-16 px-4 pt-16 pb-20 sm:px-20 lg:flex-row lg:gap-10 lg:pt-30 lg:pb-40">
      {/* 좌: 카피 + CTA */}
      {/* 좁은 화면에서는 폭을 100% 로 묶어 문장이 뷰포트를 넘지 않고 접히게 한다
          (flex 아이템은 기본이 max-content 라 묶어 주지 않으면 가로 스크롤이 생긴다) */}
      <div className="flex w-full flex-col items-center gap-6 text-center lg:w-auto lg:items-start lg:text-left">
        <div className="flex max-w-full flex-col gap-3">
          {/* 시안 56px Bold(자간 -0.005em). 좁은 화면에서는 한 줄이 뷰포트를 넘겨
              가로 스크롤이 생기므로 28 → 40 → 56 으로 단계적으로 키운다.
              "결과" 위 강조점 두 개(1635:10962 · 1635:10965)는 폰트 크기를 따라가야 하므로
              시안의 px 좌표를 em 으로 환산해 둔다(18.5/56=0.33em, 55.5/56=0.991em, 8/56=0.143em). */}
          <h1 className="flex max-w-full flex-col gap-2 text-[1.75rem]/[1] font-bold tracking-[-0.005em] text-text-primary sm:text-[2.5rem]/[1] lg:text-[3.5rem]/[1]">
            <span className="relative">
              <span className="text-text-brand">결과</span>부터 보고
              <span
                aria-hidden
                className="absolute top-[-0.214em] left-[0.33em] size-[0.143em] rounded-full bg-brand"
              />
              <span
                aria-hidden
                className="absolute top-[-0.214em] left-[0.991em] size-[0.143em] rounded-full bg-brand"
              />
            </span>
            <span>프롬프트를 고르세요.</span>
          </h1>
        </div>

        <p className="max-w-full text-title-2 leading-6 text-text-secondary">
          아웃풋 이미지로 검색하는 한국형 AI 프롬프트 플랫폼.
          <br />
          프롬써치는 유저들의 추천으로 검증된 프롬프트만 모았습니다.
        </p>

        <div className="flex items-start justify-center gap-3">
          <Button variant="brand" size="lg" nativeButton={false} render={<Link href="/home" />}>
            둘러보기
          </Button>
          <Button variant="neutral" size="lg" nativeButton={false} render={<a href="#solution" />}>
            이용 방법
          </Button>
        </div>
      </div>

      {/* 우: 겹쳐진 카드 두 장. 시안 좌표(카드2를 +204/+49 오프셋, 각각 -6.19°/+6.52°)를
          그대로 두고, 작은 화면에서는 래퍼째 60% 로 축소한다. */}
      <div className="relative h-[209px] w-[314px] shrink-0 sm:h-[348px] sm:w-[523px]">
        <div className="absolute inset-0 origin-top-left scale-60 sm:scale-100">
          <HeroPromptCard className="top-0 left-0 -rotate-[6.19deg]" />
          <HeroPromptCard className="top-[49px] left-[204px] rotate-[6.52deg]" />
        </div>
      </div>
    </section>
  );
}

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
 *
 * 반응형: 시안(1280)의 좌우 2단은 xl 이상에서만 쓴다. 그 아래에서는 세로로 쌓고
 * 카드 묶음은 폭에 비례해 줄어들도록(퍼센트 좌표) 만들어 어느 폭에서도 넘치지 않게 한다.
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
 * 폭·여백을 묶음(523px) 대비 퍼센트로 두어 컨테이너가 줄면 카드도 같은 비율로 줄어든다.
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
    <section className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-12 px-4 pt-12 pb-16 sm:px-8 sm:pt-16 sm:pb-20 xl:flex-row xl:gap-10 xl:px-20 xl:pt-30 xl:pb-40">
      {/* 좌: 카피 + CTA — 좁은 화면에서는 폭을 100% 로 묶어 문장이 뷰포트를 넘지 않고 접히게 한다
          (flex 아이템은 기본이 max-content 라 묶어 주지 않으면 가로 스크롤이 생긴다) */}
      <div className="flex w-full flex-col items-center gap-6 text-center xl:w-auto xl:items-start xl:text-left">
        <div className="flex max-w-full flex-col gap-3">
          {/* 시안 56px Bold(자간 -0.005em). 좁은 화면에서는 한 줄이 뷰포트를 넘겨
              가로 스크롤이 생기므로 28 → 40 → 56 으로 단계적으로 키운다. */}
          <h1 className="flex max-w-full flex-col gap-2 text-[1.75rem]/[1] font-bold tracking-[-0.005em] text-text-primary sm:text-[2.5rem]/[1] xl:text-[3.5rem]/[1]">
            <span>
              {/* 강조점 두 개(1635:10962 · 1635:10965)는 "결과" 글자에 직접 붙여야 하므로
                  이 span(inline-block)을 기준 상자로 삼는다. 좌표·크기를 em 으로 두면
                  글자 크기가 바뀌어도 글자 폭 대비 같은 자리에 찍힌다.
                  (h1 의 각 줄은 flex 아이템 = 블록 상자라, 줄 전체를 기준으로 잡으면
                   가운데 정렬된 문단 폭만큼 왼쪽·위로 벌어진다) */}
              <span className="relative inline-block text-text-brand">
                결과
                {/* 가로 위치는 상자 폭의 1/4·3/4 — "결과" 두 글자가 상자를 정확히 반씩
                    나눠 쓰므로 폰트의 한글 자폭(1em 이 아니다)과 무관하게 각 글자 정중앙에 온다. */}
                <span
                  aria-hidden
                  className="absolute top-[-0.214em] left-1/4 size-[0.143em] -translate-x-1/2 rounded-full bg-brand"
                />
                <span
                  aria-hidden
                  className="absolute top-[-0.214em] left-3/4 size-[0.143em] -translate-x-1/2 rounded-full bg-brand"
                />
              </span>
              부터 보고
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

      {/* 우: 겹쳐진 카드 두 장(시안 523x348 묶음).
          카드2 오프셋(+204/+49)과 회전(-6.19°/+6.52°)을 퍼센트로 환산해 두면
          묶음 폭이 줄어도 겹침 모양이 그대로 유지된다. */}
      {/* 묶음은 시안 크기(523x348)로 두고 화면 폭에 따라 통째로 축소한다.
          카드 안쪽까지 같은 비율로 줄어들어 어느 폭에서든 시안과 같은 겹침·기울기를 유지한다.
          (폭만 줄이면 카드 안 글자는 그대로라 카드가 세로로 길어지면서 다음 섹션을 침범한다)
          래퍼 크기 = 523x348 x 배율 — 배율이 바뀌는 지점마다 함께 맞춰 준다. */}
      <div className="relative h-[174px] w-[262px] shrink-0 min-[420px]:h-[226px] min-[420px]:w-[340px] sm:h-[296px] sm:w-[445px] md:h-[348px] md:w-[523px]">
        <div className="absolute inset-0 origin-top-left scale-50 min-[420px]:scale-65 sm:scale-85 md:scale-100">
          <HeroPromptCard className="top-0 left-0 -rotate-[6.19deg]" />
          <HeroPromptCard className="top-[49px] left-[204px] rotate-[6.52deg]" />
        </div>
      </div>
    </section>
  );
}

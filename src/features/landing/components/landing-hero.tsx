import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ContentTypeTag } from "@/components/ui/content-type-tag";
import { PromptCard } from "@/components/ui/prompt-card";

/**
 * 랜딩 히어로 (Figma 1201:3087).
 *
 * [좌] 카피 + CTA  ·  [우] 살짝 기울어 겹쳐 놓은 프롬프트 카드 두 장.
 *
 * 반응형: 시안(1280)의 좌우 2단은 xl 이상에서만 쓴다. 그 아래에서는 세로로 쌓고
 * 카드 묶음은 폭에 비례해 줄어들도록(퍼센트 좌표) 만들어 어느 폭에서도 넘치지 않게 한다.
 */

/**
 * 히어로 장식 카드 두 장(1734:8145 · 1734:8158).
 *
 * 시안이 확정되며 회색 플레이스홀더가 **실제 결과물 이미지**로 교체됐다. 썸네일·프로필은
 * 시안에서 그대로 내보내 `public/landing/` 에 커밋한다(원본이 2000~4096px 라 그대로 두면
 * 안 된다 — 아래 각 상수 주석 참고).
 *
 * 프로필은 `Avatar`(base-ui) 가 **소수 `<img>`** 라 `next/image` 최적화를 타지 않는다 →
 * 커밋 전에 96px WebP 로 직접 줄여 둔다(PNG 원본 55KB → WebP 5KB). 32px 로만 그리므로
 * DPR 3 까지 커버된다.
 */
const HERO_CARDS = [
  {
    title: "20대 여성 스킨케어 광고 이미지",
    author: { name: "이미지랩", avatarSrc: "/landing/hero-avatar-1.webp" },
    thumbnailSrc: "/landing/hero-card-1.webp",
    tags: ["직장인", "Gemini", "이미지 생성"],
    /** 시안 좌표: 회전 -6.19°, 묶음 좌상단 기준 (0, 0) */
    placement: "top-0 left-0 -rotate-[6.19deg]",
  },
  {
    title: "그라데이션 테마 PPT 생성 프롬프트",
    author: { name: "슬라이드킴", avatarSrc: "/landing/hero-avatar-2.webp" },
    thumbnailSrc: "/landing/hero-card-2.webp",
    tags: ["학생", "직장인", "Gamma", "PPT"],
    /** 시안 좌표: 회전 +6.52°, 묶음 좌상단 기준 (204, 49) */
    placement: "top-[49px] left-[204px] rotate-[6.52deg]",
  },
] as const;

/**
 * 카드는 시안 폭 290px 로 고정이고, 묶음 전체를 아래 래퍼의 `scale` 로만 줄인다
 * (min-[420px] 65% · sm 85% · md 100%, 그 아래 50%). 즉 **실제 표시 폭 = 290 x 배율**이다.
 *
 * Thumbnail 의 기본 `sizes`(갤러리 3열 기준 33vw)를 그대로 두면 모바일에서 필요보다
 * 4배 큰 후보를 받는다. 배율이 바뀌는 지점을 그대로 옮겨 적어 실제 표시 폭을 알려 준다
 * — 래퍼의 breakpoint 를 고치면 **여기도 같이 고쳐야 한다**.
 */
const HERO_THUMBNAIL_SIZES =
  "(min-width: 768px) 290px, (min-width: 640px) 247px, (min-width: 420px) 189px, 145px";

/**
 * 히어로의 장식용 카드 한 장.
 * 시안(1734:8146)의 "interaction" 판: 흰 배경 + radius 8 + 그림자, 콘텐츠 290px + 여백 15px(=320px).
 * 클릭 대상이 아니므로 포인터 이벤트를 끈다(PromptCard 의 hover/pressed 표현도 함께 비활성).
 *
 * `aria-hidden` 인 이유: 카드에 적힌 제목·작성자는 **제품을 소개하는 예시 스크린샷**이지
 * 실제로 탐색 가능한 콘텐츠가 아니다. 스크린리더에는 좌측 카피만 읽히는 편이 정확하다.
 */
function HeroPromptCard({
  card,
  className,
}: {
  card: (typeof HERO_CARDS)[number];
  className?: string;
}) {
  return (
    <PromptCard
      aria-hidden
      className={cn(
        "pointer-events-none absolute w-80 rounded-md bg-bg-elevated p-3.75 shadow-[0_4px_12px_0_rgba(0,0,0,0.15)]",
        className,
      )}
      title={card.title}
      author={card.author}
      tags={[...card.tags]}
      thumbnailSrc={card.thumbnailSrc}
      thumbnailSizes={HERO_THUMBNAIL_SIZES}
      // 첫 화면 상단 = LCP 후보. 지연 로딩을 끄고 우선순위를 올린다.
      // (Next 16 의 `preload` 는 loading/fetchPriority 와 함께 쓸 수 없어 문서 권장대로 이쪽을 쓴다)
      eagerThumbnail
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

        {/* 시안 1201:3124 — 한 문장(Title 2). 좁은 화면에서는 자연스럽게 접히도록 강제 개행하지 않는다. */}
        <p className="max-w-full text-title-2 leading-6 text-text-secondary">
          원하는 결과물을 확인하고, 내 업무에 맞는 프롬프트를 빠르게 찾아보세요.
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
          {HERO_CARDS.map((card) => (
            <HeroPromptCard key={card.title} card={card} className={card.placement} />
          ))}
        </div>
      </div>
    </section>
  );
}

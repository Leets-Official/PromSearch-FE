import { LandingCta } from "@/features/landing/components/landing-cta";
import { LandingFooter } from "@/features/landing/components/landing-footer";
import { LandingForYou } from "@/features/landing/components/landing-for-you";
import { LandingHeader } from "@/features/landing/components/landing-header";
import { LandingHero } from "@/features/landing/components/landing-hero";
import { LandingProblem } from "@/features/landing/components/landing-problem";
import { LandingSolution } from "@/features/landing/components/landing-solution";

/**
 * 루트 랜딩 (Figma 1201:3082).
 *
 * (main) 셸 밖의 단독 페이지 — 헤더/사이드바 없이 섹션만 세로로 쌓는다.
 * 히어로 · Problem · Solution · For You · CTA · Footer 순서는 시안과 동일.
 */
export default function LandingPage() {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-bg-primary">
      <LandingHeader />
      {/* items-center 를 주면 각 섹션이 max-content 폭으로 줄어들어(=stretch 해제)
          좁은 화면에서 가로 스크롤이 생긴다. 가운데 정렬은 섹션 내부 컨테이너가 담당한다. */}
      <main className="flex w-full flex-1 flex-col">
        <LandingHero />
        <LandingProblem />
        <LandingSolution />
        <LandingForYou />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}

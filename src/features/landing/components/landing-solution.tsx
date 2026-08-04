/**
 * Solution 섹션 (Figma 1635:11211).
 *
 * 라벨(Solution) + 40px 헤드라인 + [이미지 | 설명] 4행.
 * 이미지 480x270 자리는 **아직 에셋이 없어** 시안에서도 회색 프레임(Background/secondary)이라
 * 그대로 회색 플레이스홀더로 둔다. 에셋이 나오면 이 자리만 교체하면 된다.
 */
const SOLUTIONS = [
  {
    label: "아웃풋 갤러리",
    title: "결과물부터 보고 결정하세요",
    description: [
      "갤러리로 정리된 결과물을 한눈에 확인해요.",
      "프롬프트를 직접 실행해보지 않아도 결과물로 비교하고 선택할 수 있어요.",
    ],
  },
  {
    label: "필터링",
    title: "나에게 필요한 프롬프트만 쏙쏙",
    description: [
      "원하는 직군, 태스크, AI 모델, 결과물 타입 필터를 적용해서",
      "나의 상황에 맞는 프롬프트를 빠르게 찾을 수 있어요.",
    ],
  },
  {
    label: "프롬프트 업로드",
    title: "좋은 프롬프트는 함께 나눠요",
    description: [
      "직접 써보고 좋았던 프롬프트를 결과물과 함께 공유해요.",
      "좋은 프롬프트와 활용법을 서로 나누며 더 많은 사람에게 도움이 될 수 있어요.",
    ],
  },
  {
    label: "추천 & 북마크",
    title: "마음에 든 프롬프트는 놓치지 않게",
    description: [
      "유저들의 추천으로 반응이 좋은 프롬프트를 확인하고,",
      "마음에 드는 프롬프트는 북마크해 필요할 때 다시 사용할 수 있어요.",
    ],
  },
] as const;

export function LandingSolution() {
  return (
    <section id="solution" className="w-full scroll-mt-20">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-12 px-4 py-15 sm:px-20">
        <div className="flex w-full max-w-full flex-col items-center gap-4 text-center">
          <p className="text-title-1 text-text-brand">Solution</p>
          {/* 시안 40px Bold — 좁은 화면에서 한 줄이 뷰포트를 넘지 않도록 22 → 28 → 40 단계 적용 */}
          <h2 className="flex max-w-full flex-col gap-2 text-[1.375rem]/[1.2] font-bold tracking-[-0.005em] text-text-primary sm:text-[1.75rem]/[1.2] lg:text-[2.5rem]/[1]">
            <span>검증된 프롬프트를</span>
            <span>결과물로 먼저 만나보는 곳, 프롬써치</span>
          </h2>
        </div>

        {SOLUTIONS.map((solution) => (
          <div
            key={solution.label}
            className="flex w-full max-w-280 flex-col items-center justify-center gap-6 lg:flex-row lg:gap-10"
          >
            {/* 이미지 자리표시자 — 시안에서도 빈 회색 프레임(1729:7062 외) */}
            <div
              aria-hidden
              className="h-67.5 w-full shrink-0 rounded-2xl bg-bg-secondary lg:w-120"
            />
            <div className="flex w-full flex-col items-start gap-4 lg:w-120">
              <p className="text-title-1 text-text-brand">{solution.label}</p>
              {/* 시안 32/36 Bold(자간 -0.005em) = Display 1 과 정확히 일치.
                  모바일에서는 폭이 모자라 Heading 1(20/24)로 한 단계 낮춘다. */}
              <p className="text-heading-1 text-text-primary sm:text-display-1">{solution.title}</p>
              <p className="w-full text-body-1 leading-6 text-text-secondary">
                {solution.description[0]}
                <br />
                {solution.description[1]}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

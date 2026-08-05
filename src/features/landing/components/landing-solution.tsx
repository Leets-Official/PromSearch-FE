import Image from "next/image";

/**
 * Solution 섹션 (Figma 1895:6196).
 *
 * 라벨(Solution) + 40px 헤드라인 + [이미지 | 설명] 4행.
 *
 * 각 행의 이미지는 시안에서 **회색 프레임 → 실제 화면 목업**으로 확정됐다(1801:6874 외 3개).
 * 목업은 Figma 안에서 UI 를 축소 배치해 만든 것이라 개별 레이어로 재현할 수 없다 →
 * 프레임 통째로 544x306 @2x(=1088x612) PNG 로 내보내 `public/landing/` 에 커밋한다.
 * 프레임 배경(Background/secondary)과 radius 16 이 이미 이미지에 포함돼 있어 컨테이너는 비워 둔다.
 */
const SOLUTIONS = [
  {
    image: "/landing/solution-gallery.png",
    label: "아웃풋 갤러리",
    title: "결과물부터 보고 결정하세요",
    description: [
      "갤러리로 정리된 결과물을 한눈에 확인해요.",
      "프롬프트를 직접 실행해보지 않아도 결과물로 비교하고 선택할 수 있어요.",
    ],
  },
  {
    image: "/landing/solution-filter.png",
    label: "필터링",
    title: "나에게 필요한 프롬프트만 쏙쏙",
    description: [
      "원하는 직군, 태스크, AI 모델, 결과물 타입 필터를 적용해서",
      "나의 상황에 맞는 프롬프트를 빠르게 찾을 수 있어요.",
    ],
  },
  {
    image: "/landing/solution-upload.png",
    label: "프롬프트 업로드",
    title: "좋은 프롬프트는 함께 나눠요",
    description: [
      "직접 써보고 좋았던 프롬프트를 결과물과 함께 공유해요.",
      "좋은 프롬프트와 활용법을 서로 나누며 더 많은 사람에게 도움이 될 수 있어요.",
    ],
  },
  {
    image: "/landing/solution-bookmark.png",
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
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-12 px-4 py-15 sm:px-8 xl:px-20">
        <div className="flex w-full max-w-full flex-col items-center gap-4 text-center">
          <p className="text-title-1 text-text-brand">Solution</p>
          {/* 시안 40px Bold — 좁은 화면에서 한 줄이 뷰포트를 넘지 않도록 22 → 28 → 40 단계 적용 */}
          <h2 className="flex max-w-full flex-col gap-2 text-[1.375rem]/[1.2] font-bold tracking-[-0.005em] text-text-primary sm:text-[1.75rem]/[1.2] lg:text-[2.5rem]/[1]">
            <span>새로운 프롬프트 탐색 경험,</span>
            <span>프롬써치와 함께 시작하세요.</span>
          </h2>
        </div>

        {SOLUTIONS.map((solution) => (
          <div
            key={solution.label}
            className="flex w-full max-w-280 flex-col items-center justify-center gap-6 lg:flex-row lg:gap-8"
          >
            {/* 시안 544x306 = 정확히 16:9. 컨테이너가 비율로 자리를 미리 잡으므로
                `fill` 을 써도 레이아웃 시프트가 없다(CLS 0).
                기능 설명용 목업이라 `alt` 는 그 행이 무엇을 보여 주는지로 적는다. */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl lg:max-w-136 lg:flex-1">
              <Image
                src={solution.image}
                alt={`${solution.label} 화면 예시`}
                fill
                // lg 이상에서 최대 544px, 그 아래로는 컨테이너 폭(≈100vw - 좌우 패딩)을 채운다.
                sizes="(min-width: 1024px) 544px, 100vw"
                className="object-cover"
              />
            </div>
            {/* lg 에서 544+544+32 는 1024 폭에 들어가지 않으므로 고정폭 대신
                flex-1 + 상한(544px) 으로 두어 남는 폭을 나눠 갖게 한다. */}
            <div className="flex w-full min-w-0 flex-col items-start gap-4 lg:max-w-136 lg:flex-1">
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

/**
 * Problem 섹션 (Figma 1734:8049).
 *
 * gray-900 배경 위에 라벨(Problem) + 40px 헤드라인 + 3분할 카드.
 * 카드의 이모지는 시안에서 내보낸 SVG 를 `public/landing/` 에 커밋해 그대로 렌더한다
 * (플랫폼별 이모지 폰트 차이를 피하려고 텍스트 이모지를 쓰지 않는다).
 * 64px 박스 안에서 각 이모지가 차지하는 여백이 달라, 시안의 inset 을 항목마다 유지한다.
 */
const PROBLEMS = [
  {
    icon: "/landing/problem-abc.svg",
    /** 1734:7868 — 64px 박스 기준 상하좌우 8.75% */
    iconInset: "inset-[8.75%]",
    title: "해외 프롬프트, 그대로 쓰긴 어색해요",
    description: [
      "영어권 프롬프트는 한국식 문서 톤과는 미묘하게",
      "어긋나서 보고서나 PPT에 바로 쓰긴 애매해요.",
    ],
  },
  {
    icon: "/landing/problem-thinking.svg",
    /** 1734:7858 */
    iconInset: "inset-[6.3%_6.25%_6.29%_6.25%]",
    title: "실행하기 전에는 결과를 알 수 없어요",
    description: [
      "프롬프트만 보고는 결과물을 예측하기 어려워요.",
      "직접 실행해봐야 원하는 결과인지 확인할 수 있어요.",
    ],
  },
  {
    icon: "/landing/problem-shrug.svg",
    /** 1734:7888 */
    iconInset: "inset-[4.05%_2.58%_3.76%_3.22%]",
    title: "좋은 프롬프트도 한 번 쓰고 끝나요",
    description: [
      "프롬프트의 활용법과 개선 방향을 알기 어려워요.",
      "다른 사람과 공유하고 발전시킬 기회도 부족해요.",
    ],
  },
] as const;

export function LandingProblem() {
  return (
    <section className="w-full bg-gray-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-12 px-4 py-15 sm:px-20">
        <div className="flex w-full max-w-full flex-col items-center gap-4 text-center">
          <p className="text-title-1 text-red-400">Problem</p>
          {/* 시안 40px Bold — 좁은 화면에서 한 줄이 뷰포트를 넘지 않도록 22 → 28 → 40 단계 적용 */}
          <h2 className="flex max-w-full flex-col gap-2 text-[1.375rem]/[1.2] font-bold tracking-[-0.005em] text-text-on-brand sm:text-[1.75rem]/[1.2] lg:text-[2.5rem]/[1]">
            <span>분명 좋다는 프롬프트인데,</span>
            <span>막상 써보면 불편하지 않았나요?</span>
          </h2>
        </div>

        <ul className="flex w-full max-w-280 flex-col items-stretch gap-4 lg:flex-row lg:items-center">
          {PROBLEMS.map((problem) => (
            <li
              key={problem.title}
              className="flex flex-1 flex-col justify-center gap-6 rounded-2xl bg-gray-800 p-5"
            >
              <div className="relative size-16 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element -- 정적 SVG 에셋(최적화 불필요) */}
                <img
                  src={problem.icon}
                  alt=""
                  aria-hidden
                  className={`absolute ${problem.iconInset}`}
                />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-heading-2 text-text-on-brand">{problem.title}</p>
                <p className="text-body-1 leading-6 text-gray-150">
                  {problem.description[0]}
                  <br />
                  {problem.description[1]}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

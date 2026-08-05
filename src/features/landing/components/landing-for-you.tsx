/**
 * For You 섹션 (Figma 1971:8676).
 *
 * 라벨(For You) + 40px 헤드라인 + gray-100 카드 4행([72px 이모지 | 제목 · 설명]).
 * Problem 섹션과 같은 이유로 이모지는 텍스트가 아니라 시안에서 내보낸 SVG 를 쓴다
 * (플랫폼별 이모지 폰트 차이를 없애려고). 72px 박스 안 여백이 이모지마다 달라
 * 시안의 inset 을 항목마다 유지한다 — `landing-problem.tsx` 와 동일한 패턴.
 */
const AUDIENCES = [
  {
    icon: "/landing/foryou-laptop.svg",
    /** 2023:10840 — 72px 박스 기준 상하 6.25% / 좌우 7.57% */
    iconInset: "inset-[6.25%_7.57%]",
    title: "AI를 업무에 활용하고 싶다면",
    description: ["보고서, PPT, 이메일 등 반복적인 업무를", "AI로 더 빠르게 처리하고 싶은 분"],
  },
  {
    icon: "/landing/foryou-magnifier.svg",
    /** 2023:10833 */
    iconInset: "inset-[8.75%_7.5%_7.5%_8.75%]",
    title: "결과물을 확인하고 프롬프트를 선택하고 싶다면",
    description: [
      "텍스트만 보고 결과를 예상하기보다",
      "실제 아웃풋을 확인한 뒤 나에게 맞는 프롬프트를 고르고 싶은 분",
    ],
  },
  {
    icon: "/landing/foryou-monocle.svg",
    /** 2023:11144 */
    iconInset: "inset-[6.25%]",
    title: "좋은 프롬프트를 찾느라 시간을 쓰고 있다면",
    description: [
      "직접 프롬프트를 처음부터 작성하기보다",
      "검증된 프롬프트를 찾아 바로 활용하고 싶은 분",
    ],
  },
  {
    icon: "/landing/foryou-couple.svg",
    /** 2023:11103 — 이 이모지만 여러 벡터 그룹으로 쪼개져 있어 72px 노드를 통째로 내보냈다(=여백 포함) */
    iconInset: "inset-0",
    title: "나만의 프롬프트를 발전시키고 싶다면",
    description: [
      "좋은 프롬프트를 공유하고 다른 사람의 피드백과 활용 사례를 참고해",
      "더 나은 결과를 만들어가고 싶은 분",
    ],
  },
] as const;

export function LandingForYou() {
  return (
    <section className="w-full">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-12 px-4 py-15 sm:px-8 xl:px-20">
        <div className="flex w-full max-w-full flex-col items-center gap-4 text-center">
          <p className="text-title-1 text-text-brand">For You</p>
          {/* 시안 40px Bold — Problem·Solution 과 동일한 22 → 28 → 40 단계 */}
          <h2 className="max-w-full text-[1.375rem]/[1.2] font-bold tracking-[-0.005em] text-text-primary sm:text-[1.75rem]/[1.2] lg:text-[2.5rem]/[1]">
            이런 분들께 추천해요
          </h2>
        </div>

        {/* 시안의 카드 묶음은 1120 이 아니라 580 폭(가장 긴 문장 기준)으로 가운데 정렬돼 있다. */}
        <ul className="flex w-full max-w-145 flex-col gap-4">
          {AUDIENCES.map((audience) => (
            <li
              key={audience.title}
              className="flex items-center gap-4 rounded-2xl bg-bg-secondary p-5 sm:gap-6 sm:px-8 sm:py-6"
            >
              <div className="relative size-14 shrink-0 overflow-hidden sm:size-18">
                {/* eslint-disable-next-line @next/next/no-img-element -- 정적 SVG 에셋(최적화 불필요) */}
                <img
                  src={audience.icon}
                  alt=""
                  aria-hidden
                  // 이 섹션은 접힘 아래(≈3000px)라 즉시 받을 이유가 없다. 빼먹으면 React 가
                  // SSR 중 <link rel="preload" as="image"> 를 head 에 끼워 넣어, 첫 화면
                  // 렌더에 필요한 CSS·폰트와 대역폭을 다투게 된다.
                  loading="lazy"
                  className={`absolute ${audience.iconInset}`}
                />
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <p className="text-heading-2 text-text-primary">{audience.title}</p>
                <p className="text-body-1 leading-6 text-text-secondary">
                  {audience.description[0]}
                  <br />
                  {audience.description[1]}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

import { readFileSync } from "node:fs";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import LandingPage from "@/app/page";

/**
 * 랜딩 전용 폰트 서브셋이 **현재 카피를 전부 덮는지** 지키는 테스트.
 *
 * 랜딩은 `public/fonts/pretendard/PretendardVariable.landing.woff2` 한 조각만 받는다
 * (자세한 사정은 `src/app/fonts/pretendard-landing.css` 주석 참고). 그 조각에는 서브셋을
 * 만들던 시점의 글자만 들어 있어서, 카피를 고쳐 **새 글자**가 들어오면 그 글자는 서브셋에 없다.
 *
 * 그래도 화면은 깨지지 않는다 — 폴백(`Pretendard Variable`, 92조각)이 받아 준다. 대신
 * 그 글자 하나 때문에 25KB 안팎의 조각을 통째로 더 받게 되어, 서브셋으로 아낀 몫을 까먹는다.
 * 사람이 기억해야 하는 절차라 잊히기 쉬우므로 여기서 기계적으로 잡는다.
 *
 * 즉 이 테스트가 실패해도 **버그가 아니라 성능 회귀 경고**다. 아래 안내대로 재생성하면 된다.
 */

/** 서브셋에 실제로 들어간 글자 목록 — 생성 스크립트가 함께 써 놓는다. */
const CHARSET_PATH = "scripts/landing-font-charset.txt";

// 헤더는 라우터·인증 훅에 의존한다. 여기서 검사하려는 건 "화면에 찍히는 글자"뿐이라
// 동작은 비회원 기본값으로 고정해 두고 렌더만 통과시킨다.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/hooks/use-auth-status", () => ({
  useAuthStatus: () => ({ isAuthenticated: false, user: null, isLoading: false }),
}));

describe("랜딩 폰트 서브셋", () => {
  it("랜딩에 찍히는 글자가 모두 서브셋에 들어 있다", () => {
    const subset = new Set(readFileSync(CHARSET_PATH, "utf8"));
    const { container } = render(<LandingPage />);

    const rendered = container.textContent ?? "";
    expect(rendered.length).toBeGreaterThan(500); // 렌더가 비면 이 테스트는 의미가 없다

    const missing = [
      ...new Set(
        [...rendered].filter((ch) => {
          // 공백류는 폰트 서브셋 대상이 아니다
          if (/\s/.test(ch)) return false;
          return !subset.has(ch);
        }),
      ),
    ];

    expect(
      missing,
      missing.length === 0
        ? ""
        : [
            ``,
            `랜딩 카피에 서브셋에 없는 글자가 생겼습니다: ${missing.join("")}`,
            ``,
            `화면은 정상입니다(폴백이 처리). 다만 이 글자들 때문에 92조각 중 일부를`,
            `추가로 내려받게 되어 서브셋 이득이 줄어듭니다. 아래로 재생성하세요:`,
            ``,
            `  curl -sLO https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/variable/PretendardVariable.ttf`,
            `  pnpm build && pnpm start`,
            `  node scripts/build-landing-font-subset.mjs http://localhost:3000 ./PretendardVariable.ttf`,
            ``,
          ].join("\n"),
    ).toEqual([]);
  });
});

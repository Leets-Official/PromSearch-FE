import { readFileSync } from "node:fs";
import { render } from "@testing-library/react";
import { describe, expect, it, vi, beforeAll } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

import LandingPage from "@/app/page";

const CHARSET_PATH = "scripts/landing-font-charset.txt";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/hooks/use-auth-status", () => ({
  useAuthStatus: () => ({ isAuthenticated: false, user: null, isLoading: false }),
}));

describe("랜딩 폰트 서브셋", () => {
  let queryClient: QueryClient;

  beforeAll(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  it("랜딩에 찍히는 글자가 모두 서브셋에 들어 있다", () => {
    const subset = new Set(readFileSync(CHARSET_PATH, "utf8"));

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { container } = render(<LandingPage />, { wrapper });

    const rendered = container.textContent ?? "";
    expect(rendered.length).toBeGreaterThan(500);

    const missing = [
      ...new Set(
        [...rendered].filter((ch) => {
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

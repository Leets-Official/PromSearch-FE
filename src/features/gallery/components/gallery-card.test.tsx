import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { track } from "@/analytics/track";
import { GalleryCard, buildCardTags } from "@/features/gallery/components/gallery-card";
import type { PromptSummary } from "@/features/gallery/types";

// next/link 를 순수 anchor 로 대체(라우터 컨텍스트 없이 클릭/href 검증)
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children?: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/analytics/track", () => ({ track: vi.fn() }));

function makePrompt(overrides: Partial<PromptSummary> = {}): PromptSummary {
  return {
    id: "prompt-1",
    title: "테스트 프롬프트",
    description: "설명",
    thumbnailUrl: undefined,
    outputType: "image",
    model: "chatgpt",
    tasks: ["ppt"],
    jobCategories: ["developer"],
    tier: "free",
    author: { name: "홍길동" },
    stats: { views: 0, copies: 0, likes: 0 },
    createdAt: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("GalleryCard", () => {
  beforeEach(() => {
    vi.mocked(track).mockClear();
  });

  it("상세 경로(/prompts/[id])로 가는 링크로 렌더된다 — 비회원/회원 동일", () => {
    render(<GalleryCard prompt={makePrompt()} position={1} userStatus="anonymous" />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/prompts/prompt-1");
  });

  it("클릭 시 card_click 을 정확한 payload 로 1회 발송한다", async () => {
    const user = userEvent.setup();
    render(
      <GalleryCard
        prompt={makePrompt({ id: "prompt-42" })}
        position={3}
        userStatus="authenticated"
      />,
    );

    await user.click(screen.getByRole("link"));

    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith("card_click", {
      card_id: "prompt-42",
      position: 3,
      user_status: "authenticated",
      source: "home",
    });
  });

  it("user_status 는 주입값을 그대로 반영한다(anonymous)", async () => {
    const user = userEvent.setup();
    render(<GalleryCard prompt={makePrompt()} position={1} userStatus="anonymous" />);

    await user.click(screen.getByRole("link"));

    expect(track).toHaveBeenCalledWith(
      "card_click",
      expect.objectContaining({ user_status: "anonymous" }),
    );
  });
});

describe("buildCardTags", () => {
  it("홈 필터와 같은 순서로 라벨을 구성한다 — 직군·태스크·AI모델·결과물타입", () => {
    const tags = buildCardTags(
      makePrompt({
        model: "chatgpt",
        jobCategories: ["developer"],
        tasks: ["ppt"],
        outputType: "image",
      }),
    );
    expect(tags).toEqual(["개발자", "PPT", "ChatGPT", "이미지"]);
  });

  it("모델이 기타면 직접입력명(modelEtcName)을 노출한다", () => {
    const tags = buildCardTags(makePrompt({ model: "etc", modelEtcName: "뤼튼" }));
    expect(tags).toContain("뤼튼");
  });
});

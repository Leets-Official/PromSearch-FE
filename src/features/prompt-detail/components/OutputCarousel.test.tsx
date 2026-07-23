import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { OutputCarousel } from "@/features/prompt-detail/components/OutputCarousel";

function renderCarousel(
  images = ["a.png", "b.png", "c.png"],
  overrides: Partial<Parameters<typeof OutputCarousel>[0]> = {},
) {
  const props = {
    images,
    title: "제목",
    liked: false,
    onToggleLike: vi.fn(),
    bookmarked: false,
    onToggleBookmark: vi.fn(),
    onReport: vi.fn(),
    ...overrides,
  };
  render(<OutputCarousel {...props} />);
  return props;
}

describe("OutputCarousel", () => {
  it("다중 이미지 — 현재/전체 인디케이터와 이전/다음 버튼", () => {
    renderCarousel();
    expect(screen.getByTestId("carousel-indicator")).toHaveTextContent("1/3");
    expect(screen.getByRole("button", { name: "이전 이미지" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다음 이미지" })).toBeInTheDocument();
  });

  it("다음/이전 클릭으로 인덱스가 순환한다", async () => {
    const user = userEvent.setup();
    renderCarousel(["a.png", "b.png"]);

    await user.click(screen.getByRole("button", { name: "다음 이미지" }));
    expect(screen.getByTestId("carousel-indicator")).toHaveTextContent("2/2");
    await user.click(screen.getByRole("button", { name: "다음 이미지" }));
    expect(screen.getByTestId("carousel-indicator")).toHaveTextContent("1/2");
  });

  it("단일 이미지 — 화살표/인디케이터 없음", () => {
    renderCarousel(["only.png"]);
    expect(screen.queryByTestId("carousel-indicator")).toBeNull();
    expect(screen.queryByRole("button", { name: "다음 이미지" })).toBeNull();
  });

  it("이미지 위 3개 액션(추천·북마크·신고) 오버레이를 렌더한다", () => {
    renderCarousel(undefined, { liked: true, bookmarked: false });
    expect(screen.getByRole("button", { name: "추천" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "북마크" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "신고" })).toBeInTheDocument();
  });

  it("추천/북마크/신고 클릭 시 각 핸들러 호출", async () => {
    const user = userEvent.setup();
    const props = renderCarousel();

    await user.click(screen.getByRole("button", { name: "추천" }));
    await user.click(screen.getByRole("button", { name: "북마크" }));
    await user.click(screen.getByRole("button", { name: "신고" }));

    expect(props.onToggleLike).toHaveBeenCalledOnce();
    expect(props.onToggleBookmark).toHaveBeenCalledOnce();
    expect(props.onReport).toHaveBeenCalledOnce();
  });

  it("이미지 클릭 시 확대 모달(dialog)이 열린다", async () => {
    const user = userEvent.setup();
    renderCarousel(["a.png", "b.png"]);

    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(screen.getByRole("button", { name: /이미지 확대/ }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

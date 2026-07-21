import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { OutputCarousel } from "@/features/prompt-detail/components/OutputCarousel";

describe("OutputCarousel", () => {
  it("다중 이미지 — 현재/전체 인디케이터와 이전/다음 버튼", () => {
    render(<OutputCarousel images={["a.png", "b.png", "c.png"]} title="제목" />);

    expect(screen.getByTestId("carousel-indicator")).toHaveTextContent("1/3");
    expect(screen.getByRole("button", { name: "이전 이미지" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다음 이미지" })).toBeInTheDocument();
  });

  it("다음 클릭 → 인덱스 증가, 마지막에서 처음으로 순환", async () => {
    const user = userEvent.setup();
    render(<OutputCarousel images={["a.png", "b.png"]} title="제목" />);

    await user.click(screen.getByRole("button", { name: "다음 이미지" }));
    expect(screen.getByTestId("carousel-indicator")).toHaveTextContent("2/2");

    await user.click(screen.getByRole("button", { name: "다음 이미지" }));
    expect(screen.getByTestId("carousel-indicator")).toHaveTextContent("1/2");
  });

  it("이전 클릭 → 처음에서 마지막으로 순환", async () => {
    const user = userEvent.setup();
    render(<OutputCarousel images={["a.png", "b.png", "c.png"]} title="제목" />);

    await user.click(screen.getByRole("button", { name: "이전 이미지" }));
    expect(screen.getByTestId("carousel-indicator")).toHaveTextContent("3/3");
  });

  it("단일 이미지 — 화살표/인디케이터 없음", () => {
    render(<OutputCarousel images={["only.png"]} title="제목" />);

    expect(screen.queryByTestId("carousel-indicator")).toBeNull();
    expect(screen.queryByRole("button", { name: "다음 이미지" })).toBeNull();
  });
});

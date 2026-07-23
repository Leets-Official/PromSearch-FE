import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ImageZoomModal } from "@/features/prompt-detail/components/ImageZoomModal";

const IMAGES = ["a.png", "b.png", "c.png"];

describe("ImageZoomModal", () => {
  it("dialog + 초기 이미지를 노출한다", () => {
    render(<ImageZoomModal images={IMAGES} title="제목" initialIndex={1} onClose={vi.fn()} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByAltText("제목 아웃풋 2")).toBeInTheDocument();
  });

  it("썸네일 스트립: 현재 이미지는 opacity-0(위치표시)·aria-current, 나머지는 클릭 시 전환", async () => {
    const user = userEvent.setup();
    render(<ImageZoomModal images={IMAGES} title="제목" initialIndex={0} onClose={vi.fn()} />);

    const current = screen.getByRole("button", { name: "1번 이미지 보기" });
    expect(current).toHaveAttribute("aria-current", "true");
    expect(current.className).toContain("opacity-0");

    await user.click(screen.getByRole("button", { name: "3번 이미지 보기" }));
    expect(screen.getByAltText("제목 아웃풋 3")).toBeInTheDocument();
  });

  it("X 버튼과 ESC 로 닫힌다", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ImageZoomModal images={IMAGES} title="제목" onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "닫기" }));
    expect(onClose).toHaveBeenCalledOnce();

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

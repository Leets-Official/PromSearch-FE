import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ImageZoomModal } from "@/features/prompt-detail/components/image-zoom-modal";

const IMAGES = ["a.png", "b.png", "c.png"];

describe("ImageZoomModal", () => {
  it("dialog + 초기 이미지 + 카운트(현재/전체)를 노출한다", () => {
    render(<ImageZoomModal images={IMAGES} title="제목" initialIndex={1} onClose={vi.fn()} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByAltText("제목 아웃풋 2")).toBeInTheDocument();
    expect(screen.getByText("2/3")).toBeInTheDocument();
  });

  it("썸네일 스트립: 현재 이미지는 밝게(opacity-100)·aria-current, 나머지는 클릭 시 전환", async () => {
    const user = userEvent.setup();
    render(<ImageZoomModal images={IMAGES} title="제목" initialIndex={0} onClose={vi.fn()} />);

    const current = screen.getByRole("button", { name: "1번 이미지 보기" });
    expect(current).toHaveAttribute("aria-current", "true");
    expect(current.className).toContain("opacity-100");

    await user.click(screen.getByRole("button", { name: "3번 이미지 보기" }));
    expect(screen.getByAltText("제목 아웃풋 3")).toBeInTheDocument();
    expect(screen.getByText("3/3")).toBeInTheDocument();
  });

  // 전환은 트랙 슬라이드 애니메이션이 끝난 뒤 index 가 바뀐다(애니메이션 중 클릭은 무시) → waitFor
  it("좌우 화살표로 이미지를 순환한다", async () => {
    const user = userEvent.setup();
    render(<ImageZoomModal images={IMAGES} title="제목" initialIndex={0} onClose={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "다음 이미지" }));
    await waitFor(() => expect(screen.getByText("2/3")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "이전 이미지" }));
    await waitFor(() => expect(screen.getByText("1/3")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "이전 이미지" }));
    await waitFor(() => expect(screen.getByText("3/3")).toBeInTheDocument()); // 0→wrap→마지막
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

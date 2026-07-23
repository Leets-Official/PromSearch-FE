import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DetailHeader } from "@/features/prompt-detail/components/DetailHeader";
import { makeDetail } from "@/features/prompt-detail/test-fixtures";

function renderHeader(props: Partial<Parameters<typeof DetailHeader>[0]> = {}) {
  const onToggleLike = vi.fn();
  const onToggleBookmark = vi.fn();
  render(
    <DetailHeader
      detail={makeDetail()}
      liked={false}
      likeCount={123}
      bookmarked={false}
      onToggleLike={onToggleLike}
      onToggleBookmark={onToggleBookmark}
      {...props}
    />,
  );
  return { onToggleLike, onToggleBookmark };
}

describe("DetailHeader", () => {
  it("제목·작성자·작성일·조회·추천수·태그를 렌더한다", () => {
    renderHeader();

    expect(screen.getByRole("heading", { name: "보고서 초안 작성 프롬프트" })).toBeInTheDocument();
    expect(screen.getByText("전업프롬프트업로더")).toBeInTheDocument();
    expect(screen.getByText("2026.07.12")).toBeInTheDocument();
    expect(screen.getByText("조회 123")).toBeInTheDocument();
    // 추천수는 표시 전용 텍스트
    expect(screen.getByText("추천 123")).toBeInTheDocument();
    // 태그 — 등급(무료)·직군·태스크·모델·결과물타입
    expect(screen.getByText("무료")).toBeInTheDocument();
    expect(screen.getByText("학생")).toBeInTheDocument();
    expect(screen.getByText("ChatGPT")).toBeInTheDocument();
    expect(screen.getByText("텍스트")).toBeInTheDocument();
  });

  it("좋아요 클릭 → onToggleLike, liked 는 aria-pressed 로 반영", async () => {
    const user = userEvent.setup();
    const { onToggleLike } = renderHeader();

    const likeBtn = screen.getByRole("button", { name: "좋아요" });
    expect(likeBtn).toHaveAttribute("aria-pressed", "false");
    await user.click(likeBtn);
    expect(onToggleLike).toHaveBeenCalledOnce();
  });

  it("북마크 클릭 → onToggleBookmark, bookmarked 는 aria-pressed 로 반영", async () => {
    const user = userEvent.setup();
    const { onToggleBookmark } = renderHeader({ bookmarked: true });

    const bookmarkBtn = screen.getByRole("button", { name: "북마크" });
    expect(bookmarkBtn).toHaveAttribute("aria-pressed", "true");
    await user.click(bookmarkBtn);
    expect(onToggleBookmark).toHaveBeenCalledOnce();
  });

  it("추천수는 버튼이 아니라 표시 전용 텍스트다", () => {
    renderHeader();
    expect(screen.queryByRole("button", { name: /추천/ })).toBeNull();
  });

  it("더보기는 자리만(존재)", () => {
    renderHeader();
    expect(screen.getByRole("button", { name: "더보기" })).toBeInTheDocument();
  });
});

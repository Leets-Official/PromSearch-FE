import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DetailHeader } from "@/features/prompt-detail/components/DetailHeader";
import { makeDetail } from "@/features/prompt-detail/test-fixtures";

function renderHeader(props: Partial<Parameters<typeof DetailHeader>[0]> = {}) {
  const onToggleLike = vi.fn();
  render(
    <DetailHeader
      detail={makeDetail()}
      liked={false}
      likeCount={123}
      onToggleLike={onToggleLike}
      {...props}
    />,
  );
  return { onToggleLike };
}

describe("DetailHeader", () => {
  it("제목·작성자·작성일·조회·추천·태그를 렌더한다", () => {
    renderHeader();

    expect(screen.getByRole("heading", { name: "보고서 초안 작성 프롬프트" })).toBeInTheDocument();
    expect(screen.getByText("전업프롬프트업로더")).toBeInTheDocument();
    expect(screen.getByText("2026.07.12")).toBeInTheDocument();
    expect(screen.getByText("조회 123")).toBeInTheDocument();
    // 태그 — 등급(무료)·직군·태스크·모델·결과물타입
    expect(screen.getByText("무료")).toBeInTheDocument();
    expect(screen.getByText("학생")).toBeInTheDocument();
    expect(screen.getByText("ChatGPT")).toBeInTheDocument();
    expect(screen.getByText("텍스트")).toBeInTheDocument();
  });

  it("추천 클릭 → onToggleLike 호출", async () => {
    const user = userEvent.setup();
    const { onToggleLike } = renderHeader();

    await user.click(screen.getByRole("button", { name: "추천" }));
    expect(onToggleLike).toHaveBeenCalledOnce();
  });

  it("liked 상태는 aria-pressed 로 반영된다", () => {
    renderHeader({ liked: true, likeCount: 124 });
    expect(screen.getByRole("button", { name: "추천" })).toHaveAttribute("aria-pressed", "true");
  });

  it("벨/더보기는 자리만(존재)", () => {
    renderHeader();
    expect(screen.getByRole("button", { name: "구독 알림" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "더보기" })).toBeInTheDocument();
  });
});

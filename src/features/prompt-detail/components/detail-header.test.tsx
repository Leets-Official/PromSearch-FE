import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DetailHeader } from "@/features/prompt-detail/components/detail-header";
import { makeDetail } from "@/features/prompt-detail/test-fixtures";

describe("DetailHeader", () => {
  it("제목·작성자·작성일·조회·추천수·태그를 렌더한다", () => {
    render(<DetailHeader detail={makeDetail({ stats: { views: 123, copies: 0, likes: 45 } })} />);

    expect(screen.getByRole("heading", { name: "보고서 초안 작성 프롬프트" })).toBeInTheDocument();
    expect(screen.getByText("전업프롬프트업로더")).toBeInTheDocument();
    expect(screen.getByText("2026.07.12")).toBeInTheDocument();
    expect(screen.getByText("조회 123")).toBeInTheDocument();
    expect(screen.getByText("추천 45")).toBeInTheDocument();
    // 태그 — 등급(무료)·직군·태스크·모델·결과물타입
    expect(screen.getByText("무료")).toBeInTheDocument();
    expect(screen.getByText("학생")).toBeInTheDocument();
    expect(screen.getByText("ChatGPT")).toBeInTheDocument();
    expect(screen.getByText("텍스트")).toBeInTheDocument();
  });

  it("추천수·액션은 헤더가 아니라(이미지로 이동) — 헤더엔 액션 버튼이 없다", () => {
    render(<DetailHeader detail={makeDetail()} />);
    expect(screen.queryByRole("button", { name: "추천" })).toBeNull();
    expect(screen.queryByRole("button", { name: "북마크" })).toBeNull();
  });
});

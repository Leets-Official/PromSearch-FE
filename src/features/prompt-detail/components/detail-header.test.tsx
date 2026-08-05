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
    // 태그 — 직군·태스크·모델·결과물타입 (게시글 타입 무료/프리미엄은 태그로 쓰지 않는다)
    expect(screen.queryByText("무료")).toBeNull();
    expect(screen.getByText("학생")).toBeInTheDocument();
    expect(screen.getByText("ChatGPT")).toBeInTheDocument();
    expect(screen.getByText("텍스트")).toBeInTheDocument();
  });

  it("추천수·액션은 헤더가 아니라(이미지로 이동) — 헤더엔 액션 버튼이 없다", () => {
    render(<DetailHeader detail={makeDetail()} />);
    expect(screen.queryByRole("button", { name: "추천" })).toBeNull();
    expect(screen.queryByRole("button", { name: "북마크" })).toBeNull();
  });

  it("작성자 등급이 오면 닉네임 옆에 표기형으로 보여준다", () => {
    // 서버는 대문자 enum 을 준다(gradeName: "PRIME") → 화면은 "Prime"
    render(
      <DetailHeader detail={makeDetail({ author: { name: "프롬프트장인", grade: "PRIME" } })} />,
    );
    expect(screen.getByText("Prime")).toBeInTheDocument();
  });

  it("등급이 없으면(구버전 응답) 등급 자리를 그리지 않는다", () => {
    render(<DetailHeader detail={makeDetail({ author: { name: "프롬프트장인" } })} />);
    expect(screen.queryByText("Prime")).toBeNull();
    expect(screen.getByText("프롬프트장인")).toBeInTheDocument();
  });
});

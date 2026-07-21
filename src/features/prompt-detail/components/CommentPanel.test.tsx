import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CommentPanel } from "@/features/prompt-detail/components/CommentPanel";
import { makeComment } from "@/features/prompt-detail/test-fixtures";

describe("CommentPanel", () => {
  it("댓글이 없으면 빈 상태 안내", () => {
    render(<CommentPanel comments={[]} />);
    expect(screen.getByText(/아직 작성된 댓글이 없어요/)).toBeInTheDocument();
  });

  it("작성자 배지를 노출한다", () => {
    render(
      <CommentPanel comments={[makeComment({ isAuthor: true, author: { name: "글쓴이" } })]} />,
    );
    expect(screen.getByText("글쓴이")).toBeInTheDocument();
    expect(screen.getByText("작성자")).toBeInTheDocument();
  });

  it("블라인드 댓글은 본문 대신 안내문을 노출한다", () => {
    render(<CommentPanel comments={[makeComment({ isBlinded: true, body: "원래내용" })]} />);
    expect(screen.getByText("블라인드 처리된 댓글입니다.")).toBeInTheDocument();
    expect(screen.queryByText("원래내용")).toBeNull();
  });

  it("대댓글은 'N개의 답글' 토글로 펼친다", async () => {
    const user = userEvent.setup();
    const comment = makeComment({
      body: "부모 댓글",
      replies: [
        makeComment({ id: "r1", body: "대댓글1" }),
        makeComment({ id: "r2", body: "대댓글2" }),
      ],
    });
    render(<CommentPanel comments={[comment]} />);

    // 처음엔 접힘 — 대댓글 안 보임
    expect(screen.queryByText("대댓글1")).toBeNull();

    await user.click(screen.getByRole("button", { name: /2개의 답글/ }));
    expect(screen.getByText("대댓글1")).toBeInTheDocument();
    expect(screen.getByText("대댓글2")).toBeInTheDocument();
  });
});

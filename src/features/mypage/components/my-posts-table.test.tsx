import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { MyPostsTable } from "@/features/mypage/components/my-posts-table";
import type { MyPost } from "@/mocks/data/mypage";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

function makePost(overrides: Partial<MyPost> = {}): MyPost {
  return {
    id: "post-1",
    title: "테스트 게시글",
    date: "2026.07.12",
    thumbnailUrl: "",
    outputType: "text",
    model: "chatgpt",
    tasks: [],
    jobCategories: [],
    tier: "free",
    author: { name: "작성자이름" },
    stats: { views: 1821, copies: 132, likes: 1906 },
    createdAt: "2026-07-12T00:00:00.000Z",
    status: "published",
    ...overrides,
  };
}

describe("MyPostsTable", () => {
  beforeEach(() => push.mockClear());

  it("게시물이 있으면 제목·조회·추천을 렌더한다", () => {
    render(<MyPostsTable posts={[makePost({ title: "마케팅 카피 프롬프트" })]} />);

    expect(screen.getByText("마케팅 카피 프롬프트")).toBeInTheDocument();
    expect(screen.getByText("1,821")).toBeInTheDocument();
    expect(screen.getByText("1,906")).toBeInTheDocument();
  });

  it("게시물이 없으면 빈 상태 문구를 보여준다", () => {
    render(<MyPostsTable posts={[]} />);

    expect(screen.getByText("게시물이 없습니다.")).toBeInTheDocument();
  });

  it("행을 클릭하면 상세 경로로 이동한다", async () => {
    const user = userEvent.setup();
    render(<MyPostsTable posts={[makePost({ id: "post-42" })]} />);

    await user.click(screen.getByText("테스트 게시글"));

    expect(push).toHaveBeenCalledWith("/prompts/post-42");
  });

  it("showActions=false 면 수정/삭제 버튼이 없다", () => {
    render(<MyPostsTable posts={[makePost()]} />);

    expect(screen.queryByRole("button", { name: "수정" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "삭제" })).not.toBeInTheDocument();
  });

  it("showActions=true: 수정 클릭 시 onEdit 호출 + 행 이동은 하지 않는다", async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<MyPostsTable posts={[makePost({ id: "post-7" })]} showActions onEdit={onEdit} />);

    await user.click(screen.getByRole("button", { name: "수정" }));

    expect(onEdit).toHaveBeenCalledWith("post-7");
    expect(push).not.toHaveBeenCalled();
  });

  it("showActions=true: 삭제 클릭 시 onDelete 호출 + 행 이동은 하지 않는다", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(<MyPostsTable posts={[makePost({ id: "post-9" })]} showActions onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: "삭제" }));

    expect(onDelete).toHaveBeenCalledWith("post-9");
    expect(push).not.toHaveBeenCalled();
  });
});

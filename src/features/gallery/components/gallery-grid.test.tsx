import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GalleryGrid } from "@/features/gallery/components/gallery-grid";
import type { PromptSummary } from "@/features/gallery/types";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children?: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock("@/analytics/track", () => ({ track: vi.fn() }));

function makePrompt(id: string, title: string): PromptSummary {
  return {
    id,
    title,
    outputType: "text",
    model: "chatgpt",
    tasks: ["ppt"],
    jobCategories: ["student"],
    tier: "free",
    author: { name: "작성자" },
    stats: { views: 0, copies: 0, likes: 0 },
    createdAt: "2026-07-01T00:00:00.000Z",
  };
}

describe("GalleryGrid", () => {
  it("프롬프트가 있으면 카드 목록을 렌더한다", () => {
    const prompts = [makePrompt("a", "카드 A"), makePrompt("b", "카드 B")];

    render(<GalleryGrid prompts={prompts} userStatus="anonymous" />);

    expect(screen.getByText("카드 A")).toBeInTheDocument();
    expect(screen.getByText("카드 B")).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("빈 목록이면 빈 상태를 노출하고 카드는 렌더하지 않는다", () => {
    const onResetFilters = vi.fn();

    render(<GalleryGrid prompts={[]} userStatus="anonymous" onResetFilters={onResetFilters} />);

    expect(screen.getByText("조건에 맞는 프롬프트가 없어요")).toBeInTheDocument();
    // 부정: 카드 링크가 하나도 없어야 한다
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

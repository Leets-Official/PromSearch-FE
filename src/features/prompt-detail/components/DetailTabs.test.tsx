import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DetailTabs } from "@/features/prompt-detail/components/DetailTabs";

describe("DetailTabs", () => {
  it("3개 탭을 렌더하고 active 를 aria-selected 로 표시한다", () => {
    render(<DetailTabs active="recipe" onSelect={vi.fn()} />);

    expect(screen.getAllByRole("tab")).toHaveLength(3);
    expect(screen.getByRole("tab", { name: "레시피" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "설명" })).toHaveAttribute("aria-selected", "false");
  });

  it("탭 클릭 → onSelect(value)", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<DetailTabs active="description" onSelect={onSelect} />);

    await user.click(screen.getByRole("tab", { name: "댓글" }));
    expect(onSelect).toHaveBeenCalledWith("comments");
  });
});

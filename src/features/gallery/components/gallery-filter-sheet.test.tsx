import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { GalleryFilterSheet } from "@/features/gallery/components/gallery-filter-sheet";

const setTasks = vi.fn();
const setModels = vi.fn();
const setOutputTypes = vi.fn();
let currentQuery = { tasks: [] as string[], models: [] as string[], outputTypes: [] as string[] };

// URL 쿼리(nuqs) 대신 호출만 검증한다 — 시트의 역할은 "칩 토글 → 필터 갱신"이다.
vi.mock("@/features/gallery/hooks/use-gallery-filters", () => ({
  useGalleryFilters: () => ({
    query: currentQuery,
    setTasks,
    setModels,
    setOutputTypes,
  }),
}));

describe("GalleryFilterSheet", () => {
  beforeEach(() => {
    currentQuery = { tasks: [], models: [], outputTypes: [] };
    vi.clearAllMocks();
  });

  it("세 축(태스크·모델·결과물 타입)을 한 시트에 칩으로 보여준다", async () => {
    render(<GalleryFilterSheet open onOpenChange={() => {}} />);

    expect(await screen.findByText("태스크")).toBeInTheDocument();
    expect(screen.getByText("모델")).toBeInTheDocument();
    expect(screen.getByText("결과물 타입")).toBeInTheDocument();

    // 각 축의 대표 옵션
    expect(screen.getByRole("button", { name: "PPT" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ChatGPT" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "텍스트" })).toBeInTheDocument();
  });

  it("칩을 누르면 해당 축의 필터에 값이 추가된다", async () => {
    const user = userEvent.setup();
    render(<GalleryFilterSheet open onOpenChange={() => {}} />);

    await user.click(await screen.findByRole("button", { name: "PPT" }));
    expect(setTasks).toHaveBeenCalledWith(["ppt"]);

    await user.click(screen.getByRole("button", { name: "Claude" }));
    expect(setModels).toHaveBeenCalledWith(["claude"]);
  });

  it("이미 선택된 칩을 누르면 해제된다", async () => {
    currentQuery = { tasks: ["ppt"], models: [], outputTypes: [] };
    const user = userEvent.setup();
    render(<GalleryFilterSheet open onOpenChange={() => {}} />);

    const chip = await screen.findByRole("button", { name: "PPT" });
    expect(chip).toHaveAttribute("aria-pressed", "true");

    await user.click(chip);
    expect(setTasks).toHaveBeenCalledWith([]);
  });
});

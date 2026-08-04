import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MyPageSidebar } from "@/features/mypage/components/mypage-sidebar";

// usePathname 을 케이스별로 바꿔가며 활성 분기 검증
let mockPathname = "/mypage";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

describe("MyPageSidebar", () => {
  it("네 개의 메뉴 링크를 렌더한다", () => {
    mockPathname = "/mypage";
    render(<MyPageSidebar />);

    expect(screen.getByRole("link", { name: "프로필" })).toHaveAttribute("href", "/mypage");
    expect(screen.getByRole("link", { name: "북마크" })).toHaveAttribute(
      "href",
      "/mypage/bookmarks",
    );
    expect(screen.getByRole("link", { name: "수익" })).toHaveAttribute("href", "/mypage/revenue");
    expect(screen.getByRole("link", { name: "설정" })).toHaveAttribute("href", "/mypage/settings");
  });

  it("/mypage 에서는 프로필만 활성이다", () => {
    mockPathname = "/mypage";
    render(<MyPageSidebar />);

    // 활성 표시는 aria-current="page" 로 노출된다고 가정 (SidebarMenuItem 매핑)
    expect(screen.getByRole("link", { name: "프로필" })).toHaveAttribute("aria-current", "page");
    // 부정: 다른 항목은 활성 아님
    expect(screen.getByRole("link", { name: "북마크" })).not.toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("프로필 하위 경로(/mypage/edit)에서도 프로필이 활성으로 유지된다", () => {
    mockPathname = "/mypage/edit";
    render(<MyPageSidebar />);

    expect(screen.getByRole("link", { name: "프로필" })).toHaveAttribute("aria-current", "page");
  });

  it("/mypage/bookmarks 에서는 북마크가 활성이고 프로필은 아니다", () => {
    mockPathname = "/mypage/bookmarks";
    render(<MyPageSidebar />);

    expect(screen.getByRole("link", { name: "북마크" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "프로필" })).not.toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});

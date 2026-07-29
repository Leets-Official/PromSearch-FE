import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HeaderAuthArea } from "@/features/gallery/components/header-auth-area";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children?: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("HeaderAuthArea", () => {
  it("비회원이면 알림(벨) + 로그인 링크를 노출한다", () => {
    render(<HeaderAuthArea isAuthenticated={false} user={null} />);

    // 개정: 비회원도 알림 벨이 있다
    expect(screen.getByLabelText("알림")).toBeInTheDocument();
    const login = screen.getByRole("link", { name: "로그인" });
    expect(login).toHaveAttribute("href", "/login");
  });

  it("회원이면 알림 + 프로필을 노출하고 로그인 링크는 없다", () => {
    render(<HeaderAuthArea isAuthenticated user={{ name: "홍길동" }} />);

    expect(screen.getByLabelText("알림")).toBeInTheDocument();
    expect(screen.getByText("홍")).toBeInTheDocument(); // 아바타 fallback 이니셜
    // 부정: 회원에겐 로그인 링크가 없어야 한다
    expect(screen.queryByRole("link", { name: "로그인" })).not.toBeInTheDocument();
  });
});

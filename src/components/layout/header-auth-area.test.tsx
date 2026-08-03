import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { HeaderAuthArea } from "@/components/layout/header-auth-area";

describe("HeaderAuthArea", () => {
  it("비회원이면 알림(벨) + 로그인 버튼을 노출하고, 클릭 시 onLoginClick을 호출한다", async () => {
    const onLoginClick = vi.fn();
    const user = userEvent.setup();
    render(<HeaderAuthArea isAuthenticated={false} user={null} onLoginClick={onLoginClick} />);

    // 개정: 비회원도 알림 벨이 있다
    expect(screen.getByLabelText("알림")).toBeInTheDocument();

    // 로그인은 링크가 아니라 버튼 (클릭 시 모달 오픈 콜백)
    const login = screen.getByRole("button", { name: "로그인" });
    await user.click(login);
    expect(onLoginClick).toHaveBeenCalledTimes(1);
  });

  it("회원이면 알림 + 프로필을 노출하고 로그인 버튼은 없다", () => {
    render(<HeaderAuthArea isAuthenticated user={{ name: "홍길동" }} />);

    expect(screen.getByLabelText("알림")).toBeInTheDocument();
    expect(screen.getByText("홍")).toBeInTheDocument(); // 아바타 fallback 이니셜
    // 부정: 회원에겐 로그인 버튼이 없어야 한다
    expect(screen.queryByRole("button", { name: "로그인" })).not.toBeInTheDocument();
  });
});

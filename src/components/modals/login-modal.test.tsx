import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LoginModal } from "@/components/modals/login-modal";

describe("LoginModal", () => {
  it("open 이면 제목과 입력 필드가 보인다", () => {
    render(<LoginModal open onOpenChange={() => {}} />);

    expect(screen.getByText("로그인이 필요해요")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("아이디")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("비밀번호")).toBeInTheDocument();
  });

  it("open 이 false 면 아무것도 렌더하지 않는다", () => {
    render(<LoginModal open={false} onOpenChange={() => {}} />);

    expect(screen.queryByText("로그인이 필요해요")).not.toBeInTheDocument();
  });

  it("아이디·비밀번호를 입력하고 제출하면 onLogin 에 입력값을 전달한다", async () => {
    const onLogin = vi.fn();
    const user = userEvent.setup();
    render(<LoginModal open onOpenChange={() => {}} onLogin={onLogin} />);

    await user.type(screen.getByPlaceholderText("아이디"), "testuser");
    await user.type(screen.getByPlaceholderText("비밀번호"), "pw1234");
    await user.click(screen.getByRole("button", { name: "로그인" }));

    expect(onLogin).toHaveBeenCalledTimes(1);
    expect(onLogin).toHaveBeenCalledWith("testuser", "pw1234");
  });

  it("회원가입·소셜 로그인 버튼은 각각의 콜백을 호출한다", async () => {
    const onSignUp = vi.fn();
    const onGoogleLogin = vi.fn();
    const onKakaoLogin = vi.fn();
    const user = userEvent.setup();
    render(
      <LoginModal
        open
        onOpenChange={() => {}}
        onSignUp={onSignUp}
        onGoogleLogin={onGoogleLogin}
        onKakaoLogin={onKakaoLogin}
      />,
    );

    await user.click(screen.getByRole("button", { name: "회원가입" }));
    await user.click(screen.getByRole("button", { name: "구글로 시작하기" }));
    await user.click(screen.getByRole("button", { name: "카카오로 시작하기" }));

    expect(onSignUp).toHaveBeenCalledTimes(1);
    expect(onGoogleLogin).toHaveBeenCalledTimes(1);
    expect(onKakaoLogin).toHaveBeenCalledTimes(1);
  });

  it("닫기 버튼을 누르면 onOpenChange(false) 를 호출한다", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<LoginModal open onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole("button", { name: "닫기" }));

    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange.mock.calls[0][0]).toBe(false);
  });
});

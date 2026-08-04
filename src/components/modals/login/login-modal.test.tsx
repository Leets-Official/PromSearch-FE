import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LoginModal } from "@/components/modals/login/login-modal";

describe("LoginModal", () => {
  it("open 이면 제목과 입력 필드가 보인다", () => {
    render(<LoginModal open onOpenChange={() => {}} />);

    expect(screen.getByRole("heading", { name: "로그인" })).toBeInTheDocument();
    expect(screen.getByLabelText("아이디")).toBeInTheDocument();
    expect(screen.getByLabelText("비밀번호")).toBeInTheDocument();
  });

  it("open 이 false 면 아무것도 렌더하지 않는다", () => {
    render(<LoginModal open={false} onOpenChange={() => {}} />);
    expect(screen.queryByRole("heading", { name: "로그인" })).not.toBeInTheDocument();
  });

  it("올바른 형식으로 입력하고 제출하면 onLogin 에 값을 전달한다", async () => {
    const onLogin = vi.fn();
    const user = userEvent.setup();
    render(<LoginModal open onOpenChange={() => {}} onLogin={onLogin} />);

    // 형식 검증을 통과하는 값 (이메일 형식 + 비번 8~20자·2종 조합)
    await user.type(screen.getByLabelText("아이디"), "user@example.com");
    await user.type(screen.getByLabelText("비밀번호"), "abcd1234");
    await user.click(screen.getByRole("button", { name: "로그인" }));

    expect(onLogin).toHaveBeenCalledWith("user@example.com", "abcd1234");
  });

  it("이메일 형식이 아니면 에러를 보여주고 onLogin 을 호출하지 않는다", async () => {
    const onLogin = vi.fn();
    const user = userEvent.setup();
    render(<LoginModal open onOpenChange={() => {}} onLogin={onLogin} />);

    await user.type(screen.getByLabelText("아이디"), "notanemail");
    await user.type(screen.getByLabelText("비밀번호"), "abcd1234");
    await user.click(screen.getByRole("button", { name: "로그인" }));

    expect(screen.getByText("이메일 형식으로 입력해주세요.")).toBeInTheDocument();
    expect(onLogin).not.toHaveBeenCalled();
  });

  it("비밀번호 형식이 틀리면 에러를 보여주고 onLogin 을 호출하지 않는다", async () => {
    const onLogin = vi.fn();
    const user = userEvent.setup();
    render(<LoginModal open onOpenChange={() => {}} onLogin={onLogin} />);

    await user.type(screen.getByLabelText("아이디"), "user@example.com");
    await user.type(screen.getByLabelText("비밀번호"), "abcdefgh"); // 영문만 → 2종 미달
    await user.click(screen.getByRole("button", { name: "로그인" }));

    expect(onLogin).not.toHaveBeenCalled();
    // 비밀번호 에러 메시지 노출
    expect(
      screen.getByText("영문·숫자·특수문자 중 2가지 이상을 조합해주세요."),
    ).toBeInTheDocument();
  });

  it("서버 에러(error prop)를 폼에 표시한다", () => {
    render(
      <LoginModal open onOpenChange={() => {}} error="아이디 또는 비밀번호가 일치하지 않습니다." />,
    );
    expect(screen.getByText("아이디 또는 비밀번호가 일치하지 않습니다.")).toBeInTheDocument();
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

    // 모바일(ChevronLeftIcon, sm:hidden)과 데스크톱(XIcon, hidden sm:flex)
    // 두 개의 "닫기" 버튼이 CSS 반응형 클래스로만 구분되어 jsdom에는 둘 다 존재한다.
    // aria-label만으로는 구분이 안 되므로, 실제로 "닫기(X)" 동작을 하는
    // 데스크톱 버튼을 data-icon="x" 로 특정해서 클릭한다.
    const closeButtons = screen.getAllByRole("button", { name: "닫기" });
    const desktopCloseButton = closeButtons.find((button) =>
      button.querySelector('[data-icon="x"]'),
    );

    expect(desktopCloseButton).toBeDefined();
    await user.click(desktopCloseButton!);

    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange.mock.calls[0][0]).toBe(false);
  });
});

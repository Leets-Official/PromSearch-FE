import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MobileNavDrawer } from "@/components/layout/mobile-nav-drawer";

// 드로어는 이제 메뉴를 children 으로 받는다. 실제 CategoryNav/MyPageSidebar 대신
// 링크 하나짜리 스텁을 넣어 드로어 자체 동작(열림/닫기/프로필 분기)만 검증한다.
function NavStub() {
  return (
    <nav data-slot="sidebar">
      <a href="/home?nav=popular">인기 프롬프트</a>
    </nav>
  );
}

function renderDrawer(props: Partial<React.ComponentProps<typeof MobileNavDrawer>> = {}) {
  const onOpenChange = vi.fn();
  const onLoginClick = vi.fn();
  render(
    <MobileNavDrawer
      open
      onOpenChange={onOpenChange}
      isAuthenticated={false}
      user={null}
      onLoginClick={onLoginClick}
      {...props}
    >
      {props.children ?? <NavStub />}
    </MobileNavDrawer>,
  );
  return { onOpenChange, onLoginClick };
}

describe("MobileNavDrawer", () => {
  it("열리면 메뉴와 닫기 버튼을 렌더한다", async () => {
    renderDrawer();

    expect(await screen.findByLabelText("메뉴 닫기")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "인기 프롬프트" })).toBeInTheDocument();
  });

  it("비회원이면 '로그인'을 보여주고, 클릭 시 드로어를 닫고 로그인 모달을 연다", async () => {
    const user = userEvent.setup();
    const { onOpenChange, onLoginClick } = renderDrawer();

    await user.click(await screen.findByRole("button", { name: /로그인/ }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onLoginClick).toHaveBeenCalledOnce();
  });

  it("회원이면 이름을 보여주고, 프로필은 마이페이지 링크다", async () => {
    const user = userEvent.setup();
    const { onOpenChange, onLoginClick } = renderDrawer({
      isAuthenticated: true,
      user: { name: "홍길동" },
    });

    const profile = await screen.findByRole("link", { name: "마이페이지" });
    expect(profile).toHaveAttribute("href", "/mypage");
    expect(screen.getByText("홍길동")).toBeInTheDocument();

    await user.click(profile);

    // 링크라 드로어가 닫히고, 로그인 모달은 뜨지 않는다
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onLoginClick).not.toHaveBeenCalled();
  });

  it("메뉴 링크를 누르면 드로어가 닫힌다", async () => {
    const user = userEvent.setup();
    const { onOpenChange } = renderDrawer();

    await user.click(await screen.findByRole("link", { name: "인기 프롬프트" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("닫기 버튼으로 닫힌다", async () => {
    const user = userEvent.setup();
    const { onOpenChange } = renderDrawer();

    await user.click(await screen.findByLabelText("메뉴 닫기"));

    // base-ui 는 onOpenChange(open, eventDetails) 로 2개 인자를 넘긴다
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything()));
  });
});

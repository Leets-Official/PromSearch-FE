import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MobileNavDrawer } from "@/components/layout/mobile-nav-drawer";

// CategoryNav 는 next/navigation(usePathname) + nuqs 필터에 의존한다.
// 드로어 자체의 동작(열림/닫기/프로필 분기)만 검증하면 되므로 목으로 대체한다.
vi.mock("@/features/gallery/components/category-nav", () => ({
  CategoryNav: () => (
    <nav data-slot="sidebar">
      <a href="/home?nav=popular">인기 프롬프트</a>
    </nav>
  ),
}));

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
    />,
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

  it("회원이면 이름을 보여주고 로그인 모달을 열지 않는다", async () => {
    const user = userEvent.setup();
    const { onLoginClick } = renderDrawer({
      isAuthenticated: true,
      user: { name: "홍길동" },
    });

    const profile = await screen.findByRole("button", { name: /홍길동/ });
    await user.click(profile);

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

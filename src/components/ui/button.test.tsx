import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("children 을 버튼으로 렌더한다", () => {
    render(<Button>클릭</Button>);
    expect(screen.getByRole("button", { name: "클릭" })).toBeInTheDocument();
  });

  it("disabled 상태에서는 클릭 핸들러가 호출되지 않는다", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button disabled onClick={onClick}>
        비활성
      </Button>,
    );

    const button = screen.getByRole("button", { name: "비활성" });
    expect(button).toBeDisabled();

    await user.click(button).catch(() => {});
    expect(onClick).not.toHaveBeenCalled();
  });

  it("aria-pressed 로 선택 상태(필터 칩)를 표현할 수 있다", () => {
    render(
      <Button variant="neutral" aria-pressed>
        디자인
      </Button>,
    );
    expect(screen.getByRole("button", { name: "디자인" })).toHaveAttribute("aria-pressed", "true");
  });
});

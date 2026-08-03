import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

function CheckboxHarness() {
  const [checked, setChecked] = useState(false);
  return <Checkbox checked={checked} onCheckedChange={setChecked} aria-label="약관 동의" />;
}

function SwitchHarness() {
  const [checked, setChecked] = useState(false);
  return <Switch checked={checked} onCheckedChange={setChecked} aria-label="알림 받기" />;
}

describe("Checkbox", () => {
  it("클릭하면 체크 상태가 토글된다", async () => {
    const user = userEvent.setup();
    render(<CheckboxHarness />);

    const checkbox = screen.getByRole("checkbox", { name: "약관 동의" });
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("disabled 면 클릭해도 변하지 않는다", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox disabled onCheckedChange={onCheckedChange} aria-label="비활성" />);

    await user.click(screen.getByRole("checkbox", { name: "비활성" }));

    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("indeterminate 상태를 노출한다", () => {
    render(<Checkbox indeterminate checked={false} aria-label="전체 동의" />);

    expect(screen.getByRole("checkbox", { name: "전체 동의" })).toBePartiallyChecked();
  });
});

describe("Switch", () => {
  it("클릭하면 on/off 가 토글된다", async () => {
    const user = userEvent.setup();
    render(<SwitchHarness />);

    const toggle = screen.getByRole("switch", { name: "알림 받기" });
    expect(toggle).not.toBeChecked();

    await user.click(toggle);
    expect(toggle).toBeChecked();
  });

  it("disabled 면 클릭해도 변하지 않는다", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch disabled onCheckedChange={onCheckedChange} aria-label="비활성 토글" />);

    await user.click(screen.getByRole("switch", { name: "비활성 토글" }));

    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});

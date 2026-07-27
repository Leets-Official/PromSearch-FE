import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TextField } from "@/components/ui/text-field";

describe("TextField", () => {
  it("타이틀과 필수(*) 를 렌더한다", () => {
    render(<TextField title="제목" required />);
    expect(screen.getByText("제목")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("maxLength 지정 시 글자수 카운터를 노출하고 입력에 따라 갱신된다", async () => {
    const user = userEvent.setup();
    render(<TextField maxLength={200} placeholder="입력" />);

    expect(screen.getByText("0/200")).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText("입력"), "안녕");
    expect(screen.getByText("2/200")).toBeInTheDocument();
  });

  it("submitLabel 이 없으면 등록 버튼은 표시되지 않는다(기본 off)", () => {
    render(<TextField placeholder="입력" />);
    expect(screen.queryByRole("button", { name: "등록" })).toBeNull();
  });

  it("submitLabel 을 주면 등록 버튼 노출 + 클릭 시 onSubmit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TextField submitLabel="등록" onSubmit={onSubmit} placeholder="입력" />);

    await user.click(screen.getByRole("button", { name: "등록" }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("error 상태면 캡션을 노출하고 카운터는 숨긴다", () => {
    render(<TextField state="error" caption="에러 메시지" maxLength={100} />);
    expect(screen.getByText("에러 메시지")).toBeInTheDocument();
    expect(screen.queryByText("0/100")).toBeNull();
  });
});

import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ConfirmModal } from "@/components/ui/confirm-modal";

function Harness({ onConfirm, onCancel }: { onConfirm: () => void; onCancel?: () => void }) {
  const [open, setOpen] = useState(true);
  return (
    <ConfirmModal
      open={open}
      onOpenChange={setOpen}
      title="임시저장을 삭제할까요?"
      description="삭제하면 되돌릴 수 없습니다."
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

describe("ConfirmModal", () => {
  it("제목/설명과 확인·취소 버튼을 렌더한다", async () => {
    render(<Harness onConfirm={() => {}} />);

    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("임시저장을 삭제할까요?")).toBeInTheDocument();
    expect(screen.getByText("삭제하면 되돌릴 수 없습니다.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "확인" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
  });

  it("확인 클릭 시 onConfirm 을 호출한다", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<Harness onConfirm={onConfirm} />);

    await user.click(await screen.findByRole("button", { name: "확인" }));

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("취소 클릭 시 onCancel 호출 후 닫힌다", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<Harness onConfirm={() => {}} onCancel={onCancel} />);

    await user.click(await screen.findByRole("button", { name: "취소" }));

    expect(onCancel).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });

  it("바깥 클릭으로는 닫히지 않는다 (실수 방지)", async () => {
    const user = userEvent.setup();
    render(<Harness onConfirm={() => {}} />);

    await screen.findByRole("alertdialog");
    await user.click(document.body);

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });
});

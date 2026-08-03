import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function renderDialog() {
  return render(
    <Dialog>
      <DialogTrigger render={<Button>열기</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>로그인이 필요해요</DialogTitle>
          <DialogDescription>프롬프트를 복사하려면 로그인해 주세요.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="neutral">다음에</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>,
  );
}

describe("Dialog", () => {
  it("트리거 클릭으로 열리고 제목/설명을 렌더한다", async () => {
    const user = userEvent.setup();
    renderDialog();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "열기" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("로그인이 필요해요")).toBeInTheDocument();
    expect(screen.getByText("프롬프트를 복사하려면 로그인해 주세요.")).toBeInTheDocument();
  });

  it("초기 포커스가 팝업 컨테이너로 간다 (긴 모달 열림 시 바닥 스크롤 회귀 방지)", async () => {
    // 기본 initialFocus(첫 tabbable 요소)는 푸터 버튼으로 포커스가 가면서
    // 스크롤되는 긴 모달이 열리자마자 바닥까지 내려가는 버그가 있다.
    // DialogContent 는 팝업 자신을 기본 포커스 대상으로 지정한다.
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "열기" }));
    const dialog = await screen.findByRole("dialog");

    await waitFor(() => expect(dialog).toHaveFocus());
  });

  it("body 밖 포털로 렌더된다", async () => {
    const user = userEvent.setup();
    const { container } = renderDialog();

    await user.click(screen.getByRole("button", { name: "열기" }));
    const dialog = await screen.findByRole("dialog");

    // 렌더 루트(container) 내부가 아니라 document.body 쪽 포털에 떠야 한다
    expect(container).not.toContainElement(dialog);
    expect(document.body).toContainElement(dialog);
  });

  it("ESC 로 닫힌다", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "열기" }));
    await screen.findByRole("dialog");

    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("DialogClose 버튼으로 닫힌다", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "열기" }));
    await screen.findByRole("dialog");

    await user.click(screen.getByRole("button", { name: "다음에" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});

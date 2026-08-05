import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ReportModal } from "@/features/prompt-detail/components/report-modal";

/**
 * 신고 모달.
 *
 * 첫 테스트는 **HTML 중첩 회귀 방지용**이다. 사유 라디오(`<fieldset>`)를 `ConfirmModal` 의
 * `description` 에 넣던 시절, 그게 base-ui 의 `<p>`(aria-describedby 대상) 안으로 들어가
 * 브라우저가 `<p>` 를 강제로 닫았고 하이드레이션 불일치가 났다. 지금은 `children` 슬롯에 있다.
 * React 는 개발 모드에서 이런 중첩을 console.error 로 알려 주므로 그걸 실패 조건으로 삼는다.
 */
describe("ReportModal", () => {
  // console.error 를 삼키면서 내용은 모아 둔다(React 의 중첩 경고가 여기로 온다).
  const consoleErrors: string[] = [];

  beforeEach(() => {
    consoleErrors.length = 0;
    vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      consoleErrors.push(args.map(String).join(" "));
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function open(onConfirm = vi.fn()) {
    render(
      <ReportModal open onOpenChange={vi.fn()} target="게시글" onConfirm={onConfirm} />, //
    );
    return onConfirm;
  }

  it("유효하지 않은 HTML 중첩 경고 없이 렌더된다", () => {
    open();

    const nesting = consoleErrors.filter((msg) =>
      /cannot be a descendant|cannot contain a nested|validateDOMNesting/i.test(msg),
    );

    expect(nesting, `React DOM 중첩 경고:\n${nesting.join("\n")}`).toEqual([]);
  });

  it("사유를 고르기 전에는 신고할 수 없고, 고르면 사유·상세를 넘긴다", async () => {
    const user = userEvent.setup();
    const onConfirm = open();

    const submit = screen.getByRole("button", { name: "신고하기" });
    expect(submit).toBeDisabled();

    await user.click(screen.getByRole("radio", { name: "스팸·광고" }));
    await user.type(screen.getByLabelText("상세 사유"), "도배성 게시글입니다");
    expect(submit).toBeEnabled();

    await user.click(submit);
    expect(onConfirm).toHaveBeenCalledWith("SPAM", "도배성 게시글입니다");
  });
});

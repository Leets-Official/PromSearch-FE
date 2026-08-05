import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ReportModal } from "@/features/prompt-detail/components/report-modal";
import { server } from "@/mocks/server";

const REPORT_URL = "/api/v1/reports/posts/:id";

/**
 * 신고 모달.
 *
 * 지키려는 것 두 가지.
 * 1. **HTML 중첩** — 사유 라디오(`<fieldset>`)를 `ConfirmModal` 의 `description` 에 넣던 시절,
 *    그게 base-ui 의 `<p>`(aria-describedby 대상) 안으로 들어가 브라우저가 `<p>` 를 강제로
 *    닫았고 하이드레이션 불일치가 났다. 지금은 `children` 슬롯에 있다. React 가 개발 모드에서
 *    내는 중첩 경고(사용자가 콘솔에서 본 그 검사)를 실패 조건으로 삼는다.
 * 2. **실패 피드백** — 예전에는 호출부가 `mutate` 하고 곧바로 모달을 닫아, 서버가
 *    `MODERATION-004 이미 신고한 대상입니다.` 로 거절해도 화면에 아무 일도 일어나지 않았다.
 *    지금은 성공해야 닫고, 실패하면 열어 둔 채 서버 문구를 보여 준다.
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

  function open() {
    const onOpenChange = vi.fn();
    const onReported = vi.fn();
    const client = new QueryClient({
      // 재시도가 켜져 있으면 실패 문구가 뜨기까지 지연이 붙는다
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    render(
      <ReportModal
        open
        onOpenChange={onOpenChange}
        target="post"
        targetId="post-1"
        onReported={onReported}
      />,
      { wrapper },
    );
    return { onOpenChange, onReported };
  }

  /** 사유 택1 + 상세 입력 후 신고 버튼 클릭 */
  async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
    const submit = screen.getByRole("button", { name: /신고/ });
    expect(submit).toBeDisabled(); // 사유를 고르기 전에는 보낼 수 없다

    await user.click(screen.getByRole("radio", { name: "스팸·광고" }));
    await user.type(screen.getByLabelText("상세 사유"), "도배성 게시글입니다");
    expect(submit).toBeEnabled();

    await user.click(submit);
  }

  it("유효하지 않은 HTML 중첩 경고 없이 렌더된다", () => {
    open();

    const nesting = consoleErrors.filter((msg) =>
      /cannot be a descendant|cannot contain a nested|validateDOMNesting/i.test(msg),
    );

    expect(nesting, `React DOM 중첩 경고:\n${nesting.join("\n")}`).toEqual([]);
  });

  it("접수에 성공하면 모달을 닫고 onReported 를 호출한다", async () => {
    const user = userEvent.setup();
    let received: unknown = null;
    server.use(
      http.post(REPORT_URL, async ({ request }) => {
        received = await request.json();
        return HttpResponse.json({ success: true, code: "COMMON-200", message: "성공했습니다." });
      }),
    );

    const { onOpenChange, onReported } = open();
    await fillAndSubmit(user);

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(onReported).toHaveBeenCalled();
    expect(received).toMatchObject({ reason: "SPAM", description: "도배성 게시글입니다" });
  });

  it("이미 신고한 대상이면 모달을 닫지 않고 서버 문구를 보여준다", async () => {
    const user = userEvent.setup();
    server.use(
      http.post(REPORT_URL, () =>
        HttpResponse.json(
          { success: false, code: "MODERATION-004", message: "이미 신고한 대상입니다." },
          { status: 409 },
        ),
      ),
    );

    const { onOpenChange, onReported } = open();
    await fillAndSubmit(user);

    expect(await screen.findByRole("alert")).toHaveTextContent("이미 신고한 대상입니다.");
    // 실패했는데 닫히면 사용자는 접수된 줄 안다 — 그게 원래 버그였다
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(onReported).not.toHaveBeenCalled();
  });
});

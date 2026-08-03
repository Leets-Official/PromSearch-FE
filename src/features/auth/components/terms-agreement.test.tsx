import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TermsAgreement } from "@/features/auth/components/terms-agreement";
import { TERMS } from "@/features/auth/constants/terms";

describe("TermsAgreement", () => {
  it("전체 동의를 누르면 모든 약관 id가 onChange로 전달된다", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TermsAgreement agreed={new Set()} onChange={onChange} />);

    await user.click(screen.getByText("약관 전체 동의하기"));

    const passed = onChange.mock.calls[0][0] as Set<string>;
    expect(passed.size).toBe(TERMS.length);
    TERMS.forEach((t) => expect(passed.has(t.id)).toBe(true));
  });

  it("전체 동의된 상태에서 전체 동의를 누르면 모두 해제된다", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const all = new Set(TERMS.map((t) => t.id));
    render(<TermsAgreement agreed={all} onChange={onChange} />);

    await user.click(screen.getByText("약관 전체 동의하기"));

    expect((onChange.mock.calls[0][0] as Set<string>).size).toBe(0);
  });

  it("개별 항목을 누르면 그 id만 토글된다", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TermsAgreement agreed={new Set()} onChange={onChange} />);

    // 첫 번째 약관 라벨 클릭
    await user.click(screen.getByText(TERMS[0].label));

    const passed = onChange.mock.calls[0][0] as Set<string>;
    expect(passed.has(TERMS[0].id)).toBe(true);
    expect(passed.size).toBe(1);
  });

  it("필수 약관에는 '필수', 선택 약관에는 '선택' 뱃지가 표시된다", () => {
    render(<TermsAgreement agreed={new Set()} onChange={() => {}} />);
    // TERMS에 required가 하나 이상 있다는 전제
    expect(screen.getAllByText("필수").length).toBeGreaterThan(0);
    expect(screen.getAllByText("선택").length).toBeGreaterThan(0);
  });
});

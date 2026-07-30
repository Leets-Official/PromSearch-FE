import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { OnboardingModal } from "@/components/modals/onboarding/onboarding-modal";

describe("OnboardingModal", () => {
  it("open이 false면 렌더되지 않는다", () => {
    render(<OnboardingModal open={false} onOpenChange={() => {}} />);
    expect(screen.queryByText("닉네임")).not.toBeInTheDocument();
  });

  it("open이면 1단계(프로필/닉네임)가 보인다", () => {
    render(<OnboardingModal open onOpenChange={() => {}} />);
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    expect(screen.getByLabelText("닉네임")).toBeInTheDocument();
  });

  describe("1단계 — 닉네임 검증 상태", () => {
    it("available이면 '사용 가능' 메시지가 뜨고 다음 버튼이 활성화된다", () => {
      render(<OnboardingModal open onOpenChange={() => {}} nicknameStatus="available" />);
      expect(screen.getByText("사용 가능한 닉네임입니다.")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "다음" })).toBeEnabled();
    });

    it("taken이면 '이미 사용 중' 메시지가 뜨고 다음 버튼이 비활성화된다", () => {
      render(<OnboardingModal open onOpenChange={() => {}} nicknameStatus="taken" />);
      expect(screen.getByText("이미 사용 중인 닉네임입니다.")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
    });

    it("checking이면 '확인 중' 메시지가 뜨고 다음 버튼이 비활성화된다", () => {
      render(<OnboardingModal open onOpenChange={() => {}} nicknameStatus="checking" />);
      expect(screen.getByText("확인 중…")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
    });

    it("idle(기본)이면 다음 버튼이 비활성화된다", () => {
      render(<OnboardingModal open onOpenChange={() => {}} />);
      expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
    });

    it("닉네임 입력 시 onNicknameChange가 호출된다", async () => {
      const onNicknameChange = vi.fn();
      const user = userEvent.setup();
      render(<OnboardingModal open onOpenChange={() => {}} onNicknameChange={onNicknameChange} />);

      await user.type(screen.getByLabelText("닉네임"), "김");
      expect(onNicknameChange).toHaveBeenCalledWith("김");
    });
  });

  describe("단계 전환", () => {
    it("available 상태에서 다음을 누르면 2단계(관심 직군/태스크)로 넘어간다", async () => {
      const user = userEvent.setup();
      render(<OnboardingModal open onOpenChange={() => {}} nicknameStatus="available" />);

      await user.click(screen.getByRole("button", { name: "다음" }));

      expect(screen.getByText("2 / 2")).toBeInTheDocument();
      expect(screen.getByText("관심 직군")).toBeInTheDocument();
      expect(screen.getByText("관심 태스크")).toBeInTheDocument();
    });
  });

  describe("2단계 — 관심 선택", () => {
    // 2단계로 진입시키는 헬퍼
    async function goToStep2() {
      const user = userEvent.setup();
      render(<OnboardingModal open onOpenChange={() => {}} nicknameStatus="available" />);
      await user.click(screen.getByRole("button", { name: "다음" }));
      return user;
    }

    it("아무것도 선택하지 않으면 저장 버튼이 비활성화된다", async () => {
      await goToStep2();
      expect(screen.getByRole("button", { name: "저장하고 시작하기" })).toBeDisabled();
    });

    it("직군을 하나 선택하면 저장 버튼이 활성화된다", async () => {
      const user = await goToStep2();
      await user.click(screen.getByRole("button", { name: "학생" }));
      expect(screen.getByRole("button", { name: "저장하고 시작하기" })).toBeEnabled();
    });

    it("태스크는 최대 3개까지만 선택된다 (4번째는 무시)", async () => {
      const user = await goToStep2();
      // 태스크 4개 시도
      for (const name of ["PPT", "레포트", "이메일", "보고서"]) {
        await user.click(screen.getByRole("button", { name }));
      }
      // 4번째("보고서")는 선택되지 않아야 함
      expect(screen.getByRole("button", { name: "보고서" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
      // 앞의 3개는 선택됨
      expect(screen.getByRole("button", { name: "PPT" })).toHaveAttribute("aria-pressed", "true");
    });

    it("저장 시 onComplete에 선택값이 전달된다", async () => {
      const onComplete = vi.fn();
      const user = userEvent.setup();
      render(
        <OnboardingModal
          open
          onOpenChange={() => {}}
          nicknameStatus="available"
          onComplete={onComplete}
        />,
      );
      await user.click(screen.getByRole("button", { name: "다음" }));

      await user.click(screen.getByRole("button", { name: "학생" }));
      await user.click(screen.getByRole("button", { name: "PPT" }));
      await user.click(screen.getByRole("button", { name: "저장하고 시작하기" }));

      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({ jobs: ["학생"], tasks: ["PPT"] }),
      );
    });

    it("'나중에 선택할게요'를 누르면 onSkip이 호출된다", async () => {
      const onSkip = vi.fn();
      const user = userEvent.setup();
      render(
        <OnboardingModal open onOpenChange={() => {}} nicknameStatus="available" onSkip={onSkip} />,
      );
      await user.click(screen.getByRole("button", { name: "다음" }));
      await user.click(screen.getByRole("button", { name: "나중에 선택할게요" }));

      expect(onSkip).toHaveBeenCalledTimes(1);
    });
  });
});

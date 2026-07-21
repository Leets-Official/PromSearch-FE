import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { track } from "@/analytics/track";
import { RecipePanel } from "@/features/prompt-detail/components/RecipePanel";
import type { RecipeAccess } from "@/features/prompt-detail/types";

vi.mock("@/analytics/track", () => ({ track: vi.fn() }));

const writeText = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
});

// userEvent.setup() 이 자체 clipboard 를 설치하므로, setup 이후에 우리 mock 을 덮어씌운다
function stubClipboard() {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
}

function renderPanel(access: RecipeAccess, recipeBody = "레시피 전문 내용입니다") {
  return render(
    <RecipePanel
      promptId="prompt-001"
      recipeBody={recipeBody}
      access={access}
      userStatus="authenticated"
    />,
  );
}

describe("RecipePanel", () => {
  describe("열람(unlocked)", () => {
    it("전문과 복사하기 버튼을 보여주고 잠금 CTA 는 없다", () => {
      renderPanel({ locked: false, reason: null }, "실제 레시피 전문");

      expect(screen.getByText("실제 레시피 전문")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /복사하기/ })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /프롬프트 보기|전문 보기/ })).toBeNull();
    });

    it("복사하기 클릭 → 클립보드 복사 + prompt_copy_click 발송", async () => {
      const user = userEvent.setup();
      stubClipboard();
      renderPanel({ locked: false, reason: null }, "복사될 전문");

      await user.click(screen.getByRole("button", { name: /복사하기/ }));

      expect(writeText).toHaveBeenCalledWith("복사될 전문");
      expect(track).toHaveBeenCalledWith("prompt_copy_click", {
        prompt_id: "prompt-001",
        user_status: "authenticated",
        source: "detail",
      });
    });
  });

  describe("비로그인 잠금(anonymous)", () => {
    it("'로그인하고 프롬프트 보기' CTA + 블러, 복사 버튼 없음", () => {
      const { container } = renderPanel({ locked: true, reason: "anonymous" }, "");

      expect(screen.getByRole("button", { name: /로그인하고 프롬프트 보기/ })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /복사하기/ })).toBeNull();
      // 블러 오버레이가 존재
      expect(container.querySelector("[data-recipe-blur]")).not.toBeNull();
    });

    it("CTA 클릭 → prompt_unlock_click(reason=anonymous)", async () => {
      const user = userEvent.setup();
      renderPanel({ locked: true, reason: "anonymous" }, "");

      await user.click(screen.getByRole("button", { name: /로그인하고 프롬프트 보기/ }));

      expect(track).toHaveBeenCalledWith("prompt_unlock_click", {
        prompt_id: "prompt-001",
        reason: "anonymous",
        user_status: "authenticated",
        source: "detail",
      });
    });
  });

  describe("프리미엄 잠금(premium)", () => {
    it("티저(recipeBody)를 보여주고 '포인트로 전문 보기' CTA", () => {
      renderPanel({ locked: true, reason: "premium", previewLength: 5 }, "앞부분 티저");

      expect(screen.getByText(/앞부분 티저/)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /포인트로 전문 보기/ })).toBeInTheDocument();
    });

    it("CTA 클릭 → prompt_unlock_click(reason=premium)", async () => {
      const user = userEvent.setup();
      renderPanel({ locked: true, reason: "premium", previewLength: 5 }, "티저");

      await user.click(screen.getByRole("button", { name: /포인트로 전문 보기/ }));

      expect(track).toHaveBeenCalledWith("prompt_unlock_click", {
        prompt_id: "prompt-001",
        reason: "premium",
        user_status: "authenticated",
        source: "detail",
      });
    });
  });
});

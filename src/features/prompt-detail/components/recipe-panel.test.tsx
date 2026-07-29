import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { track } from "@/analytics/track";
import { RecipePanel } from "@/features/prompt-detail/components/recipe-panel";
import type { RecipeAccess } from "@/features/prompt-detail/types";

vi.mock("@/analytics/track", () => ({ track: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
});

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
    it("전문을 보여주고 잠금 CTA 는 없다(복사 버튼은 탭 행에서 렌더)", () => {
      renderPanel({ locked: false, reason: null }, "실제 레시피 전문");

      expect(screen.getByText("실제 레시피 전문")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /프롬프트 보기|전문 보기/ })).toBeNull();
    });
  });

  describe("비로그인 잠금(anonymous) — 미리보기 살짝 + 블러", () => {
    it("미리보기(recipeBody)를 보여주고 '로그인하고 프롬프트 보기' CTA + 블러, 복사 없음", () => {
      const { container } = renderPanel(
        { locked: true, reason: "anonymous", previewLength: 10 },
        "비회원 미리보기",
      );

      expect(screen.getByText(/비회원 미리보기/)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /로그인하고 프롬프트 보기/ })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /복사하기/ })).toBeNull();
      expect(container.querySelector("[data-recipe-blur]")).not.toBeNull();
    });

    it("CTA 클릭 → prompt_unlock_click(reason=anonymous)", async () => {
      const user = userEvent.setup();
      renderPanel({ locked: true, reason: "anonymous", previewLength: 10 }, "미리보기");

      await user.click(screen.getByRole("button", { name: /로그인하고 프롬프트 보기/ }));

      expect(track).toHaveBeenCalledWith("prompt_unlock_click", {
        prompt_id: "prompt-001",
        reason: "anonymous",
        user_status: "authenticated",
        source: "detail",
      });
    });
  });

  describe("프리미엄 잠금(premium) — 전체 블러", () => {
    it("'포인트로 전문 보기' CTA + 전체 블러, 티저/복사 없음", () => {
      const { container } = renderPanel({ locked: true, reason: "premium" }, "");

      expect(screen.getByRole("button", { name: /포인트로 전문 보기/ })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /복사하기/ })).toBeNull();
      expect(container.querySelector("[data-recipe-blur]")).not.toBeNull();
    });

    it("CTA 클릭 → prompt_unlock_click(reason=premium)", async () => {
      const user = userEvent.setup();
      renderPanel({ locked: true, reason: "premium" }, "");

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

import { describe, expect, it } from "vitest";

import type { ContentTier } from "@/features/gallery/types";
import { DEFAULT_PREVIEW_LENGTH, resolveRecipeAccess } from "./access";
import type { RecipeAccess } from "./types";

// 상세 입력 팩토리 — access 는 기본 미제공(폴백 경로), tier 만 지정
function detail(overrides: { access?: RecipeAccess | null; tier?: ContentTier } = {}) {
  return { tier: "free" as ContentTier, ...overrides };
}

const anonymous = { status: "anonymous" as const };
const authenticated = { status: "authenticated" as const };

describe("resolveRecipeAccess", () => {
  // 핵심 원칙: 응답 access 가 있으면 프론트 계산보다 우선한다(BE 권한 단일 출처)
  it("응답 access 가 있으면 그대로 신뢰한다 (비로그인이어도 우선)", () => {
    const given: RecipeAccess = { locked: false, reason: null };
    expect(resolveRecipeAccess(detail({ access: given }), anonymous)).toEqual(given);
  });

  it("응답 access 의 previewLength 를 보존한다", () => {
    const given: RecipeAccess = { locked: true, reason: "premium", previewLength: 50 };
    expect(resolveRecipeAccess(detail({ access: given, tier: "premium" }), authenticated)).toEqual(
      given,
    );
  });

  // 폴백(access 미제공): tier + 인증 상태로 계산
  it("access 없음 + 비로그인 → anonymous 잠금(미리보기 previewLength)", () => {
    expect(resolveRecipeAccess(detail({ tier: "free" }), anonymous)).toEqual({
      locked: true,
      reason: "anonymous",
      previewLength: DEFAULT_PREVIEW_LENGTH,
    });
  });

  it("access 없음 + 로그인 + free → 열람", () => {
    expect(resolveRecipeAccess(detail({ tier: "free" }), authenticated)).toEqual({
      locked: false,
      reason: null,
    });
  });

  it("access 없음 + 로그인 + premium → premium 잠금(전체 블러, previewLength 없음)", () => {
    expect(resolveRecipeAccess(detail({ tier: "premium" }), authenticated)).toEqual({
      locked: true,
      reason: "premium",
    });
  });

  it("access 없음 + 로그인 + master → premium 잠금(마스터도 전체 블러)", () => {
    expect(resolveRecipeAccess(detail({ tier: "master" }), authenticated)).toEqual({
      locked: true,
      reason: "premium",
    });
  });
});

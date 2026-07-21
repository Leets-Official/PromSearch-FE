import type { AuthStatus } from "@/hooks/use-auth-status";
import type { ContentTier } from "@/features/gallery/types";
import type { RecipeAccess } from "./types";

/** premium 부분 노출 기본 길이(문자 수). 응답 previewLength 가 없을 때 사용 */
export const DEFAULT_PREVIEW_LENGTH = 200;

/**
 * 레시피 잠금 판정을 결정한다.
 *
 * 원칙: **BE 응답 `access` 를 신뢰**한다(우회 방지·권한 단일 출처). 응답에 access 가
 * 있으면 그대로 사용하고, 없을 때만 tier + 인증 상태로 폴백 계산한다.
 *
 * 폴백 규칙:
 * - 비로그인 → 잠금(anonymous)
 * - 로그인 + free → 열람
 * - 로그인 + premium|master → 잠금(premium, previewLength 까지 노출)
 */
export function resolveRecipeAccess(
  detail: { access?: RecipeAccess | null; tier: ContentTier },
  auth: Pick<AuthStatus, "status">,
): RecipeAccess {
  // BE 판정을 최우선 신뢰(권한 단일 출처·우회 방지)
  if (detail.access) {
    return detail.access;
  }

  // 폴백: 응답에 access 가 없을 때만 tier + 인증으로 계산
  if (auth.status === "anonymous") {
    return { locked: true, reason: "anonymous" };
  }

  // 로그인 상태: free 는 열람, premium/master 는 포인트 잠금
  if (detail.tier === "free") {
    return { locked: false, reason: null };
  }

  return { locked: true, reason: "premium", previewLength: DEFAULT_PREVIEW_LENGTH };
}

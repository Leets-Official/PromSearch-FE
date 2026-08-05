"use client";

// Sparkles 는 디자인 시스템 세트에 없어 lucide 를 유지한다(시안 추가 시 icons.tsx 로 이동).
import { Sparkles } from "lucide-react";
import { LockIcon } from "@/components/ui/icons";

import { track } from "@/analytics/track";
import type { UserStatus } from "@/analytics/events";
import { Button } from "@/components/ui/button";
import type { RecipeAccess } from "@/features/prompt-detail/types";
import { cn } from "@/lib/utils";

/** 잠금 시 블러 뒤에 깔리는 더미 필러(프론트 상수). BE 전문에 절대 의존하지 않는다. */
export const RECIPE_BLUR_FILLER = `당신은 전문 보고서 작성 도우미입니다. 아래 조건에 맞춰 초안을 작성하세요.
- 대상 독자와 목적을 먼저 정의합니다.
- 핵심 메시지를 3가지로 요약합니다.
- 근거 데이터를 표와 함께 제시합니다.
- 결론과 다음 액션을 명확히 제안합니다.
${"세부 지침이 이어집니다. ".repeat(30)}`;

type RecipePanelProps = {
  promptId: string;
  recipeBody: string;
  access: RecipeAccess;
  userStatus: UserStatus;
  /** 잠금 CTA 클릭 시 실제 흐름(로그인 모달·포인트 결제) — 이번엔 스텁 */
  onUnlock?: (reason: "anonymous" | "premium") => void;
};

export function RecipePanel({
  promptId,
  recipeBody,
  access,
  userStatus,
  onUnlock,
}: RecipePanelProps) {
  const handleUnlock = (reason: "anonymous" | "premium") => {
    track("prompt_unlock_click", {
      prompt_id: promptId,
      reason,
      user_status: userStatus,
      source: "detail",
    });
    onUnlock?.(reason);
  };

  // 열람 가능 — 전문(복사 버튼은 탭 행에서 렌더). 레시피는 회색 박스 배경 유지(Figma 409:8197)
  if (!access.locked) {
    return (
      <div className="w-full rounded-md bg-bg-secondary px-5 py-4">
        <p className="text-body-1 whitespace-pre-wrap text-text-secondary">{recipeBody}</p>
      </div>
    );
  }

  // 잠금 시 CTA 는 사유로 갈린다 — 비회원은 로그인, 프리미엄 미결제는 포인트.
  //
  // 미리보기 노출 여부는 **서버가 본문을 보냈는지**로 판단한다. 잘라 보내는 범위를 서버가 정하고
  // (비회원 → 빈 문자열 / 프리미엄 → 원문 앞 10% 이내·최대 200자), 프론트는 받은 만큼만 보여준다.
  // 프론트가 사유로 미리보기를 켜고 끄면 서버 정책이 바뀔 때마다 어긋난다.
  const isAnonymous = access.reason === "anonymous";
  const showTeaser = recipeBody.length > 0;
  const cta = isAnonymous
    ? { label: "로그인하고 프롬프트 보기", icon: <LockIcon />, reason: "anonymous" as const }
    : { label: "포인트로 전문 보기", icon: <Sparkles />, reason: "premium" as const };

  return (
    <div className="relative flex min-h-[420px] w-full flex-col overflow-hidden rounded-md bg-bg-secondary px-5 py-4">
      <div className="overflow-hidden">
        {showTeaser && recipeBody ? (
          <p className="mb-2 text-body-1 whitespace-pre-wrap text-text-secondary">{recipeBody}</p>
        ) : null}
        {/* 블러 뒤 더미 — 진짜 전문은 DOM에 없다 */}
        <p
          aria-hidden
          className={cn(
            "pointer-events-none text-body-1 whitespace-pre-wrap text-text-secondary select-none",
          )}
        >
          {RECIPE_BLUR_FILLER}
        </p>
      </div>

      {/* 블러 오버레이 — 비회원은 프리뷰 아래(top-16), 프리미엄은 전체(top-2) */}
      <div
        data-recipe-blur
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-2 bottom-2 backdrop-blur-[6px]",
          showTeaser ? "top-16" : "top-2",
        )}
      />

      {/* 중앙 CTA */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Button variant="brand" size="lg" onClick={() => handleUnlock(cta.reason)}>
          <span data-icon="inline-start" className="contents">
            {cta.icon}
          </span>
          {cta.label}
        </Button>
      </div>
    </div>
  );
}

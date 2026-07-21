"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";

/** 상세 탭 — 설명/레시피/댓글 (피그마 3탭) */
export const DETAIL_TABS = ["description", "recipe", "comments"] as const;
export type DetailTab = (typeof DETAIL_TABS)[number];

export const DEFAULT_DETAIL_TAB: DetailTab = "description";

const tabParser = parseAsStringLiteral(DETAIL_TABS).withDefault(DEFAULT_DETAIL_TAB);

/**
 * 활성 탭을 URL(`?tab=`)로 관리한다. 공유·뒤로가기에서 탭이 유지되고,
 * 잘못된 값은 기본 탭(description)으로 폴백한다.
 */
export function useDetailTab(): { tab: DetailTab; setTab: (tab: DetailTab) => void } {
  const [tab, setTab] = useQueryState("tab", tabParser);
  return { tab, setTab: (next: DetailTab) => void setTab(next) };
}

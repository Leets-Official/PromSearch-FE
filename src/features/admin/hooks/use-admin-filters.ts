"use client";

import { useCallback, useMemo } from "react";
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

import type { AdminListQuery } from "@/features/admin/types";

/**
 * 어드민 목록의 탭/검색/페이지 상태를 URL 쿼리로 관리한다(갤러리 필터와 동일 규칙).
 *
 * - **탭·검색이 바뀌면 page 는 항상 1로 리셋**한다(결과 없는 페이지에 갇히지 않도록).
 * - 화면마다 탭 값이 달라(신고: all/hidden/kept, 등급: pending/approved) 탭 목록을 인자로 받는다.
 */
export function useAdminFilters<Tab extends string>(tabs: readonly Tab[], defaultTab: Tab) {
  // 파서 객체는 렌더마다 새로 만들면 nuqs 구독이 계속 갈리므로 메모이즈한다.
  const parsers = useMemo(
    () => ({
      tab: parseAsStringLiteral(tabs).withDefault(defaultTab),
      q: parseAsString.withDefault(""),
      page: parseAsInteger.withDefault(1),
    }),
    [tabs, defaultTab],
  );

  const [state, setState] = useQueryStates(parsers);

  const query: AdminListQuery<Tab> = useMemo(
    // withDefault 가 걸려 있어 tab 은 항상 Tab 이지만, 제네릭이라 nuqs 의 조건부 타입이 풀리지 않는다.
    () => ({ tab: state.tab as Tab, q: state.q, page: state.page }),
    [state],
  );

  const setTab = useCallback(
    (tab: Tab) => {
      void setState({ tab, page: 1 });
    },
    [setState],
  );

  const setSearch = useCallback(
    (q: string) => {
      void setState({ q, page: 1 });
    },
    [setState],
  );

  // 페이지 이동만은 리셋 대상이 아니다
  const setPage = useCallback(
    (page: number) => {
      void setState({ page });
    },
    [setState],
  );

  return { query, setTab, setSearch, setPage };
}

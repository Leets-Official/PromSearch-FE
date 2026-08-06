"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { fetchOriginUsers } from "@/features/admin/api/admin";

/** [ADMIN-GRADE-003] Origin 등급 유저 목록. 서버가 검색·정렬을 지원하지 않아 페이지만 받는다. */
export function useOriginUserList(page: number) {
  return useQuery({
    queryKey: ["admin", "origin-users", page],
    queryFn: () => fetchOriginUsers(page),
    placeholderData: keepPreviousData,
  });
}

"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchMyProfile } from "@/features/auth/api/profile";
import { getAccessToken } from "@/lib/api";

export const MY_PROFILE_KEY = ["users", "me"] as const;

/**
 * 로그인한 사용자의 프로필.
 *
 * 토큰이 있을 때만 조회한다. 여러 화면(헤더·마이페이지)이 동시에 부르지만
 * React Query 가 같은 키로 묶어 요청은 한 번만 나간다.
 */
export function useMyProfile() {
  return useQuery({
    queryKey: MY_PROFILE_KEY,
    queryFn: fetchMyProfile,
    enabled: Boolean(getAccessToken()),
    // 프로필은 자주 바뀌지 않는다. 화면을 옮길 때마다 다시 부르지 않게 한다.
    staleTime: 5 * 60 * 1000,
  });
}

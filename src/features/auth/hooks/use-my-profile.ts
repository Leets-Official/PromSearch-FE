"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchMyProfile } from "@/features/auth/api/profile";

/** [USER-004] 내 프로필 조회 — 마이페이지 전역에서 사용 */
export function useMyProfile() {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: fetchMyProfile,
  });
}

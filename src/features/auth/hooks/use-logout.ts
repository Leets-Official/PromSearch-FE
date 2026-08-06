"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { clearTokens } from "@/lib/api/token-store";
import { logout } from "@/features/auth/api/auth";

export function useLogout() {
  const router = useRouter();
  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      // 서버 로그아웃이 실패해도 클라 토큰은 지운다 — 로컬 세션이라도 끊어야 함
      clearTokens();
      router.push("/");
    },
  });
}

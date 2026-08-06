"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { clearTokens } from "@/lib/api/token-store";

/** [USER-006] 회원 탈퇴 */
function withdraw() {
  return api.delete<void>("/users/me");
}

export function useWithdrawal() {
  const router = useRouter();
  return useMutation({
    mutationFn: withdraw,
    onSuccess: () => {
      clearTokens();
      router.push("/");
    },
  });
}

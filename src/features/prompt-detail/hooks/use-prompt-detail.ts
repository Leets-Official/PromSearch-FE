"use client";

import { useQuery } from "@tanstack/react-query";

import type { UserStatus } from "@/analytics/events";
import { fetchPromptDetail, PromptNotFoundError } from "@/features/prompt-detail/api/prompt-detail";
import { useAuthStatus } from "@/hooks/use-auth-status";

/**
 * 상세 쿼리 키. **뷰어 상태를 포함**해 로그인/로그아웃 시 키가 바뀌어 자동 리페치된다
 * → 잠금 해제(전문 획득)가 인증 전환에 따라온다. 권한 판정 자체는 서버가 토큰으로 한다.
 */
export function promptDetailKey(id: string, viewerStatus: UserStatus) {
  return ["prompt", id, viewerStatus] as const;
}

/**
 * 프롬프트 상세 조회. 없는/비공개 게시글(404 → PromptNotFoundError)은 재시도하지 않는다.
 */
export function usePromptDetail(id: string) {
  const { status } = useAuthStatus();

  return useQuery({
    queryKey: promptDetailKey(id, status),
    queryFn: () => fetchPromptDetail(id),
    retry: (failureCount, error) => !(error instanceof PromptNotFoundError) && failureCount < 2,
  });
}

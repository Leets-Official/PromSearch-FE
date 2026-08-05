"use client";

import { useCallback, useState } from "react";

import { useAuthStatus } from "@/hooks/use-auth-status";

/**
 * 비회원 액션 차단 게이트.
 *
 * 좋아요·북마크·신고·댓글처럼 **로그인이 필요한 동작**을 감싼다. 비회원이 누르면 서버로
 * 보내지 않고 로그인 모달을 연다 — 그냥 보내면 401 이 뜨고 사용자는 이유를 알 수 없다.
 *
 * ```tsx
 * const gate = useAuthGate();
 * <Button onClick={() => gate.run(() => like.mutate(detail.liked))}>좋아요</Button>
 * <LoginModal open={gate.loginOpen} onOpenChange={gate.setLoginOpen} … />
 * ```
 *
 * 권한 경계는 어디까지나 서버다. 여기서 막는 건 **불필요한 실패를 줄이는 UX**다.
 */
export function useAuthGate() {
  const { isAuthenticated } = useAuthStatus();
  const [loginOpen, setLoginOpen] = useState(false);

  /** 로그인 상태면 action 을 실행하고, 아니면 로그인 모달을 연다. */
  const run = useCallback(
    (action: () => void) => {
      if (!isAuthenticated) {
        setLoginOpen(true);
        return;
      }
      action();
    },
    [isAuthenticated],
  );

  return { isAuthenticated, loginOpen, setLoginOpen, run };
}

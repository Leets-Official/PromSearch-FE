"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useAuthStatus } from "@/hooks/use-auth-status";

/**
 * 어드민 접근 게이트 — `isAdmin` 이 아니면 화면 대신 안내를 보여준다.
 *
 * 클라이언트 가드는 UX 용이고 **권한의 최종 근거는 BE**다. 실제 인증이 붙으면
 * 서버(미들웨어/세션)에서도 `/admin/*` 을 막아야 한다(현재는 목이라 BE 검증이 없다).
 * 리다이렉트 대신 안내를 띄우는 이유: 인증 상태가 정해지기 전 리다이렉트가 먼저 터지면
 * 정상 어드민도 튕기기 때문.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuthStatus();

  if (!isAdmin) {
    return (
      <div
        role="alert"
        className="flex w-full flex-col items-center gap-4 py-20 text-center"
        data-slot="admin-forbidden"
      >
        <p className="text-heading-2 text-text-primary">접근 권한이 없어요</p>
        <p className="text-body-2 text-text-secondary">
          어드민 계정으로 로그인해야 이용할 수 있는 화면입니다.
        </p>
        <Button variant="outline" nativeButton={false} render={<Link href="/home" />}>
          홈으로 가기
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

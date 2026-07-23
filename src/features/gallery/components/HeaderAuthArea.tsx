import Link from "next/link";
import { BellIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/hooks/use-auth-status";

/**
 * 헤더 우측 인증 영역 (홈 스코프의 유일한 권한 표시 분기).
 * - 비회원 → 로그인 버튼
 * - 회원   → 알림 + 프로필 아바타
 *
 * 순수 표시 컴포넌트(인증 상태를 prop 으로 받음)라 두 상태를 단독 테스트할 수 있다.
 * 로그인 경로(/login)·프로필 메뉴는 auth/마이페이지 담당의 후속 작업.
 */
type HeaderAuthAreaProps = {
  isAuthenticated: boolean;
  user: AuthUser | null;
};

export function HeaderAuthArea({ isAuthenticated, user }: HeaderAuthAreaProps) {
  // 개정(401:5954): 비회원/회원 모두 알림(벨) 노출. 우측만 로그인 텍스트 ↔ 프로필로 갈린다.
  return (
    <>
      {/* 알림 — Button/Icon 44x44(아이콘 24 + 패딩 10, 배경 없음 → plain) */}
      <Button variant="plain" size="icon" aria-label="알림">
        <BellIcon />
      </Button>

      {isAuthenticated && user ? (
        // 회원: 44px 원형 아바타(Avatar 기본 size md)
        <Avatar>
          {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
      ) : (
        // 비회원: 플레인 텍스트 로그인 링크(시안 401:5954 — 검은 텍스트)
        <Button variant="plain" nativeButton={false} render={<Link href="/login" />}>
          로그인
        </Button>
      )}
    </>
  );
}

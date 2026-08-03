import Link from "next/link";
import { BellIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/hooks/use-auth-status";

/**
 * 헤더 우측 인증 영역 (홈 스코프의 유일한 권한 표시 분기).
 * - 비회원 → 알림 + 로그인 버튼(클릭 시 onLoginClick → 상위에서 로그인 모달 오픈)
 * - 회원   → 알림 + 프로필 아바타(클릭 시 마이페이지로 이동)
 *
 * 순수 표시 컴포넌트(인증 상태·콜백을 prop 으로 받음)라 두 상태를 단독 테스트할 수 있다.
 */
type HeaderAuthAreaProps = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  /** 비회원 로그인 버튼 클릭 → 상위에서 로그인 모달을 연다 */
  onLoginClick?: () => void;
};

export function HeaderAuthArea({ isAuthenticated, user, onLoginClick }: HeaderAuthAreaProps) {
  return (
    <>
      {/* 알림 — Button/Icon 44x44(아이콘 24 + 패딩 10, 배경 없음 → plain) */}
      <Button variant="plain" size="icon" aria-label="알림">
        <BellIcon />
      </Button>

      {isAuthenticated && user ? (
        // 회원: 프로필 아바타 → 마이페이지 이동
        <Link
          href="/mypage"
          aria-label="마이페이지"
          className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Avatar>
            {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
      ) : (
        // 비회원: 로그인 버튼(클릭 시 모달 오픈)
        <Button variant="plain" onClick={onLoginClick}>
          로그인
        </Button>
      )}
    </>
  );
}

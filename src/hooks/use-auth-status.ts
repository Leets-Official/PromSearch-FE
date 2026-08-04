"use client";

import type { UserStatus } from "@/analytics/events";
import { useDevPreview } from "@/components/dev-toolbar/dev-preview-context";

/**
 * 인증 상태 어댑터.
 *
 * 로그인/온보딩은 다른 팀원 담당이다. auth store/세션이 준비되기 전까지 이 훅은
 * 항상 비회원(anonymous)을 반환한다. 실제 인증 소스가 생기면 **이 훅 내부만** 교체하면,
 * 헤더 분기(로그인 버튼 ↔ 프로필)와 analytics `user_status`,
 * 어드민 화면(`/admin/*`) 게이트가 자동으로 따라간다.
 */
export type AuthUser = {
  name: string;
  avatarUrl?: string;
};

export type AuthStatus = {
  status: UserStatus; // "anonymous" | "authenticated"
  isAuthenticated: boolean;
  /** 어드민 권한 — `/admin/*` 접근 가능 여부. BE 연동 시 role/claim 에서 파생. */
  isAdmin: boolean;
  user: AuthUser | null;
};

/**
 * dev 전용 미리보기 토글. 실제 auth 소스가 없는 동안 로그인 헤더(알림+프로필)나
 * 어드민 화면을 눈으로 확인하려고 둔 것. `.env.development` 에서
 * `NEXT_PUBLIC_MOCK_AUTH=authenticated`(회원) / `=admin`(어드민) 로 켠다
 * (기본은 꺼져 있어 비회원). public env 라 서버/클라 값이 같아 hydration 불일치가 없다.
 * 실제 인증이 붙으면 이 분기와 플래그를 함께 제거한다.
 */
const MOCK_AUTH = process.env.NEXT_PUBLIC_MOCK_AUTH;

const MOCK_USER: AuthUser = { name: "홍길동" };
const MOCK_ADMIN: AuthUser = { name: "관리자" };

const AUTHENTICATED: AuthStatus = {
  status: "authenticated",
  isAuthenticated: true,
  isAdmin: false,
  user: MOCK_USER,
};
// 어드민도 analytics 상 "회원"이다(권한만 추가). user_status 축을 늘리지 않는다.
const ADMIN: AuthStatus = {
  status: "authenticated",
  isAuthenticated: true,
  isAdmin: true,
  user: MOCK_ADMIN,
};
const ANONYMOUS: AuthStatus = {
  status: "anonymous",
  isAuthenticated: false,
  isAdmin: false,
  user: null,
};

export function useAuthStatus(): AuthStatus {
  // Dev 툴바가 켜져 있으면 툴바의 인증 축이 최우선(디자이너가 배포 URL에서 직접 전환).
  const dev = useDevPreview();
  if (dev.enabled) {
    if (dev.preview.auth === "admin") return ADMIN;
    return dev.preview.auth === "authenticated" ? AUTHENTICATED : ANONYMOUS;
  }

  // 폴백: 빌드타임 env 토글(실제 auth 소스가 붙으면 이 분기·플래그를 함께 제거).
  if (MOCK_AUTH === "admin") return ADMIN;
  if (MOCK_AUTH === "authenticated") return AUTHENTICATED;
  return ANONYMOUS;
}

"use client";

import { useSyncExternalStore } from "react";

import type { UserStatus } from "@/analytics/events";
import { getAccessToken, onTokensChanged } from "@/lib/api";

/**
 * 인증 상태 어댑터.
 *
 * **실제 토큰 유무로 판정한다.** 로그인/온보딩 화면은 다른 팀원 담당이지만, 토큰 저장소
 * (`lib/api/token-store`)는 이미 공용이라 여기서 바로 읽을 수 있다.
 * 로그인이 붙으면 `setTokens()` 만 호출하면 헤더 분기·액션 게이팅이 자동으로 따라온다.
 *
 * 사용자 정보(닉네임·아바타)는 토큰에 없다. 로그인 응답이나 `GET /users/me` 를 캐시에
 * 넣는 작업이 아직 없어 지금은 `user: null` 이고, 헤더는 기본 아바타를 그린다.
 */
export type AuthUser = {
  name: string;
  avatarUrl?: string;
  /** 등급(예: "Node") — 모바일 드로어 프로필에 닉네임 위로 노출 */
  grade?: string;
};

export type AuthStatus = {
  status: UserStatus; // "anonymous" | "authenticated"
  isAuthenticated: boolean;
  /** 어드민 권한 — `/admin/*` 접근 가능 여부. BE role/claim 연동 전까지는 false. */
  isAdmin: boolean;
  user: AuthUser | null;
};

const ANONYMOUS: AuthStatus = {
  status: "anonymous",
  isAuthenticated: false,
  isAdmin: false,
  user: null,
};

const AUTHENTICATED: AuthStatus = {
  status: "authenticated",
  isAuthenticated: true,
  isAdmin: false,
  user: null,
};

/** 서버 렌더에서는 쿠키를 읽지 않는다 — 첫 페인트는 비회원으로 그리고 마운트 후 맞춘다. */
function getServerSnapshot(): AuthStatus {
  return ANONYMOUS;
}

function getSnapshot(): AuthStatus {
  return getAccessToken() ? AUTHENTICATED : ANONYMOUS;
}

export function useAuthStatus(): AuthStatus {
  return useSyncExternalStore(onTokensChanged, getSnapshot, getServerSnapshot);
}

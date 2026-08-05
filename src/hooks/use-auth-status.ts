"use client";

import { useSyncExternalStore } from "react";

import type { UserStatus } from "@/analytics/events";
import { getAccessToken, onTokensChanged } from "@/lib/api";
import { useMyProfile } from "@/hooks/use-my-profile";

/**
 * 인증 상태 어댑터.
 *
 * **실제 토큰 유무로 판정한다.** 로그인/온보딩 화면은 다른 팀원 담당이지만, 토큰 저장소
 * (`lib/api/token-store`)는 이미 공용이라 여기서 바로 읽을 수 있다.
 * 로그인이 붙으면 `setTokens()` 만 호출하면 헤더 분기·액션 게이팅이 자동으로 따라온다.
 *
 * 사용자 정보(닉네임·아바타)는 토큰에 없어서 `GET /users/me` 로 따로 받는다.
 * 프로필이 아직 안 왔어도 **`isAuthenticated` 는 즉시 true** 다 — 로그인 여부 판정을
 * 네트워크 응답까지 기다리게 하면 헤더가 깜빡이고 액션 게이팅이 늦게 걸린다.
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
  /** 어드민 권한 — `/admin/*` 접근 가능 여부. access token 의 `role` 클레임으로 판정한다. */
  isAdmin: boolean;
  user: AuthUser | null;
};

const ANONYMOUS: AuthStatus = {
  status: "anonymous",
  isAuthenticated: false,
  isAdmin: false,
  user: null,
};

/**
 * access token(JWT) 의 `role` 클레임을 읽는다. 실측 페이로드:
 * `{ sub, userId, role: "USER" | "ADMIN", iat, exp }`
 *
 * **서명은 검증하지 않는다.** 여기서 정하는 건 "어드민 화면을 그려 줄지"라는 UX 판단이고,
 * 권한의 최종 근거는 서버다. 토큰을 위조해 화면을 열어도 어드민 API 는 `AUTH-005` 로 막힌다.
 * (그래서 이 값을 보안 경계로 쓰면 안 된다 — AdminGuard 주석과 같은 이야기)
 *
 * 형식이 예상과 다르면 조용히 비어드민으로 떨어뜨린다. 파싱 실패로 화면이 죽는 편보다 낫다.
 */
function readRoleFromToken(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    // JWT 는 base64url — atob 가 읽는 base64 로 바꾸고 패딩을 채운다
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const claims: unknown = JSON.parse(atob(padded));
    const role = (claims as { role?: unknown }).role;
    return typeof role === "string" ? role : null;
  } catch {
    return null;
  }
}

/** 서버 렌더에서는 쿠키를 읽지 않는다 — 첫 페인트는 비회원으로 그리고 마운트 후 맞춘다. */
function getServerSnapshot(): AuthStatus {
  return ANONYMOUS;
}

/*
  같은 토큰이면 **같은 객체**를 돌려줘야 한다.
  useSyncExternalStore 는 스냅샷을 Object.is 로 비교하므로, 매번 새 객체를 만들면
  "값이 계속 바뀐다"고 보고 무한 렌더에 빠진다. 토큰이 바뀔 때만 새로 만든다.
*/
let cachedToken: string | null = null;
let cachedSnapshot: AuthStatus = ANONYMOUS;

function getSnapshot(): AuthStatus {
  const token = getAccessToken();
  if (token === cachedToken) return cachedSnapshot;

  cachedToken = token;
  cachedSnapshot = token
    ? {
        status: "authenticated",
        isAuthenticated: true,
        isAdmin: readRoleFromToken(token) === "ADMIN",
        user: null,
      }
    : ANONYMOUS;
  return cachedSnapshot;
}

export function useAuthStatus(): AuthStatus {
  const base = useSyncExternalStore(onTokensChanged, getSnapshot, getServerSnapshot);
  const { data: profile } = useMyProfile();

  if (!base.isAuthenticated) return base;

  return {
    ...base,
    user: profile
      ? { name: profile.nickname, avatarUrl: profile.avatarUrl, grade: profile.grade }
      : // 프로필이 오기 전에도 회원 UI 를 그린다(닉네임 자리는 비워 둔다).
        { name: "" },
  };
}

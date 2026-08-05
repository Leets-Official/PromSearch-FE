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

/** 토큰만 있고 프로필은 아직 안 온 상태. 어드민 여부는 프로필이 와야 정해진다. */
const AUTHENTICATED: AuthStatus = {
  status: "authenticated",
  isAuthenticated: true,
  isAdmin: false,
  user: null,
};

/**
 * ⚠️ **임시 판정 — 어드민 계정 이름으로 연다.**
 *
 * 원래는 access token 의 `role` 클레임(`"USER" | "ADMIN"`)으로 봐야 하는데,
 * 지금 발급되는 어드민 계정 토큰의 role 이 `USER` 라 그걸로는 화면에 들어갈 수가 없다.
 * **서버가 실제로 어떻게 응답하는지(200 인지 AUTH-005 인지) 확인하려면 일단 화면은
 * 열려야 하므로** 계정 이름으로 문을 열어 둔다.
 *
 * 보안 경계가 아니다. 권한의 최종 근거는 서버이고, 이 이름을 흉내 내도 어드민 API 는
 * 서버가 막는다(막지 못한다면 그건 서버 쪽 문제이고, 이걸 확인하려는 것이기도 하다).
 *
 * BE 가 role 을 ADMIN 으로 올려 주면 **이 함수를 지우고 role 판정으로 되돌린다.**
 */
const ADMIN_ACCOUNT_NAMES = ["admin"];

/** `MyProfile.nickname` 은 서버의 `nickname ?? username` 이다(profile.ts 매핑). 어드민 계정은 "admin". */
function isAdminAccount(name: string | undefined): boolean {
  return name !== undefined && ADMIN_ACCOUNT_NAMES.includes(name);
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
  cachedSnapshot = token ? AUTHENTICATED : ANONYMOUS;
  return cachedSnapshot;
}

export function useAuthStatus(): AuthStatus {
  const base = useSyncExternalStore(onTokensChanged, getSnapshot, getServerSnapshot);
  const { data: profile } = useMyProfile();

  if (!base.isAuthenticated) return base;

  return {
    ...base,
    // 어드민 판정은 프로필(username)에 의존하므로 프로필이 와야 true 가 된다.
    // 그 전까지는 false → AdminGuard 가 잠깐 "권한 없음"을 보여줄 수 있다.
    isAdmin: isAdminAccount(profile?.nickname),
    user: profile
      ? { name: profile.nickname, avatarUrl: profile.avatarUrl, grade: profile.grade }
      : // 프로필이 오기 전에도 회원 UI 를 그린다(닉네임 자리는 비워 둔다).
        { name: "" },
  };
}

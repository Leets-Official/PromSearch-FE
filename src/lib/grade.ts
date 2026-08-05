/**
 * 유저 등급 — 서버 enum ↔ 화면 표기.
 *
 * 서버는 대문자 enum 으로 준다(`GET /users/me` 실측 2026-08-06: `gradeName: "NODE"`).
 * 시안(499:2806)은 `Node` 처럼 첫 글자만 대문자다. 그대로 찍으면 "NODE" 가 보이므로
 * 여기서 한 번만 변환하고, 화면들은 이 함수만 부른다.
 *
 * 사다리(낮음 → 높음): Node · Link · Sync · Core · Prime · Origin
 * (PRIME 을 달성하면 자동으로 ORIGIN 승급 심사 대기열에 올라간다 — 신청 화면은 없다)
 */
export const USER_GRADES = ["NODE", "LINK", "SYNC", "CORE", "PRIME", "ORIGIN"] as const;

export type UserGrade = (typeof USER_GRADES)[number];

/** 서버 enum → 화면 표기. 목록에 없는 값은 그대로 두지 않고 최소한 대소문자만 정리한다. */
const GRADE_LABEL: Record<UserGrade, string> = {
  NODE: "Node",
  LINK: "Link",
  SYNC: "Sync",
  CORE: "Core",
  PRIME: "Prime",
  ORIGIN: "Origin",
};

function isUserGrade(value: string): value is UserGrade {
  return (USER_GRADES as readonly string[]).includes(value);
}

/**
 * 등급 표기 문자열. 값이 없으면 `null` 을 돌려주니 호출부는 그때 자리를 그리지 않으면 된다.
 *
 * 서버가 등급을 늘렸는데 여기 매핑이 아직 없더라도 화면이 비지 않도록,
 * 모르는 값은 `SOMETHING` → `Something` 규칙으로 표기만 맞춰 내보낸다.
 */
export function formatGrade(raw: string | null | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;

  const upper = value.toUpperCase();
  if (isUserGrade(upper)) return GRADE_LABEL[upper];

  return upper.charAt(0) + upper.slice(1).toLowerCase();
}

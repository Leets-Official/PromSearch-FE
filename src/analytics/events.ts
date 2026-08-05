export type AnalyticsAppEnv = "local" | "dev" | "prod";

export type UserStatus = "anonymous" | "authenticated";

export type AnalyticsEventPropertiesMap = {
  card_impression: {
    card_id: string;
    position: number;
    user_status: UserStatus;
    source?: string;
  };
  card_click: {
    card_id: string;
    position: number;
    user_status: UserStatus;
    source?: string;
  };
  prompt_copy_click: {
    prompt_id: string;
    user_status: UserStatus;
    card_id?: string;
    source?: string;
  };
  // 상세 진입 — 전환 퍼널의 상세 도달 측정
  prompt_view: {
    prompt_id: string;
    user_status: UserStatus;
    tier: "free" | "premium";
    source?: string;
  };
  // 레시피 잠금 CTA 클릭(로그인/포인트 유도) — 전환 직결 지표
  prompt_unlock_click: {
    prompt_id: string;
    reason: "anonymous" | "premium";
    user_status: UserStatus;
    source?: string;
  };
  signup_complete: {
    user_id: string;
    method?: "email" | "google" | "github" | "kakao";
  };
};

export type AnalyticsEventName = keyof AnalyticsEventPropertiesMap;

export type AnalyticsPayload<TName extends AnalyticsEventName = AnalyticsEventName> = {
  name: TName;
  properties: AnalyticsEventPropertiesMap[TName];
  context: {
    anonymous_id: string | null;
    app_env: AnalyticsAppEnv;
    page_url: string | null;
    referrer: string | null;
    session_id: string | null;
    timestamp: string;
  };
};

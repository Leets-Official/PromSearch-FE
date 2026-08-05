import type { OAuthProvider } from "@/features/auth/api/types";

const KAKAO_AUTHORIZE_URL = "https://kauth.kakao.com/oauth/authorize";
const GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";

/** provider별 authorize 엔드포인트 + client_id + scope */
const OAUTH_CONFIG: Record<
  OAuthProvider,
  { authorizeUrl: string; clientId: string; scope?: string }
> = {
  kakao: {
    authorizeUrl: KAKAO_AUTHORIZE_URL,
    clientId: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID ?? "",
  },
  google: {
    authorizeUrl: GOOGLE_AUTHORIZE_URL,
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
    scope: "openid email profile",
  },
};

/**
 * 콘솔에 등록된 리디렉션 URI 경로 — provider마다, 그리고 로컬/배포마다 형태가 다르다.
 * 패턴이 통일되어 있지 않아(카카오는 /oauth/{provider}/callback, 구글은 /auth/google/callback)
 * provider별로 명시적으로 매핑한다. 콘솔에 등록된 값과 한 글자라도 다르면
 * redirect_uri_mismatch 가 나므로, 여기 값을 바꿀 땐 반드시 콘솔 등록값도 같이 맞춘다.
 */
const OAUTH_CALLBACK_PATH: Record<"local" | "deployed", Record<OAuthProvider, string>> = {
  local: {
    kakao: "/oauth/kakao/callback",
    google: "/auth/google/callback",
  },
  deployed: {
    kakao: "/login/oauth/kakao",
    google: "/login/oauth/google",
  },
};

function isLocalHost(): boolean {
  return (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  );
}

function getOAuthCallbackPath(provider: OAuthProvider): string {
  const env = isLocalHost() ? "local" : "deployed";
  return OAUTH_CALLBACK_PATH[env][provider];
}

/** 우리 사이트에서 이 provider의 콜백을 받는 경로 */
export function getOAuthRedirectUri(provider: OAuthProvider): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}${getOAuthCallbackPath(provider)}`;
}

/** 카카오/구글 로그인 화면으로 이동시킬 URL을 만든다 */
export function buildOAuthAuthorizeUrl(provider: OAuthProvider): string {
  const config = OAUTH_CONFIG[provider];
  const redirectUri = getOAuthRedirectUri(provider);

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
  });
  if (config.scope) params.set("scope", config.scope);

  return `${config.authorizeUrl}?${params.toString()}`;
}

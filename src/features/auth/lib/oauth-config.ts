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

/** 우리 사이트에서 이 provider의 콜백을 받는 경로 */
export function getOAuthRedirectUri(provider: OAuthProvider): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/login/oauth/${provider}`;
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

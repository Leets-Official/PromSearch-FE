import { api } from "@/lib/api";
import type {
  LoginRequest,
  LoginResponse,
  OAuthLoginRequest,
  OAuthProvider,
  SignupRequest,
} from "./types";

/** [AUTH-001] 회원가입 — 회원가입 페이지 자체 폼에서 호출 (온보딩 모달과 별개) */
export function signup(payload: SignupRequest) {
  return api.post<string>("/auth/signup", payload);
}

/** [AUTH-002] 로그인 */
export function login(payload: LoginRequest) {
  return api.post<LoginResponse>("/auth/login", payload);
}

/** [AUTH-004] 소셜 로그인 — provider: "kakao" | "google" */
export function oauthLogin(provider: OAuthProvider, payload: OAuthLoginRequest) {
  return api.post<LoginResponse>(`/auth/oauth/${provider}`, payload);
}

/** [AUTH-005] 로그아웃 — body 없음, Access Token만 필요 */
export function logout() {
  return api.post<string>("/auth/logout");
}

/** Auth 도메인 API 요청/응답 타입 (Swagger 실물 기준, 2026-08-05) */

export interface AgreementsPayload {
  serviceTerms: boolean;
  communityTerms: boolean;
  contentPolicy: boolean;
  age14OrOver: boolean;
  /** 선택 항목이지만 키는 항상 전송해야 함 */
  marketing: boolean;
}

export interface SignupRequest {
  nickname: string;
  email: string;
  password: string;
  profileImageUrl?: string;
  /** 태그 ID, 최대 3개 */
  interestJobTagIds?: number[];
  /** 태그 ID, 최대 3개 */
  interestTaskTagIds?: number[];
  agreements: AgreementsPayload;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  profileImageUrl: string | null;
  nickname: string;
  email: string;
  /** true 면 온보딩 모달을 띄운다(소셜 로그인 전용 흐름) */
  isNewUser: boolean;
}

export interface OAuthLoginRequest {
  code: string;
  redirectUri: string;
}

export type OAuthProvider = "kakao" | "google";

export interface NicknameAvailabilityResponse {
  available: boolean;
}

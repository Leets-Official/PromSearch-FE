/**
 * API 레이어 공개 진입점. feature 코드는 여기서만 import 한다.
 *
 * ```ts
 * import { api, isApiError, type PageMeta } from "@/lib/api";
 * ```
 *
 * 사용법은 {@link file://./README.md} 참고.
 */

export { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "./auth-cookie";
export { api, apiClient } from "./client";
export { API_ORIGIN, API_PREFIX } from "./config";
export { ApiError, getErrorMessage, isApiError } from "./error";
export {
  clearTokens,
  getAccessToken,
  onSessionExpired,
  setTokens,
  type AuthTokens,
} from "./token-store";
export type { ApiResponse, CursorMeta, PageMeta } from "./types";

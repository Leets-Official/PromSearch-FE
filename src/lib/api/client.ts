/**
 * 공통 axios 인스턴스 + 인터셉터.
 *
 * 각 feature 는 이 파일을 직접 import 하지 않고 `@/lib/api` 의 `api.get/post/...` 만 쓴다.
 * 그러면 아래가 전부 자동으로 처리된다.
 *
 * - baseURL(`/api/v1`) 결합 — 엔드포인트는 `/prompts/10` 처럼 prefix 없이 적는다
 * - `Authorization: Bearer <accessToken>` 주입
 * - 공통 응답 봉투(`{ success, code, message, result }`) 해제 → `result` 만 반환
 * - 실패는 전부 {@link ApiError} 로 정규화해서 throw
 * - 401 이면 `/auth/reissue` 로 한 번 재발급 후 원 요청 재시도(동시 401 은 한 번만 재발급)
 * - dev 툴바 헤더 부착(MSW 목 전용, 실서버 호출에는 흔적 없음)
 */

import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { devPreviewFetchHeaders } from "@/lib/dev-preview";

import { API_TIMEOUT_MS, PUBLIC_AUTH_PATHS, REISSUE_PATH, resolveBaseURL } from "./config";
import { ApiError, toApiError } from "./error";
import {
  getAccessToken,
  getRefreshToken,
  notifySessionExpired,
  setTokens,
  type AuthTokens,
} from "./token-store";
import type { ApiResponse } from "./types";

/** 401 재발급 후 재시도한 요청인지 표시 — 무한 재시도 방지 */
type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

export const apiClient = axios.create({
  baseURL: resolveBaseURL(),
  timeout: API_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);

  // dev 프리뷰 토글(MSW 목이 읽는다). 툴바가 꺼져 있으면 빈 객체.
  for (const [key, value] of Object.entries(devPreviewFetchHeaders())) {
    config.headers.set(key, value);
  }

  return config;
});

/** 인증 없이 호출되는 경로인가(로그인/회원가입/재발급) — 여기서 난 401 은 재발급 대상이 아니다. */
function isPublicAuthPath(url: string | undefined): boolean {
  if (!url) return false;
  return PUBLIC_AUTH_PATHS.some((path) => url.startsWith(path));
}

/**
 * 재발급 단일 실행(single-flight).
 * 동시에 여러 요청이 401 을 받아도 재발급은 한 번만 나가고, 나머지는 그 결과를 기다린다.
 */
let refreshPromise: Promise<string | null> | null = null;

async function requestReissue(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    // 인터셉터가 걸리지 않은 순수 axios 로 호출한다(재발급 요청이 다시 401 인터셉터를 타지 않도록).
    const res = await axios.post<
      ApiResponse<AuthTokens & { tokenType: string; expiresIn: number }>
    >(
      `${resolveBaseURL()}${REISSUE_PATH}`,
      { refreshToken },
      { timeout: API_TIMEOUT_MS, headers: { "Content-Type": "application/json" } },
    );
    const result = res.data?.result;
    if (!result?.accessToken) return null;

    setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
    return result.accessToken;
  } catch {
    return null;
  }
}

function ensureReissued(): Promise<string | null> {
  refreshPromise ??= requestReissue().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    // HTTP 200 인데 success:false 인 경우도 실패로 취급한다(봉투 규격상 가능).
    const body = response.data;
    if (body && typeof body === "object" && body.success === false) {
      throw new ApiError(body.message || "요청을 처리하지 못했습니다.", {
        status: response.status,
        code: body.code,
        detail: body.result,
      });
    }
    return response;
  },
  async (error: unknown) => {
    const apiError = toApiError(error);
    const config = axios.isAxiosError(error) ? (error.config as RetriableConfig | undefined) : null;

    const canReissue =
      apiError.isUnauthorized && config && !config._retried && !isPublicAuthPath(config.url);

    if (canReissue) {
      const accessToken = await ensureReissued();
      if (accessToken) {
        config._retried = true;
        config.headers.set("Authorization", `Bearer ${accessToken}`);
        return apiClient.request(config);
      }
      // 재발급 실패 = 세션 종료. 구독자(로그인 모달/리다이렉트)에게 알린다.
      notifySessionExpired();
    }

    throw apiError;
  },
);

/** 봉투를 벗겨 `result` 만 돌려준다. 본문이 없는 응답(204 등)은 undefined. */
async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<ApiResponse<T>>(config);
  const body = response.data;
  if (!body || typeof body !== "object") return undefined as T;
  return body.result;
}

/**
 * feature 에서 쓰는 유일한 진입점.
 *
 * ```ts
 * const detail = await api.get<PromptDetail>(`/prompts/${promptId}`);
 * const created = await api.post<Comment>(`/prompts/${promptId}/comments`, { content });
 * await api.delete(`/comments/${commentId}`);
 * ```
 *
 * 쿼리스트링은 `{ params }` 로 넘긴다(값이 `undefined` 인 키는 axios 가 알아서 생략).
 */
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: "GET", url }),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: "POST", url, data }),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: "PUT", url, data }),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: "PATCH", url, data }),
  delete: <T = void>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: "DELETE", url }),
};

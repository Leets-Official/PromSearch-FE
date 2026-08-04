/**
 * API 에러 단일 타입.
 *
 * 호출부(훅/컴포넌트)는 axios 를 몰라도 되도록, 인터셉터가 모든 실패를 {@link ApiError} 로
 * 정규화해서 던진다. 화면에서는 `isApiError(error) && error.status === 404` 처럼 분기하거나
 * {@link getErrorMessage} 로 사용자 노출 문구를 뽑는다.
 */

import { isAxiosError } from "axios";

import type { ApiResponse } from "./types";

/** 네트워크 실패(응답 없음)를 나타내는 status. HTTP 상태와 겹치지 않게 0 을 쓴다. */
export const NETWORK_ERROR_STATUS = 0;

export class ApiError extends Error {
  /** HTTP 상태 코드. 네트워크 실패/타임아웃은 {@link NETWORK_ERROR_STATUS}(0) */
  readonly status: number;
  /** BE 공통 코드(`COMMON-401` 등). 알 수 없으면 빈 문자열 */
  readonly code: string;
  /** 응답 본문 원문 — 필드별 검증 오류 등 추가 정보가 필요할 때 사용 */
  readonly detail?: unknown;

  constructor(message: string, options: { status: number; code?: string; detail?: unknown }) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code ?? "";
    this.detail = options.detail;
  }

  /** 서버에 닿지 못함(오프라인·타임아웃·CORS). 재시도할 가치가 있는 유일한 실패 유형. */
  get isNetworkError(): boolean {
    return this.status === NETWORK_ERROR_STATUS;
  }

  /** 로그인 필요(토큰 없음·만료 후 재발급 실패) */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** 클라이언트 잘못 — 재시도해도 결과가 같다. */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

const DEFAULT_MESSAGE = "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
const NETWORK_MESSAGE = "네트워크 연결을 확인해 주세요.";

/** axios/기타 예외 → ApiError 정규화. 인터셉터에서만 호출하면 되고, 호출부는 쓸 일이 없다. */
export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;

  if (isAxiosError(error)) {
    const response = error.response;
    if (!response) {
      return new ApiError(NETWORK_MESSAGE, { status: NETWORK_ERROR_STATUS, detail: error.code });
    }
    const body = response.data as Partial<ApiResponse<unknown>> | undefined;
    return new ApiError(body?.message || DEFAULT_MESSAGE, {
      status: response.status,
      code: body?.code,
      detail: body?.result,
    });
  }

  return new ApiError(error instanceof Error ? error.message : DEFAULT_MESSAGE, {
    status: NETWORK_ERROR_STATUS,
  });
}

/** 사용자에게 보여줄 문구. BE message 를 그대로 쓰되, 비어 있으면 기본 문구로 대체한다. */
export function getErrorMessage(error: unknown, fallback = DEFAULT_MESSAGE): string {
  if (isApiError(error)) return error.message || fallback;
  if (error instanceof Error) return error.message || fallback;
  return fallback;
}

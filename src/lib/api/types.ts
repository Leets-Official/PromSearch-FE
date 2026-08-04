/**
 * BE 공통 응답 규격.
 *
 * 모든 응답은 `{ success, code, message, result }` 봉투에 담겨 온다.
 * 봉투를 벗기는 일은 {@link file://./client.ts} 의 `api.*` 헬퍼가 하므로,
 * 각 feature 는 `result` 안쪽 타입만 정의하면 된다.
 */

export type ApiResponse<T> = {
  success: boolean;
  /** BE 공통 코드. 예: `COMMON-200`, `COMMON-401` */
  code: string;
  message: string;
  result: T;
};

/** 오프셋 페이지네이션 메타 (홈 목록 등 `page`/`size` 기반) */
export type PageMeta = {
  /** 0부터 시작 */
  page: number;
  size: number;
  totalElements: number;
  hasNext: boolean;
};

/** 커서 페이지네이션 공통 필드 (댓글/대댓글 등). 목록 키 이름은 응답마다 달라 교차 타입으로 조합한다. */
export type CursorMeta = {
  /** 다음 페이지 요청에 그대로 실어 보낼 커서. 마지막 페이지면 null */
  nextCursor: number | null;
  hasNext: boolean;
};

/**
 * 업로드 API 응답/요청 타입 — Swagger 규격 그대로.
 * (봉투 `{ success, code, message }` 는 `@/lib/api` 가 벗겨준다)
 *
 * - `[PROMPT-002] POST /prompt-images/upload-urls`
 * - `[PROMPT-003] POST /prompt-images/{imageId}/complete`
 * - `[PROMPT-004] GET  /prompt-images/statuses`
 * - `[PROMPT-005~007] PUT|GET|DELETE /prompts/draft`
 * - `[PROMPT-008] POST /prompts`
 */

import type { ApiContentType, ApiOutputType } from "@/features/gallery/api/dto";

/** 업로드 URL 발급 요청 1건 */
export type ApiUploadUrlRequest = {
  fileName: string;
  contentType: string;
  fileSize: number;
  width: number;
  height: number;
};

export type ApiUploadUrlResult = {
  images: {
    imageId: string;
    /** S3 Presigned **PUT** URL. 우리 서버가 아니므로 공통 axios 인스턴스로 보내면 안 된다. */
    uploadUrl: string;
    expiresAt: string;
  }[];
};

/**
 * 이미지 처리 상태 (BE 회신 2026-08-05, 요청서 7-9).
 * `READY` 또는 `FAILED` 가 최종 상태 — 폴링은 여기서 멈춘다.
 */
export type ApiImageStatus = "UPLOADING" | "UPLOADED" | "PROCESSING" | "READY" | "FAILED";

export type ApiImageStatusResult = {
  images: {
    imageId: string;
    status: ApiImageStatus;
    /** 실패 사유 코드. 값 목록은 BE 회신 대기(요청서 7-9) */
    failureCode?: string | null;
    /**
     * 워터마크 처리본 조회용 URL.
     *
     * **임시저장 응답(`PROMPT-006`)에는 이 필드가 없다.** 그래서 초안을 복원할 때
     * 이 API 를 한 번 더 태워 미리보기를 채운다. `READY` 가 아니면 `null` 이다.
     */
    imageUrl?: string | null;
  }[];
};

export type ApiCompleteUploadResult = {
  imageId: string;
  status: ApiImageStatus;
  uploadedAt: string;
};

/** 게시물에 붙일 이미지 참조 — 순서와 대표 이미지 지정 */
export type ApiPromptImageRef = {
  imageId: string;
  sortOrder: number;
  thumbnail: boolean;
};

/** 게시/임시저장 공통 요청 본문. 임시저장은 title 외 전부 생략 가능하다. */
export type ApiPromptWriteRequest = {
  title: string;
  description?: string;
  outputType?: ApiOutputType;
  jobTagIds?: number[];
  taskTagIds?: number[];
  /**
   * AI 모델 태그.
   *
   * BE 가 배열(`aiModelTagIds`) → 단수(`aiModelTagId`) 로 바꾸기로 확정했지만(2026-08-05, 요청서 7-4)
   * 아직 배포 전이다. 어느 쪽이 살아 있어도 동작하도록 **둘 다 보낸다**
   * (Spring 은 기본적으로 모르는 필드를 무시한다). 배포 완료되면 배열 쪽을 지운다.
   */
  aiModelTagId?: number;
  aiModelTagIds?: number[];
  /** "기타" 모델 자유 입력값(최대 50자) */
  customAiModel?: string | null;
  contentType?: ApiContentType;
  promptBody?: string;
  visibility?: "PUBLIC" | "PRIVATE";
  images?: ApiPromptImageRef[];
};

/** 게시/임시저장 응답 — 생성된 식별자와 확정된 상태 */
export type ApiPromptWriteResult = {
  promptId: number;
  status: "ACTIVE" | "DRAFT" | "HIDDEN";
  visibility: "PUBLIC" | "PRIVATE";
  pricePoint: number;
  updatedAt: string;
};

/** [PROMPT-006] 임시저장 조회 — 작성 중이던 전체 내용 */
export type ApiDraftResult = Required<Pick<ApiPromptWriteRequest, "title">> &
  ApiPromptWriteRequest & {
    promptId: number;
    status: "DRAFT";
    pricePoint: number;
    updatedAt: string;
  };

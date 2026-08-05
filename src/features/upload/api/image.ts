/**
 * 결과물 이미지 업로드 — **Presigned 방식**.
 *
 * 파일은 백엔드를 거치지 않고 브라우저에서 S3 로 바로 올라간다.
 *
 * ```
 * 1. POST /prompt-images/upload-urls         → { imageId, uploadUrl }
 * 2. PUT  {uploadUrl}  (body = File)         → S3 직접 업로드
 * 3. POST /prompt-images/{imageId}/complete  → 업로드 검증(HeadObject)
 * 4. GET  /prompt-images/statuses            → 워터마크 처리 상태 폴링
 * ```
 *
 * 2번은 **우리 서버가 아니다.** 공통 axios 인스턴스(`api.put`)를 쓰면 baseURL(`/api/v1`)이 붙고
 * `Authorization` 헤더까지 실려 S3 서명 검증이 깨진다. 그래서 순수 `fetch` 로 따로 보낸다.
 */

import { api } from "@/lib/api";

import type { PromptImageValue } from "../schema";
import type {
  ApiCompleteUploadResult,
  ApiImageStatus,
  ApiImageStatusResult,
  ApiUploadUrlRequest,
  ApiUploadUrlResult,
} from "./dto";

/** 한 번에 발급 가능한 최대 장수(Swagger 기준) */
export const MAX_UPLOAD_BATCH = 10;

/** 상태 폴링 간격·상한. BE 권장값을 받으면 맞춘다(요청서 7-9). */
export const POLL_INTERVAL_MS = 1_500;
export const POLL_TIMEOUT_MS = 60_000;

/** 최종 상태 — 여기 도달하면 폴링을 멈춘다. */
export function isTerminal(status: ApiImageStatus): boolean {
  return status === "READY" || status === "FAILED";
}

/** [PROMPT-002] 업로드 URL 발급 */
export function issueUploadUrls(images: ApiUploadUrlRequest[]): Promise<ApiUploadUrlResult> {
  return api.post<ApiUploadUrlResult>("/prompt-images/upload-urls", { images });
}

/**
 * S3 직접 업로드(PUT).
 *
 * 발급 요청에 쓴 것과 **같은 Content-Type** 을 보내야 서명이 맞는다.
 * 공통 인터셉터를 타면 안 되므로 fetch 를 그대로 쓴다.
 */
export async function putToS3(uploadUrl: string, file: File): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!res.ok) {
    throw new Error(`이미지 업로드에 실패했어요. (${res.status})`);
  }
}

/** [PROMPT-003] 업로드 완료 검증. 같은 이미지에 여러 번 호출해도 멱등하다. */
export function completeUpload(imageId: string): Promise<ApiCompleteUploadResult> {
  return api.post<ApiCompleteUploadResult>(`/prompt-images/${imageId}/complete`);
}

/** [PROMPT-004] 상태 일괄 조회 — 1~10개, 쉼표 구분. 하나라도 없거나 남의 것이면 전체 실패. */
export function fetchImageStatuses(imageIds: string[]): Promise<ApiImageStatusResult> {
  return api.get<ApiImageStatusResult>("/prompt-images/statuses", {
    params: { imageIds: imageIds.join(",") },
  });
}

/** 서버 상태 → 폼 이미지 상태 */
export const IMAGE_STATUS_BY_API: Record<ApiImageStatus, PromptImageValue["status"]> = {
  UPLOADING: "uploading",
  UPLOADED: "processing",
  PROCESSING: "processing",
  READY: "ready",
  FAILED: "failed",
};

/**
 * imageId 목록으로 상태와 미리보기 URL 을 채운다.
 *
 * 임시저장 복원에 쓴다 — 초안 응답에는 `imageUrl` 이 없어서(BE 스펙) 이 API 로만 얻을 수 있다.
 * 하나라도 없거나 남의 이미지면 **요청 전체가 실패**하므로, 실패하면 호출부가
 * 미리보기 없이(자리표시 타일) 진행하도록 그대로 던진다.
 */
export async function fetchImagePreviews(imageIds: string[]): Promise<PromptImageValue[]> {
  const result = await fetchImageStatuses(imageIds);
  return result.images.map((image) => ({
    imageId: image.imageId,
    previewUrl: image.imageUrl ?? undefined,
    status: IMAGE_STATUS_BY_API[image.status] ?? "processing",
  }));
}

/** 파일에서 픽셀 크기를 읽는다(업로드 URL 발급 요청에 필요). */
export function readImageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지를 읽지 못했어요."));
    };
    image.src = url;
  });
}

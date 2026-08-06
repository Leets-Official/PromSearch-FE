/**
 * 프로필 이미지 업로드 — **Presigned 방식**(결과물 이미지와 동일한 원리, 워터마크 폴링만 없음).
 *
 * ```
 * 1. POST   /users/me/profile-image/upload-url  → { objectKey, uploadUrl, ifNoneMatch, ... }
 * 2. PUT    {uploadUrl}  (body = File)           → S3 직접 업로드
 * 3. PUT    /users/me/profile-image              → { objectKey } 로 업로드 완료 알림, 최신 프로필 반환
 * ```
 *
 * 2번은 우리 서버가 아니다. 공통 axios 인스턴스(`api.put`)를 쓰면 baseURL(`/api/v1`)이 붙고
 * `Authorization` 헤더까지 실려 S3 서명 검증이 깨진다. 그래서 순수 `fetch` 로 따로 보낸다.
 */

import { api } from "@/lib/api";

import type {
  ApiProfileImageCompleteResult,
  ApiProfileUploadUrlRequest,
  ApiProfileUploadUrlResult,
} from "./dto";

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** [USER-007] 프로필 이미지 업로드 URL 발급 */
export function issueProfileUploadUrl(
  payload: ApiProfileUploadUrlRequest,
): Promise<ApiProfileUploadUrlResult> {
  return api.post<ApiProfileUploadUrlResult>("/users/me/profile-image/upload-url", payload);
}

/**
 * S3 직접 업로드(PUT).
 * 발급 응답의 Content-Type 을 그대로 써야 서명이 맞는다. ifNoneMatch 는 덮어쓰기 방지 조건이다.
 */
export async function putProfileImageToS3(
  uploadUrl: string,
  file: File,
  ifNoneMatch: string,
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
      "If-None-Match": ifNoneMatch,
    },
  });

  if (!res.ok) {
    throw new Error(`프로필 이미지 업로드에 실패했어요. (${res.status})`);
  }
}

/** [USER-008] 업로드 완료 — objectKey 소유권·S3 메타데이터 검증 후 프로필에 연결 */
export function completeProfileImageUpload(
  objectKey: string,
): Promise<ApiProfileImageCompleteResult> {
  return api.put<ApiProfileImageCompleteResult>("/users/me/profile-image", { objectKey });
}

/** [USER-009] 프로필 이미지 제거 */
export function deleteProfileImage(): Promise<void> {
  return api.delete<void>("/users/me/profile-image");
}

/**
 * 전체 흐름을 한 번에 처리 — upload-url 발급 → S3 PUT → 완료 알림.
 * 반환값은 완료 응답의 profileImageUrl(최신 값).
 */
export async function uploadProfileImage(file: File): Promise<string> {
  if (!ALLOWED_CONTENT_TYPES.includes(file.type)) {
    throw new Error("JPEG, PNG, WEBP 형식의 이미지만 업로드할 수 있어요.");
  }

  const { uploadUrl, objectKey, ifNoneMatch } = await issueProfileUploadUrl({
    contentType: file.type,
    fileSize: file.size,
  });

  await putProfileImageToS3(uploadUrl, file, ifNoneMatch);

  const result = await completeProfileImageUpload(objectKey);
  return result.profileImageUrl;
}

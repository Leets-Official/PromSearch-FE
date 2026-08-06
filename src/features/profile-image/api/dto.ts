export interface ApiProfileUploadUrlRequest {
  contentType: string;
  fileSize: number;
}

export interface ApiProfileUploadUrlResult {
  objectKey: string;
  uploadUrl: string;
  contentType: string;
  contentLength: number;
  /** S3 PUT 시 이 헤더를 그대로 실어야 서명이 유효하다 */
  ifNoneMatch: string;
  expiresAt: string;
}

export interface ApiProfileImageCompleteRequest {
  objectKey: string;
}

/** [USER-008] 완료 응답 — PATCH /users/me 와 동일한 UserProfile 형태로 옴 */
export interface ApiProfileImageCompleteResult {
  userId: number;
  email: string;
  nickname: string;
  profileImageUrl: string;
  point: number;
  role: string;
  grade: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

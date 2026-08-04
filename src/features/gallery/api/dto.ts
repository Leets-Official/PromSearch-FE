/**
 * 홈 프롬프트 카드 API 응답 타입 — Swagger `result` 안쪽만 그대로 옮긴다.
 * (봉투 `{ success, code, message }` 는 `@/lib/api` 가 이미 벗겨준다)
 *
 * - `[HOME-001] GET /home/prompts/popular`
 * - `[HOME-002] GET /home/prompts/jobs/{jobTagId}`
 *
 * 두 API 의 `result` 스키마는 동일하다. FE 도메인 타입(`PromptSummary`)으로의 변환은
 * {@link file://./map.ts} 가 담당한다 — 이 파일은 **서버 모양 그대로**만 둔다.
 */

import type { PageMeta } from "@/lib/api";

/** 결과물 타입. FE 는 소문자(`image`/`text`)를 쓰므로 매핑이 필요하다. */
export type ApiOutputType = "IMAGE" | "TEXT";

/**
 * 콘텐츠 등급. Swagger 예시에는 FREE/PREMIUM 만 등장하지만 FE 기획에는 마스터 등급이 있어
 * MASTER 도 함께 받아둔다(오면 매핑되고, 안 와도 무해).
 */
export type ApiContentType = "FREE" | "PREMIUM" | "MASTER";

/** 태그 축. 하나의 `tags` 배열에 세 축이 섞여 오고 `tagType` 으로 구분한다. */
export type ApiTagType = "JOB" | "TASK" | "AI_MODEL";

export type ApiTag = {
  tagId: number;
  tagType: ApiTagType;
  /** 화면에 그대로 노출되는 표시명. 예: "디자이너", "PPT", "ChatGPT" */
  name: string;
};

export type ApiCardAuthor = {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
};

export type ApiCardStatistics = {
  viewCount: number;
  likeCount: number;
  commentCount: number;
  copyCount: number;
};

/** 로그인 사용자의 상호작용 상태. 비로그인 응답에서는 없거나 전부 false 다. */
export type ApiViewerInteraction = {
  liked: boolean;
  bookmarked: boolean;
};

export type ApiPromptCard = {
  promptId: number;
  title: string;
  thumbnailImageUrl: string | null;
  outputType: ApiOutputType;
  contentType: ApiContentType;
  pricePoint: number;
  author: ApiCardAuthor;
  statistics: ApiCardStatistics;
  viewerInteraction?: ApiViewerInteraction | null;
  tags: ApiTag[];
  /**
   * AI 모델 "기타"로 올린 경우의 자유 입력 모델명(예: `"GPT 4.1 Mini"`).
   *
   * "기타"는 태그 행이 없어 `tags` 에 `AI_MODEL` 항목이 오지 않으므로, 이 필드가 유일한 표시 수단이다.
   * 기본 모델(ChatGPT/Gemini/Claude)을 쓴 프롬프트는 `null`.
   *
   * 옵셔널로 둔 이유: BE 가 추가를 확정(2026-08-05)했지만 배포 전까지는 응답에 없다.
   * 배포가 끝나면 `string | null` 로 좁힌다.
   */
  customAiModel?: string | null;
  /** ISO 8601 */
  createdAt: string;
};

/** 홈 목록 응답. `page` 는 0-based 이고 총 페이지 수 대신 `totalElements`/`hasNext` 를 준다. */
export type ApiPromptCardList = {
  prompts: ApiPromptCard[];
  page: PageMeta;
};

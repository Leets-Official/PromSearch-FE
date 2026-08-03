/**
 * 갤러리(홈) 도메인 타입.
 *
 * 기획 확정값(기술명세서 / IA 2026-07-10) 기준:
 * - 결과물타입(content_output_type): image | text — AI모델과 독립 축(F-1.4)
 * - 콘텐츠타입(content_tier): free | premium | master — 상세 잠금 근거(홈 게이팅 아님)
 * - 직군/태스크/AI모델 태그는 멀티(복수) 값
 * - 홈 갤러리는 status=ACTIVE 만 노출 (DRAFT/HIDDEN 제외)
 */

// 결과물타입 — 홈 "결과물 타입" 필터의 값
export type OutputType = "image" | "text";

// AI 모델 — "기타"는 자유 입력(F-2.4 정규화 대상)
export type AiModel = "chatgpt" | "gemini" | "claude" | "etc";

// 태스크 — PPT/레포트/이메일/회의록/보고서/이미지 생성
export type Task = "ppt" | "report" | "email" | "meeting_notes" | "document" | "image_gen";

// 직군 — 학생/직장인/기획자/디자이너/개발자/자영업자
export type JobCategory =
  "student" | "worker" | "planner" | "designer" | "developer" | "self_employed";

// 콘텐츠타입(접근 등급) — 무료/프리미엄/마스터. 상세 잠금 근거(이번 범위 밖)
export type ContentTier = "free" | "premium" | "master";

// 게시글 상태 — 홈 갤러리는 ACTIVE 만 노출
export type PostStatus = "active" | "hidden" | "draft";

export type PromptAuthor = {
  name: string;
  avatarUrl?: string;
};

/** 갤러리 카드 1장에 필요한 요약 데이터 */
export type PromptSummary = {
  id: string;
  title: string;
  description?: string;
  /** 아웃풋 이미지(워터마크 합성된 BE 처리본) */
  thumbnailUrl?: string;
  outputType: OutputType;
  /** 사용 AI 모델(대표). etc 인 경우 modelEtcName 표시 */
  model: AiModel;
  modelEtcName?: string;
  /** 복수 태그 */
  tasks: Task[];
  jobCategories: JobCategory[];
  tier: ContentTier;
  author: PromptAuthor;
  stats: {
    views: number;
    copies: number;
    likes: number;
  };
  /** ISO 문자열 */
  createdAt: string;
};

/** 사이드바 선택(네비 축) */
export type GalleryNav = "home" | "popular" | "job";

/** 갤러리 목록 조회 파라미터(필터/정렬/페이지) */
export type GalleryQuery = {
  nav: GalleryNav;
  job: JobCategory | null;
  tasks: Task[];
  models: AiModel[];
  outputTypes: OutputType[];
  q: string;
  page: number;
};

/** 목록 응답(페이지네이션) */
export type PromptListResponse = {
  items: PromptSummary[];
  /** 현재 페이지(1-based) */
  page: number;
  /** 전체 페이지 수 → Pagination 렌더 근거 */
  totalPages: number;
  totalCount: number;
};

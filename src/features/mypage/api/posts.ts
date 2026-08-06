import { api } from "@/lib/api";
import type { PostStatus } from "@/mocks/data/mypage";

/**
 * [PROMPT-010] 응답 1행.
 *
 * 스웨거 `MyPromptSummaryResponse` 는 **required 가 하나도 없다.** 특히 `publishedAt` 은
 * "게시 완료 시각"이라 임시저장(DRAFT)처럼 아직 게시 전인 행에서는 null 로 온다.
 * 그대로 문자열로 받으면 표를 그리다 죽는다(실측: Cannot read properties of null).
 */
export interface MyPromptSummary {
  promptId: number;
  title: string | null;
  publishedAt: string | null;
  viewCount: number | null;
  recommendCount: number | null;
}

interface MyPromptsPage {
  content: MyPromptSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

/** 마이페이지 탭 → API status/visibility 매핑 (리포트 확정 기준) */
const STATUS_QUERY: Record<PostStatus, { status: string; visibility?: string }> = {
  published: { status: "ACTIVE", visibility: "PUBLIC" },
  draft: { status: "DRAFT" },
  private: { status: "ACTIVE", visibility: "PRIVATE" },
};

/** [PROMPT-010] 내 프롬프트 목록 조회 */
export function fetchMyPrompts(tabStatus: PostStatus, page: number, size: number) {
  const { status, visibility } = STATUS_QUERY[tabStatus];
  return api.get<MyPromptsPage>("/prompts/me", {
    params: { status, visibility, page, size },
  });
}

export interface MyPromptInsights {
  totalViews: number;
  totalRecommends: number;
  totalCopies: number;
}

/** [PROMPT-011] 내 게시글 인사이트 조회 — 수익 페이지 등에서 사용 */
export function fetchMyPromptInsights() {
  return api.get<MyPromptInsights>("/prompts/me/insights");
}

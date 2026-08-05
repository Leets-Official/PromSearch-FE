import { api } from "@/lib/api";
import type { PostStatus } from "@/mocks/data/mypage";

export interface MyPromptSummary {
  promptId: number;
  title: string;
  publishedAt: string;
  viewCount: number;
  recommendCount: number;
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

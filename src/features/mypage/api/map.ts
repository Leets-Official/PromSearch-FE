/**
 * `GET /prompts/me`(PROMPT-010) 응답 → 화면이 쓰는 `MyPost` 변환.
 *
 * 내 게시글은 **두 곳**에서 같은 모양으로 그려진다 — 마이페이지 프로필의 최근 5개 미리보기와
 * `/mypage/posts` 전체 목록. 그래서 변환을 여기 한 곳에 둔다(예전엔 프로필 쪽이 목데이터를
 * 쓰고 있어서 두 화면의 값이 서로 달랐다).
 */

import type { MyPromptSummary } from "./posts";
import type { MyPost, PostStatus } from "@/mocks/data/mypage";

/**
 * 게시일 표시 — "2026.07.12".
 *
 * `publishedAt` 은 게시 완료 시각이라 임시저장처럼 게시 전 행에서는 null 로 온다.
 * 값이 없으면 칸을 비우지 말고 "-" 로 둔다(빈칸은 로딩 실패처럼 보인다).
 */
export function formatPublishedAt(iso: string | null): string {
  if (!iso) return "-";
  return iso.slice(0, 10).replaceAll("-", ".");
}

/**
 * 목록 1행 → MyPost.
 *
 * 응답에는 썸네일·작성자·태그가 없어 표시용 플레이스홀더로 채운다. 표 뷰는 제목·게시일·조회·추천만
 * 쓰므로 문제가 없지만, **카드 뷰(모바일)는 이 필드들을 못 채운다** — 상세 API 로 보강 전까지의 한계다.
 */
export function toMyPost(item: MyPromptSummary, status: PostStatus): MyPost {
  return {
    id: String(item.promptId),
    // 임시저장은 제목 없이 저장될 수 있다 — 빈 줄로 남기지 않는다.
    title: item.title?.trim() || "제목 없음",
    date: formatPublishedAt(item.publishedAt),
    thumbnailUrl: "",
    outputType: "text",
    model: "chatgpt",
    tasks: [],
    jobCategories: [],
    tier: "free",
    author: { name: "" },
    stats: { views: item.viewCount ?? 0, copies: 0, likes: item.recommendCount ?? 0 },
    createdAt: item.publishedAt ?? "",
    status,
  };
}

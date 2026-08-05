/**
 * 북마크 API — `[COMMUNITY-003/004] POST|DELETE /prompts/{promptId}/bookmarks`.
 *
 * 좋아요와 같이 **등록/취소가 분리**돼 있어 현재 상태를 보고 메서드를 고른다.
 */

import { api } from "@/lib/api";

import type { ApiBookmarkResult } from "./dto";
import type { BookmarkToggleResponse } from "../types";

/**
 * @param bookmarked 현재(요청 전) 북마크 상태. true 면 취소, false 면 등록한다.
 */
export async function toggleBookmark(
  id: string,
  bookmarked: boolean,
): Promise<BookmarkToggleResponse> {
  const result = bookmarked
    ? await api.delete<ApiBookmarkResult>(`/prompts/${id}/bookmarks`)
    : await api.post<ApiBookmarkResult>(`/prompts/${id}/bookmarks`);

  return { bookmarked: result.bookmarked };
}

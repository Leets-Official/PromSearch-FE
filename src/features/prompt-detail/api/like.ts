/**
 * 좋아요 API — `[COMMUNITY-001/002] POST|DELETE /prompts/{promptId}/likes`.
 *
 * 서버는 토글이 아니라 **등록/취소가 분리**돼 있어 현재 상태를 보고 메서드를 고른다.
 * 응답으로 확정된 `liked`/`likeCount` 가 오므로 화면은 그 값으로 맞춘다.
 */

import { api, toNumber } from "@/lib/api";

import type { ApiLikeResult } from "./dto";
import type { LikeToggleResponse } from "../types";

/**
 * @param liked 현재(요청 전) 좋아요 상태. true 면 취소, false 면 등록한다.
 */
export async function toggleLike(id: string, liked: boolean): Promise<LikeToggleResponse> {
  const result = liked
    ? await api.delete<ApiLikeResult>(`/prompts/${id}/likes`)
    : await api.post<ApiLikeResult>(`/prompts/${id}/likes`);

  // likeCount 가 문자열로 오면 낙관적 갱신에서 "32"+1="321" 이 된다(lib/api/number.ts)
  return { liked: result.liked, likeCount: toNumber(result.likeCount) };
}

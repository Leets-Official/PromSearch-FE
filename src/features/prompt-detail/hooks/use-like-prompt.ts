"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toggleLike } from "@/features/prompt-detail/api/like";
import type { PromptDetail } from "@/features/prompt-detail/types";

/** 상세 캐시 매칭 필터 — 뷰어 상태 축과 무관하게 같은 id 의 모든 캐시를 잡는다 */
const detailFilter = (id: string) => ({ queryKey: ["prompt", id] as const });

function patchLike(detail: PromptDetail, liked: boolean, likes: number): PromptDetail {
  return { ...detail, liked, stats: { ...detail.stats, likes } };
}

/**
 * 추천(좋아요) 토글. 클릭 즉시 낙관적으로 카운트/상태를 뒤집고, 서버 응답으로 확정한다.
 * 실패하면 이전 스냅샷으로 롤백한다.
 */
export function useLikePrompt(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => toggleLike(id),
    onMutate: async () => {
      await qc.cancelQueries(detailFilter(id));
      const snapshots = qc.getQueriesData<PromptDetail>(detailFilter(id));

      qc.setQueriesData<PromptDetail>(detailFilter(id), (old) =>
        old ? patchLike(old, !old.liked, old.stats.likes + (old.liked ? -1 : 1)) : old,
      );

      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSuccess: (res) => {
      qc.setQueriesData<PromptDetail>(detailFilter(id), (old) =>
        old ? patchLike(old, res.liked, res.likeCount) : old,
      );
    },
  });
}

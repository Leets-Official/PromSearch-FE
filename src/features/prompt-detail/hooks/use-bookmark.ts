"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toggleBookmark } from "@/features/prompt-detail/api/bookmark";
import type { PromptDetail } from "@/features/prompt-detail/types";

/** 상세 캐시 매칭 필터 — 뷰어 상태 축과 무관하게 같은 id 의 모든 캐시를 잡는다 */
const detailFilter = (id: string) => ({ queryKey: ["prompt", id] as const });

/**
 * 북마크 토글. 클릭 즉시 낙관적으로 bookmarked 를 뒤집고, 서버 응답으로 확정한다.
 * 실패하면 이전 스냅샷으로 롤백한다.
 */
export function useBookmark(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => toggleBookmark(id),
    onMutate: async () => {
      await qc.cancelQueries(detailFilter(id));
      const snapshots = qc.getQueriesData<PromptDetail>(detailFilter(id));

      qc.setQueriesData<PromptDetail>(detailFilter(id), (old) =>
        old ? { ...old, bookmarked: !old.bookmarked } : old,
      );

      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSuccess: (res) => {
      qc.setQueriesData<PromptDetail>(detailFilter(id), (old) =>
        old ? { ...old, bookmarked: res.bookmarked } : old,
      );
    },
  });
}

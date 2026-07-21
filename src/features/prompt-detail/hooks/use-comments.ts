"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchComments } from "@/features/prompt-detail/api/comment";

/** 상세 댓글 조회(표시 전용) */
export function useComments(id: string) {
  return useQuery({
    queryKey: ["prompt", id, "comments"],
    queryFn: () => fetchComments(id),
  });
}

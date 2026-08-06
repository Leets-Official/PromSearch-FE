"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchMyPrompts } from "@/features/mypage/api/posts";
import type { PostStatus } from "@/mocks/data/mypage";

export function useMyPrompts(status: PostStatus, page: number, size: number) {
  return useQuery({
    queryKey: ["my-prompts", status, page, size],
    queryFn: () => fetchMyPrompts(status, page, size),
  });
}

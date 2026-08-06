"use client";

import { useEffect, useRef } from "react";

interface UseInfiniteScrollOptions {
  /** 더 불러올 데이터가 있는지 여부 */
  hasMore: boolean;
  /** sentinel 이 뷰포트에 들어왔을 때 호출 */
  onLoadMore: () => void;
  /** IntersectionObserver root margin — 화면에 닿기 전에 미리 로드 */
  rootMargin?: string;
}

/**
 * sentinel(빈 div) 엘리먼트가 뷰포트에 들어오면 onLoadMore 를 호출하는 무한 스크롤 훅.
 * 반환된 ref 를 리스트 맨 아래 sentinel 엘리먼트에 연결한다.
 */
export function useInfiniteScroll({
  hasMore,
  onLoadMore,
  rootMargin = "200px",
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore, rootMargin]);

  return sentinelRef;
}

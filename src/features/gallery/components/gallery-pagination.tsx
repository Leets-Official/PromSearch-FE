"use client";

import { PaginationRoot } from "@/components/ui/pagination";
import { useGalleryFilters } from "@/features/gallery/hooks/use-gallery-filters";

/**
 * 갤러리 하단 페이지네이션 — 공통 `PaginationRoot` 를 URL page 상태에 연결한다.
 * 페이지가 1개뿐이면 렌더하지 않는다.
 */
export function GalleryPagination({ page, totalPages }: { page: number; totalPages: number }) {
  const { setPage } = useGalleryFilters();

  if (totalPages <= 1) return null;

  return (
    <PaginationRoot page={page} pageCount={totalPages} onPageChange={setPage} className="mt-8" />
  );
}

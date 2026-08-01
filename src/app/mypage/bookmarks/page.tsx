"use client";

import type { UserStatus } from "@/analytics/events";
import { GalleryFilters } from "@/features/gallery/components/gallery-filters";
import { GalleryGrid } from "@/features/gallery/components/gallery-grid";
import { GalleryPagination } from "@/features/gallery/components/gallery-pagination";
import { GalleryError, GallerySkeleton } from "@/features/gallery/components/gallery-states";
import { useGalleryFilters } from "@/features/gallery/hooks/use-gallery-filters";
import { useBookmarks } from "@/features/mypage/hooks/use-bookmarks";

export default function BookmarksPage() {
  const { query, setTasks, setModels, setOutputTypes } = useGalleryFilters();
  const { prompts, totalPages, isLoading, isError, refetch } = useBookmarks();

  // 빈 결과 시 필터 초기화 (훅에 reset 이 있으면 그걸 써도 됨)
  const resetFilters = () => {
    setTasks([]);
    setModels([]);
    setOutputTypes([]);
  };

  // TODO: 실제 로그인 상태로 교체 (북마크는 로그인 필수 경로)
  const userStatus: UserStatus = "anonymous";

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-heading-1 text-text-primary">북마크한 게시글</h1>

      <GalleryFilters />

      {isLoading ? (
        <GallerySkeleton />
      ) : isError ? (
        <GalleryError onRetry={refetch} />
      ) : (
        <GalleryGrid prompts={prompts} userStatus={userStatus} onResetFilters={resetFilters} />
      )}

      <GalleryPagination page={query.page} totalPages={totalPages} />
    </div>
  );
}

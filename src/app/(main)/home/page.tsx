"use client";

import { JOB_CATEGORY_LABEL } from "@/features/gallery/categories";
import { GalleryFilters } from "@/features/gallery/components/gallery-filters";
import { GalleryGrid } from "@/features/gallery/components/gallery-grid";
import { GalleryPagination } from "@/features/gallery/components/gallery-pagination";
import {
  GalleryError,
  GalleryInlineLoading,
  GallerySkeleton,
} from "@/features/gallery/components/gallery-states";
import { UploadFab } from "@/features/gallery/components/upload-fab";
import { useGalleryFilters } from "@/features/gallery/hooks/use-gallery-filters";
import { usePromptList } from "@/features/gallery/hooks/use-prompt-list";
import type { GalleryQuery } from "@/features/gallery/types";
import { useAuthStatus } from "@/hooks/use-auth-status";

// nav 기준 제목.
// "오늘의 추천"은 실은 홈 갤러리 자리표시 텍스트였고 → 홈으로 확정(명칭 "홈", 최신순 정렬).
function galleryHeading(query: GalleryQuery): string {
  if (query.nav === "popular") return "인기 프롬프트";
  if (query.nav === "job" && query.job) return `${JOB_CATEGORY_LABEL[query.job]} 프롬프트`;
  return "홈";
}

export default function HomePage() {
  const { query, reset } = useGalleryFilters();
  const { status } = useAuthStatus();
  const { data, isPending, isFetching, isError, refetch } = usePromptList(query);

  return (
    <div className="flex flex-col gap-6">
      {/* 모바일 시안(1206:3561)은 헤더 바로 아래가 필터 행이라 제목이 없다.
          문서 구조(h1)는 유지해야 하므로 sm 미만에서는 스크린리더 전용으로만 남긴다. */}
      <h1 className="sr-only text-heading-1 text-text-primary sm:not-sr-only">
        {galleryHeading(query)}
      </h1>

      <GalleryFilters />

      {isError ? (
        <GalleryError onRetry={() => void refetch()} />
      ) : isPending ? (
        <GallerySkeleton />
      ) : (
        <>
          <GalleryGrid prompts={data.items} userStatus={status} onResetFilters={reset} />
          {/* 페이지 이동·필터 변경 재조회 중(이전 결과는 유지) — 최초 로딩은 위 스켈레톤 */}
          {isFetching ? <GalleryInlineLoading /> : null}
          <GalleryPagination page={data.page} totalPages={data.totalPages} />
        </>
      )}

      {/* 모바일 전용 업로드 진입점(데스크톱은 상단바의 "업로드" 버튼) */}
      <UploadFab />
    </div>
  );
}

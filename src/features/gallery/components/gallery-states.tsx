import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { GALLERY_PAGE_SIZE } from "@/features/gallery/constants";

/** 최초 로딩 — 카드 자리 스켈레톤 그리드 */
export function GallerySkeleton({ count = GALLERY_PAGE_SIZE }: { count?: number }) {
  return (
    <div
      data-slot="gallery-skeleton"
      aria-busy="true"
      aria-label="프롬프트 불러오는 중"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex w-full flex-col gap-4 p-2">
          <div className="aspect-video w-full animate-pulse rounded-lg bg-bg-secondary" />
          <div className="h-5 w-3/4 animate-pulse rounded bg-bg-secondary" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-bg-secondary" />
        </div>
      ))}
    </div>
  );
}

/** 다음 페이지 로딩 등 인라인 스피너 */
/**
 * 재조회 중 표시 — 필터·페이지를 바꿨을 때.
 *
 * 이전 결과를 유지한 채(keepPreviousData) **그 위에 겹쳐** 보여준다.
 * 예전에는 그리드 **아래**에 스피너만 뒀는데, 카드가 몇 장 없으면 화면 밖이라 안 보였고
 * "필터가 안 먹은 건지 불러오는 중인지" 구분이 안 됐다.
 *
 * 이전 결과는 흐리게 깔아 두고 클릭을 막는다 — 곧 사라질 목록을 누르면 엉뚱한 상세로 간다.
 */
export function GalleryFetching({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative" aria-busy>
      <div className="pointer-events-none opacity-40 transition-opacity duration-150">
        {children}
      </div>
      {/* 첫 화면(스켈레톤)과 위치를 맞춰 위쪽에 띄운다 — 긴 목록에서 화면 밖으로 나가지 않게 sticky. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center pt-16">
        <span className="sticky top-1/2 flex items-center gap-2 rounded-full bg-bg-primary px-4 py-2 text-body-3 text-text-secondary shadow-[0_4px_8px_rgb(35_35_33/0.13)]">
          <Spinner className="size-4" />
          불러오는 중
        </span>
      </div>
    </div>
  );
}

/** 빈 결과 — 필터 초기화 유도 */
export function GalleryEmpty({ onReset }: { onReset?: () => void }) {
  return (
    <div
      data-slot="gallery-empty"
      className="flex w-full flex-col items-center gap-4 py-20 text-center"
    >
      <p className="text-heading-2 text-text-primary">조건에 맞는 프롬프트가 없어요</p>
      <p className="text-body-2 text-text-secondary">필터를 바꾸거나 초기화해 보세요.</p>
      {onReset ? (
        <Button variant="outline" onClick={onReset}>
          필터 초기화
        </Button>
      ) : null}
    </div>
  );
}

/** 에러 — 재시도 */
export function GalleryError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div
      data-slot="gallery-error"
      role="alert"
      className="flex w-full flex-col items-center gap-4 py-20 text-center"
    >
      <p className="text-heading-2 text-text-primary">목록을 불러오지 못했어요</p>
      <p className="text-body-2 text-text-secondary">잠시 후 다시 시도해 주세요.</p>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          다시 시도
        </Button>
      ) : null}
    </div>
  );
}

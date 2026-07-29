import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

/** 최초 로딩 — 카드 자리 스켈레톤 그리드 */
export function GallerySkeleton({ count = 9 }: { count?: number }) {
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
export function GalleryInlineLoading() {
  return (
    <div className="flex w-full justify-center py-6">
      <Spinner />
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

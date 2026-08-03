import { Button } from "@/components/ui/button";
import { ADMIN_PAGE_SIZE } from "@/features/admin/constants";

/** 표 로딩 — 행 자리 스켈레톤 */
export function AdminTableSkeleton({ rows = ADMIN_PAGE_SIZE }: { rows?: number }) {
  return (
    <div
      data-slot="admin-table-skeleton"
      aria-busy="true"
      aria-label="목록 불러오는 중"
      className="flex w-full flex-col gap-2"
    >
      <div className="h-12 w-full animate-pulse rounded bg-bg-secondary" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-12 w-full animate-pulse rounded bg-bg-secondary/60" />
      ))}
    </div>
  );
}

/** 빈 목록 — 표 아래 안내 문구 */
export function AdminEmpty({ message }: { message: string }) {
  return (
    <div
      data-slot="admin-empty"
      className="flex w-full flex-col items-center gap-2 py-16 text-center"
    >
      <p className="text-title-1 text-text-primary">{message}</p>
      <p className="text-body-2 text-text-secondary">탭이나 검색어를 바꿔 보세요.</p>
    </div>
  );
}

/** 조회 실패 — 재시도 */
export function AdminError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div
      data-slot="admin-error"
      role="alert"
      className="flex w-full flex-col items-center gap-4 py-16 text-center"
    >
      <p className="text-title-1 text-text-primary">목록을 불러오지 못했어요</p>
      <p className="text-body-2 text-text-secondary">잠시 후 다시 시도해 주세요.</p>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          다시 시도
        </Button>
      ) : null}
    </div>
  );
}

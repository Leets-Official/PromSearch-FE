"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

/** 로딩 — 좌 이미지 + 우 텍스트 스켈레톤 */
export function DetailSkeleton() {
  return (
    <div
      className="flex w-full animate-pulse flex-col gap-6 lg:flex-row"
      data-testid="detail-skeleton"
    >
      <div className="aspect-square w-full rounded-md bg-bg-disabled lg:h-[624px] lg:w-[432px]" />
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="h-8 w-2/3 rounded bg-bg-disabled" />
        <div className="h-12 w-1/2 rounded bg-bg-disabled" />
        <div className="h-6 w-full rounded bg-bg-disabled" />
        <div className="h-64 w-full rounded bg-bg-secondary" />
      </div>
    </div>
  );
}

/** 에러 — 재시도 */
export function DetailError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <p className="text-body-1 text-text-secondary">프롬프트를 불러오지 못했어요.</p>
      <Button variant="neutral" onClick={onRetry}>
        다시 시도
      </Button>
    </div>
  );
}

/** 404 — 없는/비공개 게시글 */
export function DetailNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <p className="text-heading-1 text-text-primary">프롬프트를 찾을 수 없어요</p>
      <p className="text-body-1 text-text-secondary">삭제되었거나 비공개 상태일 수 있어요.</p>
      {/* render 로 <a> 를 넘기므로 nativeButton={false} — 없으면 Base UI 가 접근성 경고를 낸다 */}
      <Button variant="brand" nativeButton={false} render={<Link href="/home" />}>
        홈으로
      </Button>
    </div>
  );
}

import { ImageIcon } from "@/components/ui/icons";

import { cn } from "@/lib/utils";

/**
 * 이미지를 못 불러왔을 때 대신 그리는 자리.
 *
 * 결과물 이미지는 S3 presigned URL 로 내려오는데, 객체가 없거나 서명이 만료되면 403 이 온다
 * (실제로 워터마크 결과물이 안 써진 게시글이 있었다). 그때 브라우저 기본 동작은
 * **아무것도 안 그리는 것**이라 화면에 빈칸만 남고, 사용자는 로딩 중인지 깨진 건지 알 수 없다.
 *
 * 원인이 서버·인프라 쪽이라 프론트가 고칠 수는 없다. 대신 "여기 이미지가 있어야 하는데
 * 실패했다"는 사실만은 분명히 보여 준다.
 */
export function ImageFallback({
  className,
  compact = false,
}: {
  className?: string;
  /** 썸네일처럼 좁은 자리 — 아이콘만 두고 문구는 접근성용으로만 남긴다 */
  compact?: boolean;
}) {
  return (
    <div
      data-slot="image-fallback"
      role="img"
      aria-label="이미지를 불러오지 못했어요"
      className={cn(
        "flex size-full flex-col items-center justify-center gap-2 bg-bg-secondary text-text-disabled",
        className,
      )}
    >
      <ImageIcon className={compact ? "size-6" : "size-8"} aria-hidden />
      {compact ? null : <p className="text-body-3">이미지를 불러오지 못했어요</p>}
    </div>
  );
}

"use client";

import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * 확인/취소 다이얼로그 — Figma Modal(1517:8755).
 *
 * device=desktop(1517:8754, 430x196) / device=mobile(1517:8753, 311x156) 두 변형이 있는데,
 * 코드에서는 prop 대신 `sm:` 브레이크포인트로 반응 처리한다(dialog.tsx 와 동일한 방식).
 * - mobile : w-311, padding 16/16/12, gap 16, 타이틀·설명 **가운데 정렬**,
 *            버튼 2개가 가로로 5:5 분할(flex-1), size=36(Button size="sm")
 * - desktop: w-430, padding 24/24/16, gap 24, 타이틀·설명 **좌측 정렬**,
 *            버튼 우측 정렬 + 콘텐츠 폭(shrink), size=48(Button size="lg")
 *
 * 파괴적 동작 확인용이므로 Dialog 가 아닌 AlertDialog primitive 를 쓴다.
 * (role="alertdialog", 바깥 클릭/ESC 로 닫히지 않아 실수 방지)
 */

type ConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 모달 타이틀 */
  title: React.ReactNode;
  /** 설명(선택) — 두 줄까지 여유 있는 영역 */
  description?: React.ReactNode;
  /** 확인 버튼 라벨 */
  confirmLabel?: string;
  /** 취소 버튼 라벨 */
  cancelLabel?: string;
  /** 확인 클릭 — 호출 후 모달을 닫는 건 호출측 책임(비동기 처리 여지) */
  onConfirm: () => void;
  /** 취소 클릭(선택). 미지정 시 닫기만 한다. */
  onCancel?: () => void;
  className?: string;
};

function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  onConfirm,
  onCancel,
  className,
}: ConfirmModalProps) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Backdrop
          data-slot="confirm-modal-overlay"
          // dialog.tsx 와 동일한 딤(Opacity/dim) + 페이드
          className="fixed inset-0 isolate z-50 bg-dim duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
        />
        <AlertDialogPrimitive.Popup
          data-slot="confirm-modal"
          className={cn(
            // 위치 + 등장 애니메이션(dialog.tsx 패턴 동일)
            "fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 duration-100 outline-none",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            // 컨테이너 — radius/lg(16px), Background/primary, Interaction drop-shadow
            "flex flex-col rounded-[16px] bg-bg-primary shadow-[0_4px_8px_rgb(35_35_33/0.13)]",
            // mobile: 311px 고정폭(화면이 더 좁으면 여백 확보), padding 16/16/12
            "w-[311px] max-w-[calc(100vw-2rem)] gap-4 px-4 pt-4 pb-3",
            // desktop: 430px, padding 24/24/16, gap 24
            "sm:w-[430px] sm:gap-6 sm:px-6 sm:pt-6 sm:pb-4",
            className,
          )}
        >
          {/* 텍스트 블록 — mobile 가운데 정렬 / desktop 좌측 정렬 */}
          <div className="flex flex-col gap-1 text-center break-words sm:text-left">
            <AlertDialogPrimitive.Title
              // mobile 20/32 Bold, desktop Heading 1(24/32 Bold)
              className="text-heading-2 leading-8 text-text-primary sm:text-heading-1"
            >
              {title}
            </AlertDialogPrimitive.Title>
            {description ? (
              <AlertDialogPrimitive.Description
                // mobile 14/20, desktop Body 3(14/24)
                className="text-body-3 leading-5 text-text-secondary sm:leading-6"
              >
                {description}
              </AlertDialogPrimitive.Description>
            ) : null}
          </div>

          {/* 버튼 — mobile 5:5 분할 / desktop 우측 정렬 + 콘텐츠 폭 */}
          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <AlertDialogPrimitive.Close
              render={
                <Button
                  variant="neutral"
                  size="sm"
                  className="flex-1 sm:h-12 sm:flex-none sm:px-4 sm:text-title-1"
                />
              }
              onClick={onCancel}
            >
              {cancelLabel}
            </AlertDialogPrimitive.Close>
            <Button
              variant="brand"
              size="sm"
              className="flex-1 sm:h-12 sm:flex-none sm:px-4 sm:text-title-1"
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </AlertDialogPrimitive.Popup>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}

export { ConfirmModal };
export type { ConfirmModalProps };

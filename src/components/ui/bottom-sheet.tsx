"use client";

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";

import { cn } from "@/lib/utils";

/**
 * 바텀시트 — Figma "홈 - 필터" bottomsheet(1379:5220).
 *
 * 모바일에서 드롭다운/선택 UI 대신 아래에서 올라오는 시트로 띄운다.
 * 시안 스펙:
 * - 컨테이너: Background/primary, 상단 radius/lg(16px), px 16 / pt 32 / pb 16, 세로 gap 24
 * - 드래그 핸들: 72x4, Stroke/secondary, radius full, 상단에서 12px
 * - 아래로 스와이프해 닫는다(base-ui Drawer swipeDirection="down").
 *
 * 콘텐츠는 children 으로 받는 범용 컴포넌트다(필터 전용 아님).
 */
type BottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 스크린리더용 제목. 시각적으로는 숨긴다(시안에 시트 제목이 없음). */
  title: string;
  children: React.ReactNode;
  className?: string;
};

function BottomSheet({ open, onOpenChange, title, children, className }: BottomSheetProps) {
  return (
    <DrawerPrimitive.Root open={open} onOpenChange={onOpenChange} swipeDirection="down">
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Backdrop
          data-slot="bottom-sheet-overlay"
          // 스와이프 진행도에 따라 딤이 옅어진다
          className="fixed inset-0 z-50 bg-dim opacity-[calc(1-var(--drawer-swipe-progress))] transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0"
        />
        <DrawerPrimitive.Viewport className="fixed inset-0 z-50 flex items-end justify-center">
          <DrawerPrimitive.Popup
            data-slot="bottom-sheet"
            className={cn(
              "relative flex max-h-[85dvh] w-full flex-col gap-6 overflow-y-auto overscroll-contain rounded-t-[16px] bg-bg-primary px-4 pt-8 pb-4 outline-none",
              "[transform:translateY(var(--drawer-swipe-movement-y))] transition-transform duration-200 ease-out data-swiping:select-none",
              "data-ending-style:[transform:translateY(100%)] data-starting-style:[transform:translateY(100%)]",
              className,
            )}
          >
            {/* 드래그 핸들 — 시안 72x4, 상단 12px */}
            <div
              aria-hidden
              className="absolute top-3 left-1/2 h-1 w-18 -translate-x-1/2 rounded-full bg-stroke-secondary"
            />
            <DrawerPrimitive.Title className="sr-only">{title}</DrawerPrimitive.Title>
            <DrawerPrimitive.Content className="flex flex-col gap-6">
              {children}
            </DrawerPrimitive.Content>
          </DrawerPrimitive.Popup>
        </DrawerPrimitive.Viewport>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
}

/** 시트 안의 한 그룹 — 제목(Heading 2) + 내용, 제목/내용 간격 8px. */
function BottomSheetGroup({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div data-slot="bottom-sheet-group" className={cn("flex w-full flex-col gap-2", className)}>
      <p className="text-heading-2 text-text-primary">{title}</p>
      {children}
    </div>
  );
}

export { BottomSheet, BottomSheetGroup };
export type { BottomSheetProps };

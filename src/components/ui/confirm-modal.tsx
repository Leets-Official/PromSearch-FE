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
  /**
   * 설명(선택) — 두 줄까지 여유 있는 영역.
   *
   * ⚠️ **문단(`<p>`) 안에 들어간다.** base-ui 의 Description 이 `<p>` 로 렌더되고,
   * 이 요소가 `aria-describedby` 대상이라 엘리먼트를 바꾸면 스크린리더 읽기 순서가 달라진다.
   * 그래서 여기에는 phrasing content(텍스트·`<span>`·`<strong>` 등)만 넣을 수 있다.
   * `<fieldset>`·`<div>`·`<ul>` 같은 flow content 를 넣으면 HTML 이 무효가 되고
   * 브라우저가 `<p>` 를 강제로 닫아 하이드레이션 불일치가 난다 → 그건 `children` 으로.
   */
  description?: React.ReactNode;
  /**
   * 설명과 버튼 사이에 들어가는 자유 영역(선택).
   *
   * 라디오 그룹·입력창처럼 **구조를 갖거나 상호작용하는 콘텐츠**는 여기에 넣는다.
   * `description` 과 나누는 이유는 두 가지다.
   * - HTML: `<p>` 는 flow content 를 담을 수 없다(위 주석 참고).
   * - 접근성: `aria-describedby` 는 "이 모달이 무엇인지" 설명하는 문구를 가리켜야 한다.
   *   폼 컨트롤까지 그 안에 있으면 모달을 열 때 통째로 읽히고, 컨트롤은 각자
   *   label 로 이미 이름이 있어 중복된다.
   */
  children?: React.ReactNode;
  /** 확인 버튼 라벨 */
  confirmLabel?: string;
  /** 취소 버튼 라벨 */
  cancelLabel?: string;
  /** 확인 클릭 — 호출 후 모달을 닫는 건 호출측 책임(비동기 처리 여지) */
  onConfirm: () => void;
  /** 취소 클릭(선택). 미지정 시 닫기만 한다. */
  onCancel?: () => void;
  /** 확인 버튼 비활성(예: 포인트 부족) */
  confirmDisabled?: boolean;
  className?: string;
};

function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel = "확인",
  cancelLabel = "취소",
  onConfirm,
  onCancel,
  confirmDisabled,
  className,
}: ConfirmModalProps) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Backdrop
          data-slot="confirm-modal-overlay"
          // dialog.tsx 와 동일한 딤(Opacity/dim) + 페이드
          className="overlay-fill isolate z-50 bg-dim duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
        />
        <AlertDialogPrimitive.Popup
          data-slot="confirm-modal"
          className={cn(
            // 위치 — mobile 화면 중앙 / desktop 시안(1517:8879·1517:8779)은 상단에서 48px
            "fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 sm:top-12 sm:translate-y-0",
            // 등장 애니메이션(dialog.tsx 패턴 동일)
            "duration-100 outline-none",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            // 컨테이너 — radius/lg(16px), Background/primary, Interaction drop-shadow
            "flex flex-col rounded-[16px] bg-bg-primary shadow-[0_4px_8px_rgb(35_35_33/0.13)]",
            // mobile: 시안(375 기준 311px)의 **좌우 여백 32px** 을 유지해 화면 폭에 따라 늘어난다.
            //         375 → 311(시안 그대로) / 440 → 376 / 그 이상은 400 에서 멈춘다.
            //         100vw 가 아니라 100%(=fixed 요소의 ICB) 인 이유: 스크롤바 거터가 있으면
            //         100vw 와 left-1/2 의 기준이 달라져 좌우 여백이 어긋난다(실측 32 vs 47).
            "w-[calc(100%-4rem)] max-w-[400px] gap-4 px-4 pt-4 pb-3",
            // desktop: 430px, padding 24/24/16, gap 24 (모바일 상한 400 을 풀어 준다)
            "sm:w-[430px] sm:max-w-none sm:gap-6 sm:px-6 sm:pt-6 sm:pb-4",
            className,
          )}
        >
          {/*
            텍스트 블록 — mobile 가운데 정렬 / desktop 좌측 정렬.
            break-keep : 한국어를 어절 단위로만 끊는다(단어 중간에서 깨지지 않게).
            text-balance: 줄 길이를 고르게 나눠 마지막 줄에 두세 글자만 남는 것을 막는다.
          */}
          <div className="flex flex-col gap-1 text-center text-balance break-keep sm:text-left">
            <AlertDialogPrimitive.Title
              // Heading 1 — 크기는 전역 모바일 스케일(24→20), 행간은 두 모드 모두 32
              className="text-heading-1 text-text-primary"
            >
              {title}
            </AlertDialogPrimitive.Title>
            {description ? (
              <AlertDialogPrimitive.Description
                // Body 3 — 크기는 전역 스케일(14→12). 행간만 모바일 20 / 데스크톱 24
                className="text-body-3 leading-5 text-text-secondary sm:leading-6"
              >
                {description}
              </AlertDialogPrimitive.Description>
            ) : null}
          </div>

          {/* 자유 영역 — 라디오 그룹·입력창 등. 텍스트 블록 밖이라 flow content 를 넣어도 된다.
              (텍스트 블록의 가운데 정렬을 물려받지 않도록 형제로 둔다) */}
          {children}

          {/*
            버튼 — mobile 5:5 분할(높이 36) / desktop 우측 정렬 + 콘텐츠 폭(높이 48).
            basis-0: 라벨 길이가 서로 달라도("새로 작성하기" vs "불러오기") 정확히 반반으로 나뉜다.
            라벨은 Button 기본값(whitespace-nowrap)이라 버튼 안에서 줄바꿈되지 않는다.
          */}
          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <AlertDialogPrimitive.Close
              render={
                <Button
                  variant="neutral"
                  size="sm"
                  className="flex-1 basis-0 sm:h-12 sm:flex-none sm:basis-auto sm:px-4 sm:text-title-1"
                />
              }
              onClick={onCancel}
            >
              {cancelLabel}
            </AlertDialogPrimitive.Close>
            <Button
              variant="brand"
              size="sm"
              className="flex-1 basis-0 sm:h-12 sm:flex-none sm:basis-auto sm:px-4 sm:text-title-1"
              disabled={confirmDisabled}
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

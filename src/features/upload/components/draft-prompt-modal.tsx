"use client";

import { ConfirmModal } from "@/components/ui/confirm-modal";

/**
 * 임시저장 복원 모달 — Figma Modal(desktop 1517:8779 / mobile 1517:9077).
 *
 * 공용 Modal 규격(ConfirmModal)을 그대로 쓴다:
 * - desktop : 430px, 좌측 정렬, 버튼 우측 정렬(48px)
 * - mobile  : 311px, 화면 중앙, 가운데 정렬, 버튼 5:5(36px)
 *
 * 선택지 두 가지:
 * - 불러오기(brand)      : 임시저장 내용을 폼에 채운다.
 * - 새로 작성하기(neutral): 임시저장을 삭제하고 빈 폼으로 시작(되돌릴 수 없어 문구로 경고).
 */
type DraftPromptModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoad: () => void;
  onDiscard: () => void;
  /** 임시저장 시각(ISO) — 있으면 안내에 표시 */
  savedAt?: string;
  /** 새로 작성하기 처리 중(삭제 진행) */
  discarding?: boolean;
};

/** 시안 표기: `2026.07.29 15:00` */
function formatSavedAt(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function DraftPromptModal({
  open,
  onOpenChange,
  onLoad,
  onDiscard,
  savedAt,
  discarding,
}: DraftPromptModalProps) {
  const savedLabel = formatSavedAt(savedAt);

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="임시저장된 글이 있어요"
      description={
        <>
          이어서 작성하시겠어요?
          {savedLabel ? (
            <>
              <br />
              최근 저장: {savedLabel}
            </>
          ) : null}
          <br />
          <span className="font-bold text-text-brand">
            ‘새로 작성하기’를 선택하실 경우 임시저장된 글은 삭제돼요.
          </span>
        </>
      }
      cancelLabel="새로 작성하기"
      confirmLabel="불러오기"
      confirmDisabled={discarding}
      onCancel={onDiscard}
      onConfirm={onLoad}
    />
  );
}

export { DraftPromptModal };

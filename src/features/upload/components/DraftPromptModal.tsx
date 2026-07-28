"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * 임시저장 복원 모달.
 * 진입 시 임시저장된 글이 있으면 띄운다. 두 가지 선택:
 * - 불러오기: 임시저장 내용을 폼에 채운다.
 * - 새로 작성하기: 임시저장을 삭제하고 빈 폼으로 시작(되돌릴 수 없음 → 문구로 경고).
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

function formatSavedAt(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="gap-6">
        <DialogHeader>
          <DialogTitle>임시저장된 글이 있어요</DialogTitle>
          <DialogDescription>
            이어서 작성할까요?
            {savedLabel ? (
              <>
                <br />
                <span className="text-text-secondary">최근 저장: {savedLabel}</span>
              </>
            ) : null}
            <br />
            <span className="text-text-brand">
              ‘새로 작성하기’를 선택하면 임시저장된 내용은 삭제돼요.
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="ghost" size="lg" onClick={onDiscard} disabled={discarding}>
            새로 작성하기
          </Button>
          <Button variant="brand" size="lg" onClick={onLoad} disabled={discarding}>
            불러오기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { DraftPromptModal };

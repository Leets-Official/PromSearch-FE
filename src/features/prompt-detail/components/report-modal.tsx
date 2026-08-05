"use client";

import { useState } from "react";

import { ConfirmModal } from "@/components/ui/confirm-modal";
import { REPORT_REASONS } from "@/features/prompt-detail/api/report";
import type { ApiReportReason } from "@/features/prompt-detail/api/dto";

/**
 * 신고 확인 모달 — 사유 선택 + 선택 입력.
 *
 * 공용 `ConfirmModal` 의 `children` 슬롯에 사유 라디오를 넣는다.
 * `description` 이 아닌 이유: 그쪽은 `<p>`(aria-describedby 대상)라 `<fieldset>` 같은
 * flow content 를 담을 수 없다 — 넣으면 브라우저가 `<p>` 를 강제로 닫아 하이드레이션이 깨진다.
 * 사유는 서버 enum 과 1:1 이고(`SPAM`/`INAPPROPRIATE`/`COPYRIGHT`/`LOW_QUALITY`/`ETC`),
 * **하나를 고르기 전에는 확인 버튼이 비활성**이다 — 서버에서 `reason` 이 필수라서다.
 *
 * 라디오를 쓴 이유: 사유는 **택1**이고, 스크린리더에서 그룹으로 읽혀야 한다.
 */
type ReportModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 무엇을 신고하는지 — 문구만 바뀐다 */
  target: "게시글" | "댓글";
  onConfirm: (reason: ApiReportReason, description: string) => void;
};

export function ReportModal({ open, onOpenChange, target, onConfirm }: ReportModalProps) {
  const [reason, setReason] = useState<ApiReportReason | null>(null);
  const [detail, setDetail] = useState("");

  // 열릴 때마다 이전 선택을 지운다.
  // effect 가 아니라 **렌더 중 조정**이다 — effect 로 하면 초기화 전 값이 한 번 그려진 뒤
  // 다시 렌더되어 깜빡인다(React 의 "props 변화로 state 조정" 패턴).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setReason(null);
      setDetail("");
    }
  }

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title={`이 ${target}을 신고할까요?`}
      description="신고 내용은 검토 후 운영 정책에 따라 조치됩니다."
      cancelLabel="취소"
      confirmLabel="신고하기"
      confirmDisabled={reason === null}
      onConfirm={() => {
        if (reason) onConfirm(reason, detail);
      }}
    >
      <div className="flex flex-col gap-3 text-left">
        <fieldset className="flex flex-col gap-2">
          <legend className="sr-only">신고 사유</legend>
          {REPORT_REASONS.map((item) => (
            <label
              key={item.value}
              className="flex cursor-pointer items-center gap-2 text-body-2 text-text-primary"
            >
              <input
                type="radio"
                name="report-reason"
                value={item.value}
                checked={reason === item.value}
                onChange={() => setReason(item.value)}
                className="size-4 accent-interaction-brand"
              />
              {item.label}
            </label>
          ))}
        </fieldset>

        <input
          type="text"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          maxLength={500}
          placeholder="상세 사유 (선택)"
          aria-label="상세 사유"
          className="h-10 w-full rounded-md border border-stroke-disabled bg-bg-primary px-3 text-body-2 text-text-primary outline-none placeholder:text-text-disabled focus-visible:border-stroke-strong"
        />
      </div>
    </ConfirmModal>
  );
}

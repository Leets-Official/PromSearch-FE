"use client";

import { useState } from "react";

import { ConfirmModal } from "@/components/ui/confirm-modal";
import { REPORT_REASONS, type ReportTargetType } from "@/features/prompt-detail/api/report";
import { useCreateReport } from "@/features/prompt-detail/hooks/use-prompt-actions";
import { getErrorMessage } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import type { ApiReportReason } from "@/features/prompt-detail/api/dto";

/**
 * 신고 확인 모달 — 사유 선택 + 선택 입력 + 접수.
 *
 * 공용 `ConfirmModal` 의 `children` 슬롯에 사유 라디오를 넣는다.
 * `description` 이 아닌 이유: 그쪽은 `<p>`(aria-describedby 대상)라 `<fieldset>` 같은
 * flow content 를 담을 수 없다 — 넣으면 브라우저가 `<p>` 를 강제로 닫아 하이드레이션이 깨진다.
 * 사유는 서버 enum 과 1:1 이고(`SPAM`/`INAPPROPRIATE`/`COPYRIGHT`/`LOW_QUALITY`/`ETC`),
 * **하나를 고르기 전에는 확인 버튼이 비활성**이다 — 서버에서 `reason` 이 필수라서다.
 *
 * 라디오를 쓴 이유: 사유는 **택1**이고, 스크린리더에서 그룹으로 읽혀야 한다.
 *
 * **접수 요청을 이 컴포넌트가 직접 한다.** 예전에는 호출부가 `mutate` 하고 곧바로 모달을
 * 닫았는데, 그러면 실패 응답(예: `MODERATION-004 이미 신고한 대상입니다.`)이 갈 곳이 없어
 * 사용자에게 아무 일도 일어나지 않은 것처럼 보였다. 지금은 **성공해야 닫는다** —
 * 실패하면 모달을 열어 둔 채 서버 문구를 그대로 보여 준다(사유를 다시 고를 필요 없이 재시도 가능).
 */
type ReportModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 신고 대상 — API 경로(`/reports/posts` vs `/reports/comments`)와 문구가 함께 갈린다 */
  target: ReportTargetType;
  /** 신고할 게시글/댓글 id */
  targetId: string;
  /** 접수 성공 후 호출(선택) — 호출부가 잡고 있던 대상 상태를 정리할 때 쓴다 */
  onReported?: () => void;
};

/** API 대상 → 화면 문구 */
const TARGET_LABEL: Record<ReportTargetType, string> = {
  post: "게시글",
  comment: "댓글",
};

export function ReportModal({
  open,
  onOpenChange,
  target,
  targetId,
  onReported,
}: ReportModalProps) {
  const [reason, setReason] = useState<ApiReportReason | null>(null);
  const [detail, setDetail] = useState("");
  const report = useCreateReport();
  // 접수되면 모달이 닫혀 문구를 놓을 자리가 없다 → 토스트로 확인시킨다.
  const { toastSuccess } = useToast();

  // 열릴 때마다 이전 선택을 지운다.
  // effect 가 아니라 **렌더 중 조정**이다 — effect 로 하면 초기화 전 값이 한 번 그려진 뒤
  // 다시 렌더되어 깜빡인다(React 의 "props 변화로 state 조정" 패턴).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setReason(null);
      setDetail("");
      report.reset(); // 지난 번 실패 문구가 남아 있지 않게
    }
  }

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title={`이 ${TARGET_LABEL[target]}을 신고할까요?`}
      // 사유 라디오 5개 + 입력창이라 상단 정렬하면 아래로 길게 늘어진다
      placement="center"
      description="신고 내용은 검토 후 운영 정책에 따라 조치됩니다."
      cancelLabel="취소"
      confirmLabel={report.isPending ? "신고 중…" : "신고하기"}
      // 전송 중 중복 접수를 막는다(서버가 MODERATION-004 로 거절하기 전에 클라이언트에서 차단)
      confirmDisabled={reason === null || report.isPending}
      onConfirm={() => {
        if (!reason) return;
        report.mutate(
          { target, targetId, reason, description: detail },
          {
            onSuccess: () => {
              onOpenChange(false);
              onReported?.();
              toastSuccess("신고가 접수됐어요. 검토 후 조치할게요.");
            },
            // 실패는 여기서 아무것도 하지 않는다 — 모달을 열어 둔 채 아래에서 문구를 보여 준다.
          },
        );
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

        {/* 접수 실패 — 서버 문구를 그대로 보여 준다("이미 신고한 대상입니다." 등).
            role="alert" 이라 스크린리더가 즉시 읽는다(댓글 입력 실패와 같은 패턴). */}
        {report.error ? (
          <p role="alert" className="text-body-3 text-text-brand">
            {getErrorMessage(report.error)}
          </p>
        ) : null}
      </div>
    </ConfirmModal>
  );
}

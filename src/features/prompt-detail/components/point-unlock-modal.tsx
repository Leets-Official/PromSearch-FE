"use client";

import { ConfirmModal } from "@/components/ui/confirm-modal";
import { MOCK_PROFILE } from "@/mocks/data/mypage";

/**
 * 프리미엄 프롬프트 열람에 필요한 포인트.
 * 아직 상세 응답에 가격 필드가 없어 상수로 둔다(BE 스펙 확정 시 `detail.price` 로 교체).
 */
export const PREMIUM_UNLOCK_POINT = 100;

/**
 * 보유 포인트 — 실제 소스가 없어 마이페이지와 동일한 목 프로필을 본다.
 * (`/api/me` 가 생기면 이 함수만 훅으로 교체하면 된다)
 */
function useMyPoints(): number {
  return MOCK_PROFILE.points;
}

type PointUnlockModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 차감 확정 */
  onConfirm: () => void;
  /** 필요 포인트(기본: 프리미엄 기본가) */
  requiredPoints?: number;
};

/**
 * 포인트 결제 확인 모달 — "포인트로 전문 보기" CTA 에서 열린다.
 *
 * 시안이 없어 공용 Modal(ConfirmModal) 규격을 그대로 따르고, 설명 자리에
 * 보유/필요/차감 후 잔액을 한 줄씩 보여준다. 포인트가 모자라면 확인 버튼을 막고 안내한다.
 */
export function PointUnlockModal({
  open,
  onOpenChange,
  onConfirm,
  requiredPoints = PREMIUM_UNLOCK_POINT,
}: PointUnlockModalProps) {
  const myPoints = useMyPoints();
  const enough = myPoints >= requiredPoints;
  const rest = myPoints - requiredPoints;

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="포인트로 전문을 열람할까요?"
      description={
        <span className="flex flex-col gap-1 text-left">
          <PointRow label="보유 포인트" value={`${myPoints.toLocaleString()}P`} />
          <PointRow label="필요 포인트" value={`${requiredPoints.toLocaleString()}P`} />
          {enough ? (
            <PointRow label="차감 후 잔액" value={`${rest.toLocaleString()}P`} />
          ) : (
            <span className="pt-1 text-text-brand">
              포인트가 {(requiredPoints - myPoints).toLocaleString()}P 부족해요.
            </span>
          )}
        </span>
      }
      cancelLabel="취소"
      confirmLabel="포인트 사용하기"
      confirmDisabled={!enough}
      onConfirm={onConfirm}
    />
  );
}

function PointRow({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-center justify-between gap-4">
      <span className="text-text-secondary">{label}</span>
      <span className="text-title-3 text-text-primary">{value}</span>
    </span>
  );
}

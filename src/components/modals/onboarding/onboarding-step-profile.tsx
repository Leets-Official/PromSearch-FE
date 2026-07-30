"use client";

import { Button } from "@/components/ui/button";
import { ProfileNicknameField } from "@/features/auth/components/profile-nickname-field";
import type { NicknameStatus } from "@/features/auth/hooks/use-nickname-check";

interface OnboardingStepProfileProps {
  nickname: string;
  onNicknameChange: (nickname: string) => void;
  nicknameStatus: NicknameStatus;
  avatarFile: File | null;
  onAvatarChange: (file: File | null) => void;
  onNext: () => void;
}

/** 온보딩 1단계 — 공용 프로필/닉네임 입력 + "다음" 버튼 */
export function OnboardingStepProfile({
  nickname,
  onNicknameChange,
  nicknameStatus,
  avatarFile,
  onAvatarChange,
  onNext,
}: OnboardingStepProfileProps) {
  return (
    <>
      <ProfileNicknameField
        nickname={nickname}
        onNicknameChange={onNicknameChange}
        nicknameStatus={nicknameStatus}
        avatarFile={avatarFile}
        onAvatarChange={onAvatarChange}
        layout="vertical"
      />
      <Button
        variant="brand"
        size="lg"
        className="w-full"
        disabled={nicknameStatus !== "available"}
        onClick={onNext}
      >
        다음
      </Button>
    </>
  );
}

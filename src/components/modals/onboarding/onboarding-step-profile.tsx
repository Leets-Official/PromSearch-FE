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

/** 온보딩 1단계 — 공용 프로필/닉네임 입력 + "다음" 버튼(모바일 하단 고정) */
export function OnboardingStepProfile({
  nickname,
  onNicknameChange,
  nicknameStatus,
  avatarFile,
  onAvatarChange,
  onNext,
}: OnboardingStepProfileProps) {
  return (
    <div className="flex flex-1 flex-col gap-8">
      <ProfileNicknameField
        nickname={nickname}
        onNicknameChange={onNicknameChange}
        nicknameStatus={nicknameStatus}
        avatarFile={avatarFile}
        onAvatarChange={onAvatarChange}
        layout="vertical"
      />

      {/* 다음: 모바일에서 mt-auto 로 하단 고정 / sm+ 는 자연 위치 */}
      <Button
        variant="brand"
        size="lg"
        className="mt-auto w-full sm:mt-0"
        disabled={nicknameStatus !== "available"}
        onClick={onNext}
      >
        다음
      </Button>
    </div>
  );
}

"use client";

import { useState } from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { NicknameStatus } from "@/features/auth/hooks/use-nickname-check";
import { OnboardingStepProfile } from "./onboarding-step-profile";
import { OnboardingStepInterests } from "./onboarding-step-interests";
import { STEP_META } from "./constants";
import type { OnboardingResult } from "./types";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (result: OnboardingResult) => void;
  onSkip?: () => void;
  nicknameStatus?: NicknameStatus;
  onNicknameChange?: (nickname: string) => void;
}

/**
 * 온보딩 모달 (Figma: 로그인 - 온보딩 1/2·2/2)
 * DialogContent 사용 — 오버레이(딤)·포커스트랩·스크롤잠금은 dialog.tsx가 처리.
 * 닫힐 때 step·입력값을 초기화해 다음에 열면 1단계부터 시작한다.
 */
function OnboardingModal({
  open,
  onOpenChange,
  onComplete,
  onSkip,
  nicknameStatus = "idle",
  onNicknameChange,
}: OnboardingModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [nickname, setNickname] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [jobs, setJobs] = useState<string[]>([]);
  const [tasks, setTasks] = useState<string[]>([]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setStep(1);
      setNickname("");
      onNicknameChange?.("");
      setAvatarFile(null);
      setJobs([]);
      setTasks([]);
    }
    onOpenChange(next);
  };

  const handleNicknameChange = (value: string) => {
    setNickname(value);
    onNicknameChange?.(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex w-[440px] max-w-[calc(100%-2rem)] flex-col gap-6 rounded-2xl bg-bg-elevated p-8 sm:max-w-[440px]"
      >
        {/* 헤더 */}
        <div className="flex flex-col gap-1">
          <span className="text-title-3 text-text-brand">{step} / 2</span>
          <DialogTitle className="text-heading-1 text-text-primary">
            {STEP_META[step].title}
          </DialogTitle>
          {STEP_META[step].description && (
            <p className="text-body-3 text-text-secondary">{STEP_META[step].description}</p>
          )}
        </div>

        {step === 1 ? (
          <OnboardingStepProfile
            nickname={nickname}
            onNicknameChange={handleNicknameChange}
            nicknameStatus={nicknameStatus}
            avatarFile={avatarFile}
            onAvatarChange={setAvatarFile}
            onNext={() => setStep(2)}
          />
        ) : (
          <OnboardingStepInterests
            jobs={jobs}
            tasks={tasks}
            onJobsChange={setJobs}
            onTasksChange={setTasks}
            onComplete={() => onComplete?.({ nickname, avatarFile, jobs, tasks })}
            onSkip={() => onSkip?.()}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export { OnboardingModal };

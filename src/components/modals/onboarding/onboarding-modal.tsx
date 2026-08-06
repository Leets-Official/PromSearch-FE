"use client";

import { useState } from "react";
import { ChevronLeftIcon } from "@/components/ui/icons";

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
  nickname?: string;
  onNicknameChange?: (nickname: string) => void;
}

/**
 * 온보딩 모달 (Figma: 로그인 - 온보딩 1/2·2/2)
 * 반응형: 모바일은 전체화면 시트 + 상단 뒤로가기, sm+ 는 중앙 카드.
 * 스텝 영역이 flex-1 로 공간을 채워, 스텝의 하단 버튼(mt-auto)이 화면 아래에 고정된다.
 */
function OnboardingModal({
  open,
  onOpenChange,
  onComplete,
  onSkip,
  nicknameStatus = "idle",
  nickname: nicknameProp,
  onNicknameChange,
}: OnboardingModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [internalNickname, setInternalNickname] = useState("");
  const nickname = nicknameProp ?? internalNickname;
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [jobs, setJobs] = useState<string[]>([]);
  const [tasks, setTasks] = useState<string[]>([]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setStep(1);
      setInternalNickname("");
      onNicknameChange?.("");
      setAvatarFile(null);
      setJobs([]);
      setTasks([]);
    }
    onOpenChange(next);
  };

  const handleNicknameChange = (value: string) => {
    setInternalNickname(value);
    onNicknameChange?.(value);
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        fullScreenOnMobile
        className="gap-6 bg-bg-elevated sm:max-w-[440px] sm:rounded-2xl sm:p-8"
      >
        {/* 상단 뒤로가기 (모바일 전용) — 로그인과 동일 스펙 */}
        <button
          type="button"
          onClick={handleBack}
          aria-label="뒤로 가기"
          className="mb-2 -ml-2 flex size-11 items-center justify-center self-start rounded-md py-2 text-stroke-strong transition-colors hover:text-text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:hidden"
        >
          <ChevronLeftIcon className="size-7" />
        </button>

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

        {/* 스텝 영역 — 모바일에서 남은 공간을 채워 하단 버튼을 아래로 밀어냄 */}
        <div className="flex flex-1 flex-col sm:flex-none">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { OnboardingModal };

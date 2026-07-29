"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { cn } from "@/lib/utils";
import { Dialog, DialogPortal, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
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
 * 껍데기(Dialog/오버레이) + step·입력 상태만 관리하고, 각 단계는 하위 컴포넌트에 위임.
 * 미리보기 URL 관리는 ProfileNicknameField(공용)로 이전되어 여기선 avatarFile만 다룬다.
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

  // 모달이 닫힐 때 온보딩 상태 초기화 (다음에 열면 1단계부터)
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setStep(1);
      setNickname("");
      onNicknameChange?.(""); // 부모 훅의 nicknameStatus도 idle로 되돌림
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
      <DialogPortal>
        <DialogOverlay className="backdrop-blur-sm" />

        <DialogPrimitive.Popup
          data-slot="dialog-content"
          className={cn(
            "fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-4rem)] w-[440px]",
            "max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col",
            "gap-6 overflow-y-auto overscroll-contain rounded-2xl bg-bg-elevated p-8",
            "shadow-[0_4px_8px_0_rgb(35_35_33/0.13)] outline-none",
            "duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
            "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          )}
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
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}

export { OnboardingModal };

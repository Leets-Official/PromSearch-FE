"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { cn } from "@/lib/utils";
import { Dialog, DialogPortal, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import type { NicknameStatus } from "@/features/auth/hooks/use-nickname-check";
import { OnboardingStepProfile } from "./onboarding-step-profile";
import { OnboardingStepInterests } from "./onboarding-step-interests";
import { MAX_JOBS, MAX_TASKS } from "./constants";
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
 * 껍데기(Dialog/오버레이) + step 상태만 관리하고, 각 단계는 하위 컴포넌트에 위임.
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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [jobs, setJobs] = useState<string[]>([]);
  const [tasks, setTasks] = useState<string[]>([]);

  const handleNicknameChange = (value: string) => {
    setNickname(value);
    onNicknameChange?.(value);
  };

  const handleAvatarChange = (file: File | null) => {
    setAvatarFile(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : null);
  };

  const toggle = (list: string[], value: string, max: number) =>
    list.includes(value)
      ? list.filter((v) => v !== value)
      : list.length < max
        ? [...list, value]
        : list;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <DialogTitle className="text-heading-1 text-text-primary">타이틀</DialogTitle>
            <p className="text-body-3 text-text-secondary">
              설명을 적습니다. 필요없다면 안 적어도 상관없음
            </p>
          </div>

          {step === 1 ? (
            <OnboardingStepProfile
              nickname={nickname}
              onNicknameChange={handleNicknameChange}
              nicknameStatus={nicknameStatus}
              avatarPreview={avatarPreview}
              onAvatarChange={handleAvatarChange}
              onNext={() => setStep(2)}
            />
          ) : (
            <OnboardingStepInterests
              jobs={jobs}
              tasks={tasks}
              onToggleJob={(v) => setJobs((prev) => toggle(prev, v, MAX_JOBS))}
              onToggleTask={(v) => setTasks((prev) => toggle(prev, v, MAX_TASKS))}
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

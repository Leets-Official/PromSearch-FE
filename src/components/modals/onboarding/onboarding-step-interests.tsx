"use client";

import { Button } from "@/components/ui/button";
import { InterestChips } from "@/features/auth/components/interest-chips";

interface OnboardingStepInterestsProps {
  jobs: string[];
  tasks: string[];
  onJobsChange: (jobs: string[]) => void;
  onTasksChange: (tasks: string[]) => void;
  onComplete: () => void;
  onSkip: () => void;
}

/** 온보딩 2단계 — 공용 관심 선택 + 저장/스킵 버튼 */
export function OnboardingStepInterests({
  jobs,
  tasks,
  onJobsChange,
  onTasksChange,
  onComplete,
  onSkip,
}: OnboardingStepInterestsProps) {
  const canSave = jobs.length > 0 || tasks.length > 0;

  return (
    <>
      <InterestChips
        jobs={jobs}
        tasks={tasks}
        onJobsChange={onJobsChange}
        onTasksChange={onTasksChange}
      />

      <div className="flex flex-col gap-2">
        <Button
          variant="brand"
          size="lg"
          className="w-full"
          disabled={!canSave}
          onClick={onComplete}
        >
          저장하고 시작하기
        </Button>
        <button
          type="button"
          onClick={onSkip}
          className="w-full rounded-sm text-center text-title-3 text-text-disabled hover:text-text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          나중에 선택할게요
        </button>
      </div>
    </>
  );
}

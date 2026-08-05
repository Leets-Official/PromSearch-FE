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

/** 온보딩 2/2 — 관심 직군·태스크. 하단 버튼 그룹은 모바일에서 화면 아래 고정. */
export function OnboardingStepInterests({
  jobs,
  tasks,
  onJobsChange,
  onTasksChange,
  onComplete,
  onSkip,
}: OnboardingStepInterestsProps) {
  // 직군 또는 태스크 중 하나만 선택되어도 저장 가능 (OR 조건)
  const canComplete = jobs.length > 0 || tasks.length > 0;

  return (
    <div className="flex flex-1 flex-col gap-8">
      <InterestChips
        jobs={jobs}
        tasks={tasks}
        onJobsChange={onJobsChange}
        onTasksChange={onTasksChange}
      />

      {/* 버튼 그룹: 모바일에서 mt-auto 로 하단 고정 */}
      <div className="mt-auto flex flex-col gap-2 sm:mt-0">
        <Button
          variant="brand"
          size="lg"
          onClick={onComplete}
          disabled={!canComplete}
          className="w-full"
        >
          저장하고 시작하기
        </Button>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-sm py-1 text-title-3 text-text-secondary hover:text-text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          나중에 선택할게요
        </button>
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { ChipGroup } from "./chip-group";
import { JOB_OPTIONS, TASK_OPTIONS, MAX_JOBS, MAX_TASKS } from "./constants";

interface OnboardingStepInterestsProps {
  jobs: string[];
  tasks: string[];
  onToggleJob: (value: string) => void;
  onToggleTask: (value: string) => void;
  onComplete: () => void;
  onSkip: () => void;
}

/** 온보딩 2단계 — 관심 직군 + 관심 태스크 (각 최대 3) */
export function OnboardingStepInterests({
  jobs,
  tasks,
  onToggleJob,
  onToggleTask,
  onComplete,
  onSkip,
}: OnboardingStepInterestsProps) {
  const canSave = jobs.length > 0 || tasks.length > 0;

  return (
    <>
      <ChipGroup
        label="관심 직군"
        hint={`최대 ${MAX_JOBS}개까지 선택할 수 있어요.`}
        options={JOB_OPTIONS}
        selected={jobs}
        onToggle={onToggleJob}
      />
      <ChipGroup
        label="관심 태스크"
        hint={`최대 ${MAX_TASKS}개까지 선택할 수 있어요.`}
        options={TASK_OPTIONS}
        selected={tasks}
        onToggle={onToggleTask}
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
          className="rounded-sm text-title-3 text-text-disabled hover:text-text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          나중에 선택할게요
        </button>
      </div>
    </>
  );
}

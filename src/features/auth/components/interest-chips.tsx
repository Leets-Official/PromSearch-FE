"use client";

import { ChipGroup } from "@/components/modals/onboarding/chip-group";
import {
  JOB_OPTIONS,
  TASK_OPTIONS,
  MAX_JOBS,
  MAX_TASKS,
} from "@/components/modals/onboarding/constants";

interface InterestChipsProps {
  jobs: string[];
  tasks: string[];
  onJobsChange: (jobs: string[]) => void;
  onTasksChange: (tasks: string[]) => void;
}

/** 관심 직군 + 관심 태스크 선택 (온보딩·회원가입 공용, 각 최대 3) */
export function InterestChips({ jobs, tasks, onJobsChange, onTasksChange }: InterestChipsProps) {
  const toggle = (list: string[], value: string, max: number) =>
    list.includes(value)
      ? list.filter((v) => v !== value)
      : list.length < max
        ? [...list, value]
        : list;

  return (
    <div className="flex w-full flex-col gap-8">
      <ChipGroup
        label="관심 직군"
        hint={`최대 ${MAX_JOBS}개까지 선택할 수 있어요.`}
        options={JOB_OPTIONS}
        selected={jobs}
        onToggle={(v) => onJobsChange(toggle(jobs, v, MAX_JOBS))}
      />
      <ChipGroup
        label="관심 태스크"
        hint={`최대 ${MAX_TASKS}개까지 선택할 수 있어요.`}
        options={TASK_OPTIONS}
        selected={tasks}
        onToggle={(v) => onTasksChange(toggle(tasks, v, MAX_TASKS))}
      />
    </div>
  );
}

"use client";

import { Chip } from "@/components/ui/chip";
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

/** 라벨 + 힌트 + 선택 칩 그룹 */
function ChipGroup({
  label,
  hint,
  options,
  selected,
  onToggle,
}: {
  label: string;
  hint: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <span className="text-title-3 text-text-primary">{label}</span>
        <span className="text-caption-1 text-text-brand">{hint}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => (
          <Chip
            key={option}
            selected={selected.includes(option)}
            onClick={() => onToggle(option)}
            className="w-full"
          >
            {option}
          </Chip>
        ))}
      </div>
    </div>
  );
}

/**
 * 온보딩/회원가입 칩(한글 라벨 문자열) → BE 태그 ID 변환.
 *
 * 칩 컴포넌트(InterestChips/ChipGroup)는 "학생", "PPT" 같은 한글 라벨을 값으로 쓰는데,
 * 실제 태그 ID 매핑(@/features/gallery/tag-ids)은 JobCategory/Task enum을 키로 쓴다.
 * enum ↔ 라벨 변환은 @/features/gallery/categories 의 라벨 상수(enum → 라벨)를 역으로 뒤집어 사용한다.
 */

import { JOB_CATEGORY_LABEL, TASK_LABEL } from "@/features/gallery/categories";
import { JOB_TAG_ID, TASK_TAG_ID } from "@/features/gallery/tag-ids";
import type { JobCategory, Task } from "@/features/gallery/types";

function invertLabelMap<K extends string>(record: Record<K, string>): Record<string, K> {
  return Object.fromEntries(Object.entries(record).map(([key, label]) => [label, key])) as Record<
    string,
    K
  >;
}

const LABEL_TO_JOB = invertLabelMap<JobCategory>(JOB_CATEGORY_LABEL);
const LABEL_TO_TASK = invertLabelMap<Task>(TASK_LABEL);

/** 한글 라벨 배열(예: ["학생", "직장인"]) → BE 태그 ID 배열 */
export function toJobTagIds(labels: string[]): number[] {
  return labels
    .map((label) => LABEL_TO_JOB[label])
    .filter((job): job is JobCategory => job != null)
    .map((job) => JOB_TAG_ID[job]);
}

/** 한글 라벨 배열(예: ["PPT", "이메일"]) → BE 태그 ID 배열 */
export function toTaskTagIds(labels: string[]): number[] {
  return labels
    .map((label) => LABEL_TO_TASK[label])
    .filter((task): task is Task => task != null)
    .map((task) => TASK_TAG_ID[task]);
}

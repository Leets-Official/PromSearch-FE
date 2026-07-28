/**
 * 홈 갤러리 목 시드 데이터.
 *
 * BE 스펙 확정(약 1주 후) 전까지 이 데이터로 목록/필터/정렬/페이지네이션을 개발·검증한다.
 * status 를 섞어 두어 "ACTIVE 만 노출" 규칙을 목/테스트에서 확인할 수 있게 한다.
 */

import type {
  AiModel,
  ContentTier,
  JobCategory,
  OutputType,
  PostStatus,
  PromptSummary,
  Task,
} from "@/features/gallery/types";

export type PromptRecord = PromptSummary & { status: PostStatus };

// 조합을 순환시키기 위한 축들
const MODELS: AiModel[] = ["chatgpt", "gemini", "claude", "etc"];
const OUTPUT_TYPES: OutputType[] = ["image", "text"];
const TIERS: ContentTier[] = ["free", "premium", "master"];
const JOBS: JobCategory[] = [
  "student",
  "worker",
  "planner",
  "designer",
  "developer",
  "self_employed",
];
const TASKS: Task[] = ["ppt", "report", "email", "meeting_notes", "document", "image_gen"];
const STATUSES: PostStatus[] = ["active", "active", "active", "active", "hidden", "draft"];

// 결정적(deterministic) createdAt 을 위해 고정 기준 시각 사용 (실행 시각에 의존하지 않음)
const BASE_MS = Date.parse("2026-07-15T00:00:00.000Z");
const DAY_MS = 24 * 60 * 60 * 1000;

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

// 시드 48개 생성 — 각 축을 서로 다른 주기로 순환시켜 조합이 겹치지 않게 한다.
export const PROMPT_SEED: PromptRecord[] = Array.from({ length: 48 }, (_, i) => {
  const model = pick(MODELS, i);
  const outputType = pick(OUTPUT_TYPES, i);
  const tier = pick(TIERS, i);
  const primaryJob = pick(JOBS, i);
  const secondaryJob = pick(JOBS, i + 2);
  const primaryTask = pick(TASKS, i);
  const secondaryTask = pick(TASKS, i + 3);
  const status = pick(STATUSES, i);

  const id = `prompt-${String(i + 1).padStart(3, "0")}`;
  return {
    id,
    title: `프롬프트 예시 ${i + 1}`,
    description: `${primaryJob} 대상 ${primaryTask} 프롬프트 설명 ${i + 1}`,
    // 실제 로드되는 placeholder(picsum). BE 연동 시 워터마크 처리본 URL 로 교체
    thumbnailUrl: `https://picsum.photos/seed/${id}/640/360`,
    outputType,
    model,
    modelEtcName: model === "etc" ? "뤼튼" : undefined,
    tasks: primaryTask === secondaryTask ? [primaryTask] : [primaryTask, secondaryTask],
    jobCategories: primaryJob === secondaryJob ? [primaryJob] : [primaryJob, secondaryJob],
    tier,
    author: { name: `작성자${(i % 7) + 1}` },
    stats: {
      views: 100 + i * 13,
      copies: (i * 7) % 50,
      likes: (i * 11) % 40,
    },
    createdAt: new Date(BASE_MS - i * DAY_MS).toISOString(),
    status,
  } satisfies PromptRecord;
});

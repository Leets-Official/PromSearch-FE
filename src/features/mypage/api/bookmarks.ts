import { api } from "@/lib/api";
import type { AiModel, OutputType, PromptSummary, Task } from "@/features/gallery/types";
import { TASK_TAG_ID, AI_MODEL_TAG_ID } from "@/features/gallery/tag-ids";
import { LABEL_TO_TASK, LABEL_TO_AI_MODEL } from "@/features/auth/lib/tag-mapping"; // PS-71

export interface BookmarkAuthor {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
}

export interface BookmarkTag {
  tagId: number;
  tagType: "JOB" | "TASK" | "AI_MODEL";
  name: string;
}

export interface BookmarkPrompt {
  promptId: number;
  title: string;
  thumbnailImage: string | null;
  contentType: "FREE" | "PREMIUM" | "MASTER";
  outputType: "TEXT" | "IMAGE";
  pricePoint: number;
  viewCount: number;
  likeCount: number;
  author: BookmarkAuthor;
  tags: BookmarkTag[];
  bookmarkedAt: string;
}

interface BookmarksPage {
  prompts: BookmarkPrompt[];
  page: {
    page: number;
    size: number;
    totalElements: number;
    hasNext: boolean;
  };
}

export interface FetchBookmarksParams {
  taskTagIds?: number[];
  aiModelTagIds?: number[];
  outputTypes?: OutputType[];
  page: number;
  size: number;
}

/** [COMMUNITY-005] 내 북마크 목록 조회 */
export function fetchMyBookmarks({
  taskTagIds,
  aiModelTagIds,
  outputTypes,
  page,
  size,
}: FetchBookmarksParams) {
  return api.get<BookmarksPage>("/users/me/bookmarks", {
    params: {
      taskTagIds: taskTagIds?.length ? taskTagIds.join(",") : undefined,
      aiModelTagIds: aiModelTagIds?.length ? aiModelTagIds.join(",") : undefined,
      outputTypes: outputTypes?.length
        ? outputTypes.map((t) => t.toUpperCase()).join(",")
        : undefined,
      page,
      size,
    },
  });
}

/** 갤러리 필터(Task[]) → BE 태그 ID 배열 */
export function tasksToTagIds(tasks: Task[]): number[] {
  return tasks.map((t) => TASK_TAG_ID[t]);
}

/** 갤러리 필터(AiModel[]) → BE 태그 ID 배열 (etc 는 태그가 없어 제외) */
export function aiModelsToTagIds(models: AiModel[]): number[] {
  return models.map((m) => AI_MODEL_TAG_ID[m]).filter((id): id is number => id != null);
}

/**
 * BookmarkPrompt(BE 북마크 응답) → PromptSummary(GalleryGrid/GalleryCard 가 기대하는 형태) 변환.
 *
 * 필드 차이:
 * - thumbnailImage → thumbnailUrl
 * - outputType 이 대문자("TEXT"/"IMAGE") → 소문자로
 * - viewCount/likeCount 가 평평하게 옴 → stats 객체로 묶음
 * - tags 가 JOB/TASK/AI_MODEL 통합 배열로 옴 → PromptSummary 는 model/tasks/jobCategories 로 분리 요구
 *   → tag-mapping.ts 의 LABEL_TO_AI_MODEL/LABEL_TO_TASK(PS-71)로 태그 이름을 enum 값으로 역변환한다.
 *   매핑에 없는 이름(BE 신규 태그 등)은 model="etc" 로 폴백하고 원래 이름을 modelEtcName 에 싣는다.
 * - copies(복사 수)는 북마크 응답에 없어 0 으로 채움(카드가 표시에 안 쓰면 무해)
 */
export function toPromptSummary(bookmark: BookmarkPrompt): PromptSummary {
  const aiModelTag = bookmark.tags.find((t) => t.tagType === "AI_MODEL");
  const taskTags = bookmark.tags.filter((t) => t.tagType === "TASK");

  const model: AiModel = (aiModelTag && LABEL_TO_AI_MODEL[aiModelTag.name]) ?? "etc";
  const tasks: Task[] = taskTags
    .map((t) => LABEL_TO_TASK[t.name])
    .filter((t): t is Task => t != null);

  return {
    id: String(bookmark.promptId),
    title: bookmark.title,
    thumbnailUrl: bookmark.thumbnailImage ?? undefined,
    outputType: bookmark.outputType.toLowerCase() as OutputType,
    model,
    // model 이 etc 로 매핑됐을 때만(즉 BE 태그 이름을 역변환하지 못했을 때만) 원본 이름을 표시용으로 싣는다.
    modelEtcName: model === "etc" ? aiModelTag?.name : undefined,
    tasks,
    jobCategories: [],
    tier: bookmark.contentType.toLowerCase() as PromptSummary["tier"],
    author: {
      name: bookmark.author.nickname,
      avatarUrl: bookmark.author.profileImageUrl ?? undefined,
    },
    stats: {
      views: bookmark.viewCount,
      copies: 0,
      likes: bookmark.likeCount,
    },
    createdAt: bookmark.bookmarkedAt,
  };
}

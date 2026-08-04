/**
 * 상세·댓글 API 응답 목 — **BE 서버 장애 대응용 임시 목**.
 *
 * ⚠️ 2026-08-05 현재 `api.promsearch.kr` 이 HTTP 응답을 돌려주지 않아(`socket hang up`)
 * 화면을 확인할 수 없다. BE 가 복구되면 이 파일과 `handlers.ts` 의 `/api/v1/prompts/:id*`
 * · `/api/v1/comments/*` 핸들러를 **삭제**하면 그대로 실서버에 붙는다.
 *
 * 응답 모양은 Swagger 그대로(`ApiPromptDetail` · `ApiCommentList` · `ApiReplyList`)라,
 * 지우기 전까지 `prompt-detail/api/map.ts` 변환과 커서 페이지네이션이 실제 계약대로 검증된다.
 * 데이터는 홈과 같은 시드(`data/prompts.ts`)를 쓰므로 카드 → 상세 이동이 일관된다.
 */

import { AI_MODEL_LABEL, JOB_CATEGORY_LABEL, TASK_LABEL } from "@/features/gallery/categories";
import { AI_MODEL_TAG_ID, JOB_TAG_ID, TASK_TAG_ID } from "@/features/gallery/tag-ids";
import type { ApiTag } from "@/features/gallery/api/dto";
import type {
  ApiComment,
  ApiCommentStatus,
  ApiPromptDetail,
} from "@/features/prompt-detail/api/dto";
import type { DevAuth, DevContent } from "@/lib/dev-preview";
import { PROMPT_SEED, type PromptRecord } from "@/mocks/data/prompts";

/** 목에서 "로그인한 나"의 식별자 — mine 판정 기준 */
export const MOCK_VIEWER_ID = 999;

/** 프리미엄 미결제자에게 노출하는 프리뷰 한도(Swagger: 앞 10% 이내이면서 최대 200자) */
const PREVIEW_RATIO = 0.1;
const PREVIEW_MAX = 200;

/** 본문 길이 배수 — dev 툴바 콘텐츠 축(짧게/길게)으로 sticky 탭·스크롤 유무를 확인한다. */
const CONTENT_MULTIPLIER: Record<DevContent, { description: number; recipe: number }> = {
  short: { description: 1, recipe: 3 },
  default: { description: 12, recipe: 40 },
  long: { description: 40, recipe: 120 },
};

/** 라우트 id(숫자) → 시드 인덱스. 홈 목이 promptId = 시드 인덱스+1 로 발급한다. */
function findRecord(promptId: number): PromptRecord | undefined {
  const record = PROMPT_SEED[promptId - 1];
  return record?.status === "active" ? record : undefined;
}

function buildDescription(record: PromptRecord, content: DevContent): string {
  const lead = `${record.title} 상세 설명입니다. 이 프롬프트는 ${record.description ?? ""}\n\n`;
  const para =
    "이 프롬프트는 실제 업무에 바로 쓸 수 있도록 설계되었습니다. 입력값을 상황에 맞게 바꾸면 " +
    "다양한 결과물을 얻을 수 있고, 예시와 제약 조건을 함께 제공해 품질을 높였습니다. ";
  return lead + `${para}\n\n`.repeat(CONTENT_MULTIPLIER[content].description);
}

function buildPromptBody(record: PromptRecord, content: DevContent): string {
  const repeat = CONTENT_MULTIPLIER[content].recipe;
  return `# ${record.title}\n\n아래 지침을 그대로 복사해 사용하세요.\n${"레시피 본문 문장. ".repeat(repeat)}`;
}

function buildTags(record: PromptRecord): ApiTag[] {
  const tags: ApiTag[] = [
    ...record.jobCategories.map((job) => ({
      tagId: JOB_TAG_ID[job],
      tagType: "JOB" as const,
      name: JOB_CATEGORY_LABEL[job],
    })),
    ...record.tasks.map((task) => ({
      tagId: TASK_TAG_ID[task],
      tagType: "TASK" as const,
      name: TASK_LABEL[task],
    })),
  ];

  const aiModelTagId = AI_MODEL_TAG_ID[record.model];
  if (aiModelTagId !== null) {
    tags.push({ tagId: aiModelTagId, tagType: "AI_MODEL", name: AI_MODEL_LABEL[record.model] });
  }
  return tags;
}

/**
 * 잠금 판정 + 본문 노출 범위 — **서버가 하는 일을 그대로 흉내 낸다.**
 * 잠긴 본문을 통째로 내려보내면 프론트에서 우회 노출될 수 있어, 목에서도 잘라서 준다.
 */
function resolveAccess(record: PromptRecord, viewer: DevAuth, body: string) {
  if (viewer === "anonymous") {
    // 비회원: 본문 미전송(Swagger 기준 빈 문자열)
    return { access: { locked: true, reason: "ANONYMOUS" as const }, promptBody: "" };
  }
  if (record.tier === "free") {
    return { access: { locked: false, reason: "FREE" as const }, promptBody: body };
  }
  // 프리미엄 미결제: 앞 10% 이내이면서 최대 200자
  const limit = Math.min(Math.floor(body.length * PREVIEW_RATIO), PREVIEW_MAX);
  return { access: { locked: true, reason: "PREMIUM" as const }, promptBody: body.slice(0, limit) };
}

/** 좋아요/북마크 토글 상태(인메모리) — 낙관적 갱신·롤백 확인용 */
const likedState = new Map<number, boolean>();
const bookmarkedState = new Map<number, boolean>();

export function toggleLikeState(promptId: number, liked: boolean): number {
  likedState.set(promptId, liked);
  const base = PROMPT_SEED[promptId - 1]?.stats.likes ?? 0;
  return base + (liked ? 1 : 0);
}

export function readBookmarkState(promptId: number): boolean {
  return bookmarkedState.get(promptId) ?? false;
}

export function toggleBookmarkState(promptId: number): boolean {
  const next = !readBookmarkState(promptId);
  bookmarkedState.set(promptId, next);
  return next;
}

/** [PROMPT-001] 상세 응답. 없는/비공개 게시글이면 null → 핸들러가 404. */
export function promptDetail(
  promptId: number,
  viewer: DevAuth,
  content: DevContent,
): ApiPromptDetail | null {
  const record = findRecord(promptId);
  if (!record) return null;

  const fullBody = buildPromptBody(record, content);
  const { access, promptBody } = resolveAccess(record, viewer, fullBody);

  return {
    promptId,
    title: record.title,
    author: {
      userId: ((promptId - 1) % 7) + 1,
      nickname: record.author.name,
      profileImageUrl: record.author.avatarUrl ?? null,
    },
    outputType: record.outputType === "image" ? "IMAGE" : "TEXT",
    contentType: record.tier === "free" ? "FREE" : "PREMIUM",
    pricePoint: record.tier === "free" ? 0 : 100,
    promptBody,
    description: buildDescription(record, content),
    access,
    viewerInteraction: {
      liked: likedState.get(promptId) ?? false,
      bookmarked: readBookmarkState(promptId),
    },
    // 결정적으로 3장 — 실제 로드되는 placeholder(picsum)
    images: [0, 1, 2].map((i) => ({
      imageId: `${record.id}-${i}`,
      imageUrl: `https://picsum.photos/seed/${record.id}-${i + 1}/900/900`,
      sortOrder: i,
      thumbnail: i === 0,
    })),
    tags: buildTags(record),
    statistics: {
      viewCount: record.stats.views,
      copyCount: record.stats.copies,
      commentCount: commentCount(promptId),
      likeCount: record.stats.likes + (likedState.get(promptId) ? 1 : 0),
    },
    customAiModel: record.model === "etc" ? (record.modelEtcName ?? null) : null,
    createdAt: record.createdAt,
    updatedAt: record.createdAt,
  };
}

// ────────────────────────────── 댓글 ──────────────────────────────

type MockComment = {
  commentId: number;
  promptId: number;
  parentCommentId: number | null;
  authorId: number;
  nickname: string;
  content: string;
  status: ApiCommentStatus;
  createdAt: string;
  updatedAt: string;
};

/** 프롬프트별 댓글 저장소. 첫 조회 때 시드를 만들고 이후 작성/수정/삭제를 반영한다. */
const store = new Map<number, MockComment[]>();
let nextId = 10_000;

const BASE_MS = Date.parse("2026-07-20T09:00:00.000Z");
const MINUTE = 60_000;

/** 상태 섞인 시드 — 최상위 5개 + 일부에 대댓글, 블라인드/삭제도 하나씩 넣어 렌더를 확인한다. */
function seedComments(promptId: number): MockComment[] {
  const authorId = ((promptId - 1) % 7) + 1;
  const rows: MockComment[] = [];
  let id = promptId * 100;

  const push = (over: Partial<MockComment> & { content: string }): MockComment => {
    const row: MockComment = {
      commentId: id++,
      promptId,
      parentCommentId: null,
      authorId: 1,
      nickname: "댓글러",
      status: "ACTIVE",
      createdAt: new Date(BASE_MS + rows.length * MINUTE).toISOString(),
      updatedAt: new Date(BASE_MS + rows.length * MINUTE).toISOString(),
      ...over,
    };
    rows.push(row);
    return row;
  };

  const first = push({ content: "정말 유용한 프롬프트네요! 잘 쓰겠습니다.", nickname: "이영희" });
  push({
    content: "감사합니다 :) 피드백 주시면 반영할게요.",
    parentCommentId: first.commentId,
    authorId,
    nickname: "작성자",
  });
  push({
    content: "저도 그렇게 생각합니다.",
    parentCommentId: first.commentId,
    nickname: "홍길동",
  });

  push({ content: "작성자입니다. 사용 예시를 덧붙였어요.", authorId, nickname: "작성자" });
  push({
    content: "제가 남긴 댓글이에요. 수정/삭제를 확인해보세요.",
    authorId: MOCK_VIEWER_ID,
    nickname: "나",
  });
  push({ content: "규정을 위반한 댓글", status: "HIDDEN", nickname: "익명" });
  push({ content: "지운 댓글", status: "DELETED", nickname: "익명" });

  return rows;
}

function rowsOf(promptId: number): MockComment[] {
  let rows = store.get(promptId);
  if (!rows) {
    rows = seedComments(promptId);
    store.set(promptId, rows);
  }
  return rows;
}

/** 상세 statistics.commentCount — 삭제/블라인드를 뺀 활성 댓글 수 */
function commentCount(promptId: number): number {
  return rowsOf(promptId).filter((c) => c.status === "ACTIVE").length;
}

function toApi(row: MockComment, promptAuthorId: number): ApiComment {
  const hidden = row.status !== "ACTIVE";
  return {
    commentId: row.commentId,
    parentCommentId: row.parentCommentId,
    // 블라인드/삭제 댓글은 작성자를 감춘다(서버도 노출하지 않는 것이 자연스럽다)
    author: hidden ? null : { userId: row.authorId, nickname: row.nickname, profileImageUrl: null },
    content: hidden ? "" : row.content,
    status: row.status,
    mine: !hidden && row.authorId === MOCK_VIEWER_ID,
    promptAuthor: !hidden && row.authorId === promptAuthorId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    ...(row.parentCommentId === null
      ? {
          replyCount: rowsOf(row.promptId).filter(
            (c) => c.parentCommentId === row.commentId && c.status === "ACTIVE",
          ).length,
        }
      : {}),
  };
}

/** 커서 페이지 자르기 — 커서는 "직전 페이지 마지막 commentId" 다. */
function paginateByCursor(rows: MockComment[], cursor: number | null, size: number) {
  const start = cursor === null ? 0 : rows.findIndex((r) => r.commentId === cursor) + 1;
  const sliced = rows.slice(start, start + size);
  const hasNext = start + size < rows.length;
  return {
    sliced,
    nextCursor: sliced.length > 0 ? sliced[sliced.length - 1].commentId : null,
    hasNext,
  };
}

/** [COMMENT-001] 최상위 댓글 — 작성 시각 내림차순 */
export function listComments(promptId: number, cursor: number | null, size: number) {
  const promptAuthorId = ((promptId - 1) % 7) + 1;
  const rows = rowsOf(promptId)
    .filter((c) => c.parentCommentId === null)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  const { sliced, nextCursor, hasNext } = paginateByCursor(rows, cursor, size);
  return { comments: sliced.map((r) => toApi(r, promptAuthorId)), nextCursor, hasNext };
}

/** [COMMENT-006] 대댓글 — 작성 시각 오름차순 */
export function listReplies(commentId: number, cursor: number | null, size: number) {
  const parent = findComment(commentId);
  if (!parent) return null;

  const promptAuthorId = ((parent.promptId - 1) % 7) + 1;
  const rows = rowsOf(parent.promptId)
    .filter((c) => c.parentCommentId === commentId)
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));

  const { sliced, nextCursor, hasNext } = paginateByCursor(rows, cursor, size);
  return { replies: sliced.map((r) => toApi(r, promptAuthorId)), nextCursor, hasNext };
}

export function findComment(commentId: number): MockComment | undefined {
  for (const rows of store.values()) {
    const found = rows.find((c) => c.commentId === commentId);
    if (found) return found;
  }
  return undefined;
}

function now() {
  // 시드 이후 시각으로 밀어 최신 댓글이 목록 맨 위에 오게 한다.
  return new Date(BASE_MS + 10 * MINUTE + nextId).toISOString();
}

/** [COMMENT-002] 댓글 작성 */
export function addComment(promptId: number, content: string): ApiComment {
  const rows = rowsOf(promptId);
  const row: MockComment = {
    commentId: nextId++,
    promptId,
    parentCommentId: null,
    authorId: MOCK_VIEWER_ID,
    nickname: "나",
    content,
    status: "ACTIVE",
    createdAt: now(),
    updatedAt: now(),
  };
  rows.push(row);
  return toApi(row, ((promptId - 1) % 7) + 1);
}

/** [COMMENT-005] 대댓글 작성 — 대댓글에는 달 수 없다(1-depth) */
export function addReply(parentId: number, content: string): ApiComment | null {
  const parent = findComment(parentId);
  if (!parent || parent.parentCommentId !== null) return null;

  const row: MockComment = {
    commentId: nextId++,
    promptId: parent.promptId,
    parentCommentId: parentId,
    authorId: MOCK_VIEWER_ID,
    nickname: "나",
    content,
    status: "ACTIVE",
    createdAt: now(),
    updatedAt: now(),
  };
  rowsOf(parent.promptId).push(row);
  return toApi(row, ((parent.promptId - 1) % 7) + 1);
}

/** [COMMENT-003] 댓글 수정 — 본인만 */
export function editComment(commentId: number, content: string): ApiComment | "forbidden" | null {
  const row = findComment(commentId);
  if (!row) return null;
  if (row.authorId !== MOCK_VIEWER_ID) return "forbidden";

  row.content = content;
  row.updatedAt = now();
  return toApi(row, ((row.promptId - 1) % 7) + 1);
}

/** [COMMENT-004] 댓글 삭제 — 본인만, 논리 삭제(자리는 남는다) */
export function removeComment(commentId: number): true | "forbidden" | null {
  const row = findComment(commentId);
  if (!row) return null;
  if (row.authorId !== MOCK_VIEWER_ID) return "forbidden";

  row.status = "DELETED";
  row.updatedAt = now();
  return true;
}

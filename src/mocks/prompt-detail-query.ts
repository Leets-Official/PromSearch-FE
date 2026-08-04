/**
 * 상세 조회 목 로직(순수).
 *
 * 홈 시드(PROMPT_SEED)와 **동일 소스**를 써서 id 일관성을 지킨다(홈에서 클릭한 카드 = 상세).
 * 잠금 판정은 프론트와 동일한 `resolveRecipeAccess` 를 재사용하고, 잠금 시 전문이 새지
 * 않도록 recipeBody 를 마스킹해서 내려준다(우회 방지).
 */

import type { UserStatus } from "@/analytics/events";
import { resolveRecipeAccess } from "@/features/prompt-detail/access";
import type { PromptDetail } from "@/features/prompt-detail/types";
import { buildComments, countComments } from "@/mocks/data/comments";
import type { PromptRecord } from "@/mocks/data/prompts";
import type { DevContent } from "@/lib/dev-preview";

/** 본문 길이 배수 — dev 툴바 콘텐츠 축(짧게/길게)으로 sticky 탭·스크롤 유무를 확인한다. */
const CONTENT_MULTIPLIER: Record<DevContent, { description: number; recipe: number }> = {
  short: { description: 1, recipe: 3 },
  default: { description: 12, recipe: 40 },
  long: { description: 40, recipe: 120 },
};

/** 상세 더미 본문(설명 탭) — 스크롤(탭 고정) 확인용으로 충분히 길게 */
export function buildDescriptionBody(
  record: PromptRecord,
  content: DevContent = "default",
): string {
  const lead = `${record.title} 상세 설명입니다. 이 프롬프트는 ${record.description ?? ""}\n\n`;
  const para =
    "이 프롬프트는 실제 업무에 바로 쓸 수 있도록 설계되었습니다. 입력값을 상황에 맞게 바꾸면 " +
    "다양한 결과물을 얻을 수 있고, 예시와 제약 조건을 함께 제공해 품질을 높였습니다. ";
  return lead + `${para}\n\n`.repeat(CONTENT_MULTIPLIER[content].description);
}

/** 레시피 전문(잠금 전 원본) */
export function buildRecipeBody(record: PromptRecord, content: DevContent = "default"): string {
  const repeat = CONTENT_MULTIPLIER[content].recipe;
  return `# ${record.title}\n\n아래 지침을 그대로 복사해 사용하세요.\n${"레시피 본문 문장. ".repeat(repeat)}`;
}

/** 아웃풋 이미지들(캐러셀). 결정적으로 3장 — 실제 로드되는 placeholder(picsum) */
export function buildImages(record: PromptRecord): string[] {
  return [1, 2, 3].map((n) => `https://picsum.photos/seed/${record.id}-${n}/900/900`);
}

/**
 * 잠금 상태에 따라 recipeBody 를 마스킹 — 전문 DOM 노출 우회 방지(2026-07-22 개정).
 * - 열람 → 전문
 * - anonymous(비로그인) → previewLength 까지 미리보기만
 * - premium(유료 미결제) → 전체 블러이므로 빈 문자열(전문 미전송)
 */
export function maskRecipeBody(
  full: string,
  access: { locked: boolean; reason: string | null; previewLength?: number },
): string {
  if (!access.locked) return full;
  if (access.reason === "anonymous") return full.slice(0, access.previewLength ?? full.length);
  return ""; // premium 등 — 전체 블러, 전문 미전송
}

/**
 * id + 뷰어 상태로 상세 1건을 만든다. 없거나 status !== active 면 null(404).
 */
/**
 * 라우트 id → 시드 id 정규화.
 *
 * 홈 목록은 이제 실 BE 스펙대로 **숫자 `promptId`** 를 내려주는데(`mocks/home-prompt-cards.ts`),
 * 상세·댓글 목은 아직 시드 문자열 id(`prompt-001`)를 키로 쓴다. 카드를 눌러 들어온 `/prompts/1` 이
 * 404 가 되지 않도록 여기서 이어 붙인다. 상세까지 실 API 로 옮기면 이 함수는 사라진다.
 */
export function toSeedId(id: string): string {
  return /^\d+$/.test(id) ? `prompt-${id.padStart(3, "0")}` : id;
}

export function findPromptDetail(
  records: PromptRecord[],
  id: string,
  viewerStatus: UserStatus,
  content: DevContent = "default",
): PromptDetail | null {
  const seedId = toSeedId(id);
  const record = records.find((r) => r.id === seedId);
  if (!record || record.status !== "active") return null;

  const access = resolveRecipeAccess({ tier: record.tier }, { status: viewerStatus });
  // status 는 상세 응답에 포함하지 않는다(내부 필드)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { status: _status, ...summary } = record;

  return {
    ...summary,
    images: buildImages(record),
    descriptionBody: buildDescriptionBody(record, content),
    recipeBody: maskRecipeBody(buildRecipeBody(record, content), access),
    access,
    liked: false,
    bookmarked: false,
    commentCount: countComments(buildComments(record.id, content)),
  };
}

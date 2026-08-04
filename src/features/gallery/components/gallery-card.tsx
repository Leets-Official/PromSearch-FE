"use client";

import { ImageIcon, TextIcon } from "@/components/ui/icons";
import Link from "next/link";

import { track } from "@/analytics/track";
import type { UserStatus } from "@/analytics/events";
import { PromptCard } from "@/components/ui/prompt-card";
import { useCardImpression } from "@/hooks/use-card-impression";

import {
  AI_MODEL_LABEL,
  JOB_CATEGORY_LABEL,
  OUTPUT_TYPE_LABEL,
  TASK_LABEL,
} from "@/features/gallery/categories";
import type { OutputType, PromptSummary } from "@/features/gallery/types";

/** 썸네일 우하단 결과물타입 배지 — 텍스트(T) / 이미지 아이콘 (Figma 1006:2312) */
function OutputTypeBadge({ type }: { type: OutputType }) {
  return (
    <span
      aria-label={OUTPUT_TYPE_LABEL[type]}
      className="flex items-center rounded-[4px] bg-interaction-brand p-1 text-text-on-brand"
    >
      {type === "image" ? <ImageIcon className="size-4" /> : <TextIcon className="size-4" />}
    </span>
  );
}

/** 상세 경로 — 상세 페이지는 후속 브랜치지만 경로는 확정해 링크만 연결한다. */
export function promptDetailHref(id: string): string {
  return `/prompts/${id}`;
}

/** 카드 태그 라벨 구성: 사용 AI · 대표 직군 · 대표 태스크 · 결과물타입 (시안 기준) */
export function buildCardTags(prompt: PromptSummary): string[] {
  const modelLabel =
    prompt.model === "etc"
      ? (prompt.modelEtcName ?? AI_MODEL_LABEL.etc)
      : AI_MODEL_LABEL[prompt.model];

  const tags = [modelLabel];
  if (prompt.jobCategories[0]) tags.push(JOB_CATEGORY_LABEL[prompt.jobCategories[0]]);
  if (prompt.tasks[0]) tags.push(TASK_LABEL[prompt.tasks[0]]);
  tags.push(OUTPUT_TYPE_LABEL[prompt.outputType]);
  return tags;
}

type GalleryCardProps = {
  prompt: PromptSummary;
  /** 페이지 내 렌더 순서(1-based) — analytics position */
  position: number;
  /** 인증 상태 주입값(auth 연동 전 anonymous 폴백) */
  userStatus: UserStatus;
};

/**
 * 갤러리 카드 — 공통 `PromptCard` 에 노출/클릭 트래킹과 상세 링크를 붙인다.
 *
 * 홈에는 권한 분기가 없다: 비회원/회원 모두 카드 클릭 시 상세로 이동한다.
 * (로그인 유도는 상세 페이지의 본문 블러로 처리 — 다른 브랜치)
 */
export function GalleryCard({ prompt, position, userStatus }: GalleryCardProps) {
  const ref = useCardImpression({
    cardId: prompt.id,
    position,
    userStatus,
    source: "home",
  });

  return (
    <PromptCard
      ref={ref}
      title={prompt.title}
      tags={buildCardTags(prompt)}
      thumbnailSrc={prompt.thumbnailUrl}
      badge={<OutputTypeBadge type={prompt.outputType} />}
      // 개정(209:3690): [아바타 | 제목 / 작성자이름] → 태그 순서
      author={{ name: prompt.author.name, avatarSrc: prompt.author.avatarUrl }}
      render={<Link href={promptDetailHref(prompt.id)} />}
      onClick={() =>
        track("card_click", {
          card_id: prompt.id,
          position,
          user_status: userStatus,
          source: "home",
        })
      }
    />
  );
}

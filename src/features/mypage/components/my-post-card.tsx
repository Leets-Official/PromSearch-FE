"use client";

import Link from "next/link";

import { ImageIcon, TextIcon } from "@/components/ui/icons";
import { PromptCard } from "@/components/ui/prompt-card";
import {
  AI_MODEL_LABEL,
  JOB_CATEGORY_LABEL,
  OUTPUT_TYPE_LABEL,
  TASK_LABEL,
} from "@/features/gallery/categories";
import type { MyPost } from "@/mocks/data/mypage";

const detailHref = (id: string) => `/prompts/${id}`;

/** 썸네일 우하단 결과물타입 배지 — GalleryCard 와 동일 스펙 */
function OutputTypeBadge({ type }: { type: MyPost["outputType"] }) {
  return (
    <span
      aria-label={OUTPUT_TYPE_LABEL[type]}
      className="flex items-center rounded-[4px] bg-interaction-brand p-1 text-text-on-brand"
    >
      {type === "image" ? <ImageIcon className="size-4" /> : <TextIcon className="size-4" />}
    </span>
  );
}

/** 카드 태그: 사용 AI · 대표 직군 · 대표 태스크 (GalleryCard.buildCardTags 와 동일 로직) */
function buildTags(post: MyPost): string[] {
  const modelLabel =
    post.model === "etc" ? (post.modelEtcName ?? AI_MODEL_LABEL.etc) : AI_MODEL_LABEL[post.model];

  const tags = [modelLabel];
  if (post.jobCategories[0]) tags.push(JOB_CATEGORY_LABEL[post.jobCategories[0]]);
  if (post.tasks[0]) tags.push(TASK_LABEL[post.tasks[0]]);
  return tags;
}

interface MyPostCardProps {
  post: MyPost;
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

/**
 * 마이페이지 "내 게시글" 모바일 카드 (Figma: 마이페이지 - 내 게시글, 모바일).
 * PromptCard 전체 영역이 상세로 가는 링크이므로, 수정/삭제 버튼은 카드 바깥
 * 별도 줄에 둔다(버튼을 <a> 안에 중첩하면 시맨틱이 깨진다).
 */
export function MyPostCard({ post, showActions = false, onDelete }: MyPostCardProps) {
  return (
    <div className="flex flex-col gap-2">
      <PromptCard
        title={post.title}
        tags={buildTags(post)}
        thumbnailSrc={post.thumbnailUrl}
        badge={<OutputTypeBadge type={post.outputType} />}
        author={{ name: post.author.name, avatarSrc: post.author.avatarUrl }}
        render={<Link href={detailHref(post.id)} />}
      />
      {showActions && (
        <div className="flex items-center gap-3 px-2 text-body-3">
          <button
            type="button"
            onClick={() => onDelete?.(post.id)}
            className="rounded-sm text-text-brand hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
}

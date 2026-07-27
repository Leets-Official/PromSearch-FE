"use client";

import { TextField } from "@/components/ui/text-field";
import type { PromptComment } from "@/features/prompt-detail/types";
import { cn } from "@/lib/utils";
import { CommentItem } from "./CommentItem";

/**
 * 댓글 탭 — 표시 전용(작성/삭제/신고는 후속).
 * 레이아웃: 우측 컬럼 스크롤 안에서 리스트가 흐르고, 입력창은 `sticky bottom-0` 으로
 * 항상 하단에 고정된다(스크롤 시 탭은 상단, 입력창은 하단, 그 사이 댓글만 스크롤).
 */
export function CommentPanel({
  comments,
  className,
}: {
  comments: PromptComment[];
  className?: string;
}) {
  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      <div>
        {comments.length === 0 ? (
          <p className="py-16 text-center text-body-2 text-text-disabled">
            아직 작성된 댓글이 없어요.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {comments.map((c) => (
              <CommentItem key={c.id} comment={c} />
            ))}
          </ul>
        )}
      </div>

      {/* 입력창 — 하단 고정(sticky). 개정 TextField(등록 버튼 + 카운터). 작성 동작은 후속(no-op). */}
      <div className="sticky bottom-0 bg-bg-primary pt-2 pb-1">
        <TextField
          aria-label="댓글 입력"
          placeholder="댓글을 입력해주세요"
          maxLength={500}
          submitLabel="등록"
          onSubmit={() => {
            /* 댓글 작성 — 후속 브랜치 */
          }}
        />
      </div>
    </div>
  );
}

"use client";

import { TextField } from "@/components/ui/text-field";
import type { PromptComment } from "@/features/prompt-detail/types";
import { cn } from "@/lib/utils";
import { CommentItem } from "./CommentItem";

/**
 * 댓글 탭 — 표시 전용(작성/삭제/신고는 후속).
 * 레이아웃: 댓글 리스트가 남은 높이를 채우며 내부 스크롤, 입력창은 **항상 하단 고정**(디자인).
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
      {/* 리스트 — 남은 높이를 채우고 넘치면 내부 스크롤 */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-body-2 text-text-disabled">아직 작성된 댓글이 없어요.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {comments.map((c) => (
              <CommentItem key={c.id} comment={c} />
            ))}
          </ul>
        )}
      </div>

      {/* 입력창 — 항상 하단 고정. 개정 TextField(등록 버튼 + 카운터). 작성 동작은 후속(no-op). */}
      <TextField
        className="shrink-0"
        aria-label="댓글 입력"
        placeholder="댓글을 입력해주세요"
        maxLength={500}
        submitLabel="등록"
        onSubmit={() => {
          /* 댓글 작성 — 후속 브랜치 */
        }}
      />
    </div>
  );
}

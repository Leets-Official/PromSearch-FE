"use client";

import type { PromptComment } from "@/features/prompt-detail/types";
import { CommentItem } from "./CommentItem";

/**
 * 댓글 탭 — 표시 전용(작성/삭제/신고는 후속). 트리·블라인드·대댓글 렌더 + 입력창(자리만).
 */
export function CommentPanel({ comments }: { comments: PromptComment[] }) {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-4">
      <div className="min-h-0 flex-1 overflow-auto">
        {comments.length === 0 ? (
          <p className="py-10 text-center text-body-2 text-text-disabled">
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

      {/* 입력창 — 작성은 후속 범위라 자리만(비활성) */}
      <input
        type="text"
        disabled
        aria-label="댓글 입력"
        placeholder="댓글 작성은 곧 제공됩니다"
        className="w-full rounded-md border border-stroke-disabled px-4 py-3 text-body-2 text-text-disabled"
      />
    </div>
  );
}

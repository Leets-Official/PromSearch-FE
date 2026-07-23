"use client";

import { TextField } from "@/components/ui/text-field";
import type { PromptComment } from "@/features/prompt-detail/types";
import { CommentItem } from "./CommentItem";

/**
 * 댓글 탭 — 표시 전용(작성/삭제/신고는 후속). 트리·블라인드·대댓글 렌더 + 입력창(자리만).
 */
export function CommentPanel({ comments }: { comments: PromptComment[] }) {
  return (
    <div className="flex w-full flex-col gap-4">
      <div>
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

      {/* 입력창 — 개정 TextField(등록 버튼 + 글자수 카운터). 작성 동작은 후속 범위(no-op). */}
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
  );
}

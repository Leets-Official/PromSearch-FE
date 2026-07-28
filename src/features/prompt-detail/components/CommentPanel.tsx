"use client";

import { TextField } from "@/components/ui/text-field";
import type { PromptComment } from "@/features/prompt-detail/types";
import { cn } from "@/lib/utils";
import { CommentItem } from "./CommentItem";

/**
 * 댓글 탭 — 표시 전용(작성/삭제/신고는 후속).
 * 레이아웃: full-height flex 컬럼. 리스트가 남는 높이를 채우며(넘치면 리스트만 스크롤),
 * 입력창은 항상 컬럼 맨 아래에 붙는다(댓글이 적어도 하단 고정).
 * 데스크톱에선 부모(우측 컬럼)가 고정 높이를 주고, 모바일에선 자연스럽게 흐른다.
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
      {/* 리스트 — 남는 높이를 채우고, 넘치면 이 영역만 스크롤 */}
      <div className="scrollbar-minimal min-h-0 flex-1 overflow-y-auto">
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

      {/* 입력창 — 컬럼 하단 고정. 개정 TextField(등록 버튼 + 카운터). 작성 동작은 후속(no-op). */}
      <div className="shrink-0 bg-bg-primary pt-2 pb-1">
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

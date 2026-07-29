"use client";

import { ChevronUp, MoreVertical } from "lucide-react";
import { useState } from "react";

import type { PromptComment } from "@/features/prompt-detail/types";
import { formatDetailDate } from "@/features/prompt-detail/format";
import { ProfileAvatar } from "./profile-avatar";

function CommentBody({ comment }: { comment: PromptComment }) {
  if (comment.isBlinded) {
    return (
      <div className="flex items-center gap-2 text-body-3 text-text-disabled">
        <ProfileAvatar name="" size="sm" />
        <span>블라인드 처리된 댓글입니다.</span>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <ProfileAvatar name={comment.author.name} src={comment.author.avatarUrl} size="sm" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {/* 좁아져도 단어 단위로만 줄바꿈(글자 단위 세로 깨짐 방지) */}
        <div className="flex flex-wrap items-center gap-x-1 text-body-3">
          <span className="font-semibold whitespace-nowrap text-text-primary">
            {comment.author.name}
          </span>
          {comment.isAuthor ? (
            <span className="text-caption-1 whitespace-nowrap text-text-brand">작성자</span>
          ) : null}
          <span className="text-text-disabled">・</span>
          <span className="whitespace-nowrap text-text-disabled">
            {formatDetailDate(comment.createdAt)}
          </span>
        </div>
        <p className="text-body-2 whitespace-pre-wrap text-text-secondary">{comment.body}</p>
      </div>
      <button type="button" aria-label="댓글 메뉴" className="shrink-0 text-text-disabled">
        <MoreVertical className="size-5" />
      </button>
    </div>
  );
}

/** 댓글 1개 — 작성자 배지·블라인드·대댓글(1-depth) 펼침 */
export function CommentItem({ comment }: { comment: PromptComment }) {
  const [expanded, setExpanded] = useState(false);
  const replyCount = comment.replies.length;

  return (
    <li className="flex flex-col gap-3">
      <CommentBody comment={comment} />

      {replyCount > 0 ? (
        <div className="pl-9">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-body-3 text-text-secondary"
          >
            <ChevronUp className={`size-5 transition-transform ${expanded ? "" : "rotate-180"}`} />
            {replyCount}개의 답글
          </button>

          {expanded ? (
            <ul className="mt-3 flex flex-col gap-3">
              {comment.replies.map((reply) => (
                <li key={reply.id}>
                  <CommentBody comment={reply} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

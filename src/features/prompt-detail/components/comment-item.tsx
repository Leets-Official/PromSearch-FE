"use client";

import { ChevronUpIcon, MoreIcon } from "@/components/ui/icons";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDetailDate } from "@/features/prompt-detail/format";
import type { PromptComment } from "@/features/prompt-detail/types";
import { cn } from "@/lib/utils";
import { ProfileAvatar } from "./profile-avatar";

/**
 * 댓글 액션 메뉴(⋯) — 답글 / 신고하기.
 *
 * 대댓글(= 이미 1-depth)에는 답글 항목이 없다. 디자인상 스레드 깊이가 1이라
 * 답글의 답글을 받으면 접히는 단위가 무너지기 때문(관련 UX 판단은 CommentPanel 주석 참고).
 * 블라인드 댓글은 본문이 없으므로 메뉴 자체를 달지 않는다.
 */
function CommentMenu({ onReply, onReport }: { onReply?: () => void; onReport: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="댓글 메뉴"
        className="-mr-1 shrink-0 rounded-md p-1 text-text-disabled outline-none hover:text-text-secondary focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <MoreIcon className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-auto min-w-28 bg-bg-primary p-1 text-text-primary ring-stroke-disabled"
      >
        {onReply ? (
          <DropdownMenuItem
            className="cursor-pointer px-3 py-2 text-body-2 focus:bg-bg-secondary focus:text-text-primary"
            onClick={onReply}
          >
            답글
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          className="cursor-pointer px-3 py-2 text-body-2 text-text-brand focus:bg-bg-secondary focus:text-text-brand"
          onClick={onReport}
        >
          신고하기
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CommentBody({
  comment,
  onReply,
  onReport,
  highlighted,
}: {
  comment: PromptComment;
  /** 미지정이면 메뉴에 "답글"이 빠진다(= 대댓글) */
  onReply?: () => void;
  onReport: () => void;
  /** 답글 작성 대상으로 지목된 댓글 — 어디에 답글을 다는지 시각적으로 묶어 준다 */
  highlighted?: boolean;
}) {
  if (comment.isBlinded) {
    return (
      <div className="flex items-center gap-2 text-body-3 text-text-disabled">
        <ProfileAvatar name="" size="sm" />
        <span>블라인드 처리된 댓글입니다.</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        // 하이라이트 배경을 좌우로 흘려보내려고 음수 마진을 쓰면 리스트에 가로 스크롤이 생긴다.
        // 배경은 콘텐츠 폭에 맞추고, 여백은 안쪽 패딩으로만 준다.
        "flex gap-3 rounded-md py-1 transition-colors",
        highlighted && "bg-bg-secondary",
      )}
    >
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
        {/* wrap-break-word: 띄어쓰기 없는 긴 URL·문자열도 폭을 넘기지 않고 끊는다(가로 스크롤 방지) */}
        <p className="text-body-2 wrap-break-word whitespace-pre-wrap text-text-secondary">
          {comment.body}
        </p>
      </div>
      <CommentMenu onReply={onReply} onReport={onReport} />
    </div>
  );
}

/** 댓글 1개 — 작성자 배지·블라인드·대댓글(1-depth) 펼침 */
export function CommentItem({
  comment,
  onReply,
  onReport,
  replyingToId,
}: {
  comment: PromptComment;
  /** "답글" 선택 — 상위(CommentPanel)가 하단 입력창을 답글 모드로 바꾼다 */
  onReply: (comment: PromptComment) => void;
  onReport: (comment: PromptComment) => void;
  /** 현재 답글 작성 대상 id(자기 자신 또는 자기 대댓글이면 스레드를 펼쳐 둔다) */
  replyingToId: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const replyCount = comment.replies.length;
  // 이 스레드에 답글을 다는 중이면 접혀 있어도 펼쳐서 맥락을 보여준다
  const openThread = expanded || replyingToId === comment.id;

  return (
    <li className="flex flex-col gap-3">
      <CommentBody
        comment={comment}
        onReply={() => onReply(comment)}
        onReport={() => onReport(comment)}
        highlighted={replyingToId === comment.id}
      />

      {replyCount > 0 ? (
        <div className="pl-9">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={openThread}
            className="flex items-center gap-1 text-body-3 text-text-secondary"
          >
            <ChevronUpIcon
              className={`size-5 transition-transform ${openThread ? "" : "rotate-180"}`}
            />
            {replyCount}개의 답글
          </button>

          {openThread ? (
            <ul className="mt-3 flex flex-col gap-3">
              {comment.replies.map((reply) => (
                <li key={reply.id}>
                  {/* 대댓글은 신고만 — onReply 를 넘기지 않는다 */}
                  <CommentBody comment={reply} onReport={() => onReport(reply)} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

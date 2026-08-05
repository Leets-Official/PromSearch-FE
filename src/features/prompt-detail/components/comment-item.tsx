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
import { useCommentReplies } from "@/features/prompt-detail/hooks/use-comments";
import type { CommentStatus, PromptComment } from "@/features/prompt-detail/types";
import { cn } from "@/lib/utils";
import { ProfileAvatar } from "./profile-avatar";

/** 본문을 감추는 상태별 안내 문구(요청서 7-7). active 면 없음 → 본문 렌더 */
const PLACEHOLDER_BY_STATUS: Partial<Record<CommentStatus, string>> = {
  hidden: "블라인드 처리된 댓글입니다.",
  deleted: "삭제된 댓글입니다.",
};

/**
 * 댓글 액션 메뉴(⋯) — 답글 / 수정하기 / 삭제하기 / 신고하기.
 *
 * - 대댓글(= 이미 1-depth)에는 답글이 없다. 스레드 깊이가 1이라 답글의 답글을 받으면
 *   접히는 단위가 무너진다(관련 UX 판단은 CommentPanel 주석 참고).
 * - **수정·삭제는 본인 댓글에만** 노출한다. 서버도 작성자만 허용(403)하므로 여기서 감추는 건
 *   UX 이고 권한 경계는 BE 다.
 * - 본인 댓글에는 신고를 노출하지 않는다(자기 글 신고는 의미가 없다).
 */
function CommentMenu({
  isMine,
  onReply,
  onEdit,
  onDelete,
  onReport,
}: {
  isMine: boolean;
  onReply?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
}) {
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

        {isMine ? (
          <>
            <DropdownMenuItem
              className="cursor-pointer px-3 py-2 text-body-2 focus:bg-bg-secondary focus:text-text-primary"
              onClick={onEdit}
            >
              수정하기
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer px-3 py-2 text-body-2 text-text-brand focus:bg-bg-secondary focus:text-text-brand"
              onClick={onDelete}
            >
              삭제하기
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem
            className="cursor-pointer px-3 py-2 text-body-2 text-text-brand focus:bg-bg-secondary focus:text-text-brand"
            onClick={onReport}
          >
            신고하기
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type CommentBodyProps = {
  comment: PromptComment;
  /** 미지정이면 메뉴에 "답글"이 빠진다(= 대댓글) */
  onReply?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  /** 답글/수정 작업 대상으로 지목된 댓글 — 무엇을 다루는 중인지 시각적으로 묶어 준다 */
  highlighted?: boolean;
};

function CommentBody({
  comment,
  onReply,
  onEdit,
  onDelete,
  onReport,
  highlighted,
}: CommentBodyProps) {
  const placeholder = PLACEHOLDER_BY_STATUS[comment.status];

  // 블라인드/삭제 — 본문·작성자·메뉴를 감추고 안내 문구만 남긴다.
  // (대댓글이 달린 댓글도 자리는 유지돼야 스레드가 끊기지 않는다)
  if (placeholder) {
    return (
      <div className="flex items-center gap-2 text-body-3 text-text-disabled">
        <ProfileAvatar name="" size="sm" />
        <span>{placeholder}</span>
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
      <CommentMenu
        isMine={comment.isMine}
        onReply={onReply}
        onEdit={onEdit}
        onDelete={onDelete}
        onReport={onReport}
      />
    </div>
  );
}

type CommentItemProps = {
  comment: PromptComment;
  /** "답글" 선택 — 상위(CommentPanel)가 하단 입력창을 답글 모드로 바꾼다 */
  onReply: (comment: PromptComment) => void;
  /** "수정하기" 선택 — 상위가 하단 입력창을 수정 모드로 바꾼다 */
  onEdit: (comment: PromptComment) => void;
  onDelete: (comment: PromptComment) => void;
  onReport: (comment: PromptComment) => void;
  /** 현재 답글/수정 작업 대상 id(자기 자신이면 스레드를 펼쳐 둔다) */
  activeId: string | null;
};

/** 댓글 1개 — 작성자 배지 · 상태별 렌더 · 대댓글(1-depth) 지연 조회 */
export function CommentItem({
  comment,
  onReply,
  onEdit,
  onDelete,
  onReport,
  activeId,
}: CommentItemProps) {
  const [expanded, setExpanded] = useState(false);
  // 이 스레드를 작업 중이면 접혀 있어도 펼쳐서 맥락을 보여준다
  const openThread = expanded || activeId === comment.id;

  // 대댓글은 최상위 응답에 없다 → 펼칠 때 비로소 조회한다(접었다 펴면 캐시 재사용)
  const replies = useCommentReplies(comment.id, openThread && comment.replyCount > 0);

  return (
    <li className="flex flex-col gap-3">
      <CommentBody
        comment={comment}
        onReply={() => onReply(comment)}
        onEdit={() => onEdit(comment)}
        onDelete={() => onDelete(comment)}
        onReport={() => onReport(comment)}
        highlighted={activeId === comment.id}
      />

      {comment.replyCount > 0 ? (
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
            {comment.replyCount}개의 답글
          </button>

          {openThread ? (
            <ReplyList
              query={replies}
              onEdit={onEdit}
              onDelete={onDelete}
              onReport={onReport}
              activeId={activeId}
            />
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

/** 펼친 스레드 본문 — 로딩/실패도 자리를 지켜 레이아웃이 튀지 않게 한다. */
function ReplyList({
  query,
  onEdit,
  onDelete,
  onReport,
  activeId,
}: {
  query: ReturnType<typeof useCommentReplies>;
  onEdit: (comment: PromptComment) => void;
  onDelete: (comment: PromptComment) => void;
  onReport: (comment: PromptComment) => void;
  activeId: string | null;
}) {
  if (query.isPending) {
    return <p className="mt-3 text-body-3 text-text-disabled">답글을 불러오는 중이에요.</p>;
  }
  if (query.isError || !query.data) {
    return <p className="mt-3 text-body-3 text-text-disabled">답글을 불러오지 못했어요.</p>;
  }

  return (
    <ul className="mt-3 flex flex-col gap-3">
      {query.data.comments.map((reply) => (
        <li key={reply.id}>
          {/* 대댓글에는 답글이 없다 — onReply 를 넘기지 않는다 */}
          <CommentBody
            comment={reply}
            onEdit={() => onEdit(reply)}
            onDelete={() => onDelete(reply)}
            onReport={() => onReport(reply)}
            highlighted={activeId === reply.id}
          />
        </li>
      ))}
    </ul>
  );
}

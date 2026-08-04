"use client";

import { useRef, useState } from "react";

import { XIcon } from "@/components/ui/icons";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { TextField } from "@/components/ui/text-field";
import type { PromptComment } from "@/features/prompt-detail/types";
import { cn } from "@/lib/utils";
import { CommentItem } from "./comment-item";
import { COMMENT_INPUT_ANCHOR_ID } from "./detail-floating-actions";

/**
 * 댓글 탭 — 목록 + 작성 입력(작성 API 연동은 후속).
 * 레이아웃: full-height flex 컬럼. 리스트가 남는 높이를 채우며(넘치면 리스트만 스크롤),
 * 입력창은 항상 컬럼 맨 아래에 붙는다(댓글이 적어도 하단 고정).
 * 데스크톱에선 부모(우측 컬럼)가 고정 높이를 주고, 모바일에선 자연스럽게 흐른다.
 *
 * 답글 UX — 입력창은 **하나**다.
 * ⋯ 메뉴에서 "답글"을 고르면 새 입력창이 생기는 대신 하단 입력창이 답글 모드로 바뀌고
 * (대상 칩 + 자동 포커스), 대상 댓글은 하이라이트되고 스레드가 펼쳐진다.
 * 모바일에서 화면 중간에 입력창이 끼어들면 키보드가 올라올 때 스크롤이 튀기 때문에,
 * 인스타그램/유튜브와 같은 "고정 입력창 + 대상 표시" 방식을 택했다.
 *
 * 답글 깊이는 1로 고정한다(디자인 = 접히는 스레드 1단). 대댓글의 ⋯ 에는 신고만 있다.
 */
export function CommentPanel({
  comments,
  className,
}: {
  comments: PromptComment[];
  className?: string;
}) {
  // 배열이 아닌 값(로딩 중 undefined·예기치 못한 응답 형태)이 흘러도 렌더가 깨지지 않게 방어
  const list = Array.isArray(comments) ? comments : [];

  const [draft, setDraft] = useState("");
  /** 답글 대상(최상위 댓글). null 이면 일반 댓글 작성 */
  const [replyTo, setReplyTo] = useState<PromptComment | null>(null);
  /** 신고 대상(댓글/대댓글 모두) */
  const [reportTarget, setReportTarget] = useState<PromptComment | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const startReply = (comment: PromptComment) => {
    setReplyTo(comment);
    inputRef.current?.focus();
  };

  const submit = () => {
    if (draft.trim() === "") return;
    // TODO: 댓글/답글 작성 API 연동 (POST /api/prompts/:id/comments, 답글이면 parentId=replyTo.id)
    setDraft("");
    setReplyTo(null);
  };

  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      {/* 리스트 — 남는 높이를 채우고, 넘치면 이 영역만 **세로로만** 스크롤.
          overflow-x-hidden: 긴 본문·메뉴 팝업 등으로 가로 스크롤바가 생기지 않게 잠근다. */}
      <div className="scrollbar-minimal min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        {list.length === 0 ? (
          <p className="py-16 text-center text-body-2 text-text-disabled">
            아직 작성된 댓글이 없어요.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {list.map((c) => (
              <CommentItem
                key={c.id}
                comment={c}
                onReply={startReply}
                onReport={setReportTarget}
                replyingToId={replyTo?.id ?? null}
              />
            ))}
          </ul>
        )}
      </div>

      {/* 입력창 — 컬럼 하단 고정. 개정 TextField(등록 버튼 + 카운터).
          id 는 모바일 "댓글로 이동" 플로팅 버튼의 스크롤 앵커. */}
      <div id={COMMENT_INPUT_ANCHOR_ID} className="shrink-0 scroll-mt-20 bg-bg-primary pt-2 pb-1">
        {/* 답글 모드 표시 — 어디에 쓰는 답글인지 알려주고, X 로 일반 댓글로 돌아간다 */}
        {replyTo ? (
          <div className="mb-2 flex items-center gap-2 rounded-md bg-bg-secondary px-3 py-2 text-body-3 text-text-secondary">
            <span className="min-w-0 truncate">
              <span className="font-semibold text-text-primary">{replyTo.author.name}</span>
              님에게 답글 남기는 중
            </span>
            <button
              type="button"
              aria-label="답글 취소"
              onClick={() => setReplyTo(null)}
              className="-mr-1 ml-auto shrink-0 rounded p-1 text-text-disabled hover:text-text-secondary"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        ) : null}

        <TextField
          ref={inputRef}
          aria-label={replyTo ? "답글 입력" : "댓글 입력"}
          placeholder={replyTo ? "답글을 입력해주세요" : "댓글을 입력해주세요"}
          maxLength={500}
          submitLabel="등록"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
            // 빈 입력에서 Esc → 답글 모드 해제
            if (e.key === "Escape" && replyTo) setReplyTo(null);
          }}
          onSubmit={submit}
        />
      </div>

      {/* 댓글 신고 확인 — 게시글 신고(PromptDetailView)와 같은 ConfirmModal 규칙 */}
      <ConfirmModal
        open={reportTarget !== null}
        onOpenChange={(open) => {
          if (!open) setReportTarget(null);
        }}
        title="이 댓글을 신고할까요?"
        description="신고 내용은 검토 후 운영 정책에 따라 조치됩니다."
        cancelLabel="취소"
        confirmLabel="신고하기"
        onConfirm={() => {
          // TODO: 댓글 신고 API 연동(사유 선택 스펙 확정 후)
          setReportTarget(null);
        }}
      />
    </div>
  );
}

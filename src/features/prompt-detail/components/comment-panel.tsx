"use client";

import { useRef, useState } from "react";

import { XIcon } from "@/components/ui/icons";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { TextField } from "@/components/ui/text-field";
import { useCommentMutations } from "@/features/prompt-detail/hooks/use-comment-mutations";
import { useAuthGate } from "@/features/prompt-detail/hooks/use-auth-gate";
import { useComments } from "@/features/prompt-detail/hooks/use-comments";
import type { PromptComment } from "@/features/prompt-detail/types";
import { getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { CommentItem } from "./comment-item";
import { LoginModalContainer } from "@/features/auth/components/login-modal-container";

import { ReportModal } from "./report-modal";
import { COMMENT_INPUT_ANCHOR_ID } from "./detail-floating-actions";

/**
 * 하단 입력창이 무엇을 하는 중인가.
 * - `null`   : 새 댓글 작성
 * - `reply`  : 특정 최상위 댓글에 답글
 * - `edit`   : 내 댓글(또는 대댓글) 수정
 */
type Draft =
  { mode: "reply"; target: PromptComment } | { mode: "edit"; target: PromptComment } | null;

const COMMENT_MAX = 500;

/**
 * 댓글 탭 — 목록 + 작성/답글/수정 입력.
 *
 * 레이아웃: full-height flex 컬럼. 리스트가 남는 높이를 채우며(넘치면 리스트만 스크롤),
 * 입력창은 항상 컬럼 맨 아래에 붙는다(댓글이 적어도 하단 고정).
 * 데스크톱에선 부모(우측 컬럼)가 고정 높이를 주고, 모바일에선 자연스럽게 흐른다.
 *
 * 입력창은 **하나**다. ⋯ 메뉴에서 "답글"이나 "수정하기"를 고르면 새 입력창이 생기는 대신
 * 하단 입력창이 해당 모드로 바뀌고(대상 칩 + 자동 포커스), 대상 댓글이 하이라이트된다.
 * 모바일에서 화면 중간에 입력창이 끼어들면 키보드가 올라올 때 스크롤이 튀기 때문에,
 * 인스타그램/유튜브와 같은 "고정 입력창 + 대상 표시" 방식을 택했다.
 *
 * 답글 깊이는 1로 고정한다(디자인 = 접히는 스레드 1단).
 */
export function CommentPanel({ promptId, className }: { promptId: string; className?: string }) {
  const { data, isPending, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useComments(promptId);
  const { create, reply, update, remove } = useCommentMutations(promptId);
  // 댓글 작성·답글·신고는 로그인이 필요하다(수정·삭제는 본인 댓글에만 뜨므로 이미 로그인 상태).
  const gate = useAuthGate();

  const [text, setText] = useState("");
  const [draft, setDraft] = useState<Draft>(null);
  /** 신고 대상(댓글/대댓글 모두) */
  const [reportTarget, setReportTarget] = useState<PromptComment | null>(null);
  /** 삭제 확인 대상 — 되돌릴 수 없어 한 번 묻는다 */
  const [deleteTarget, setDeleteTarget] = useState<PromptComment | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const comments = data?.comments ?? [];
  const pending = create.isPending || reply.isPending || update.isPending;
  const error = create.error ?? reply.error ?? update.error ?? remove.error;

  const startReply = (target: PromptComment) =>
    gate.run(() => {
      setDraft({ mode: "reply", target });
      setText("");
      inputRef.current?.focus();
    });

  const startEdit = (target: PromptComment) => {
    setDraft({ mode: "edit", target });
    // 수정은 기존 내용을 채운 채로 시작한다.
    setText(target.body);
    inputRef.current?.focus();
  };

  const reset = () => {
    setDraft(null);
    setText("");
  };

  const submit = () => {
    const content = text.trim();
    if (content === "" || pending) return;
    if (!gate.isAuthenticated) {
      gate.setLoginOpen(true);
      return;
    }

    const done = { onSuccess: reset };
    if (draft?.mode === "reply") {
      reply.mutate({ commentId: draft.target.id, content }, done);
    } else if (draft?.mode === "edit") {
      update.mutate({ commentId: draft.target.id, content }, done);
    } else {
      create.mutate(content, done);
    }
  };

  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      {/* 리스트 — 남는 높이를 채우고, 넘치면 이 영역만 **세로로만** 스크롤.
          overflow-x-hidden: 긴 본문·메뉴 팝업 등으로 가로 스크롤바가 생기지 않게 잠근다. */}
      <div className="scrollbar-minimal min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        {isPending ? (
          <p className="py-16 text-center text-body-2 text-text-disabled">
            댓글을 불러오는 중이에요.
          </p>
        ) : isError ? (
          <p className="py-16 text-center text-body-2 text-text-disabled">
            댓글을 불러오지 못했어요.
          </p>
        ) : comments.length === 0 ? (
          <p className="py-16 text-center text-body-2 text-text-disabled">
            아직 작성된 댓글이 없어요.
          </p>
        ) : (
          <>
            <ul className="flex flex-col gap-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onReply={startReply}
                  onEdit={startEdit}
                  onDelete={setDeleteTarget}
                  onReport={(comment) => gate.run(() => setReportTarget(comment))}
                  activeId={draft?.target.id ?? null}
                />
              ))}
            </ul>

            {/* 커서 페이지네이션 — 서버가 20개씩 최신순으로 준다 */}
            {hasNextPage ? (
              <button
                type="button"
                onClick={() => void fetchNextPage()}
                disabled={isFetchingNextPage}
                className="mt-4 w-full rounded-md py-3 text-body-3 text-text-secondary hover:bg-bg-secondary disabled:text-text-disabled"
              >
                {isFetchingNextPage ? "불러오는 중…" : "댓글 더 보기"}
              </button>
            ) : null}
          </>
        )}
      </div>

      {/* 입력창 — 컬럼 하단 고정. id 는 모바일 "댓글로 이동" 플로팅 버튼의 스크롤 앵커. */}
      <div id={COMMENT_INPUT_ANCHOR_ID} className="shrink-0 scroll-mt-20 bg-bg-primary pt-2 pb-1">
        {/* 작업 모드 표시 — 무엇을 하는 중인지 알려주고, X 로 일반 댓글 작성으로 돌아간다 */}
        {draft ? (
          <div className="mb-2 flex items-center gap-2 rounded-md bg-bg-secondary px-3 py-2 text-body-3 text-text-secondary">
            <span className="min-w-0 truncate">
              {draft.mode === "reply" ? (
                <>
                  <span className="font-semibold text-text-primary">
                    {draft.target.author.name}
                  </span>
                  님에게 답글 남기는 중
                </>
              ) : (
                "댓글 수정 중"
              )}
            </span>
            <button
              type="button"
              aria-label={draft.mode === "reply" ? "답글 취소" : "수정 취소"}
              onClick={reset}
              className="-mr-1 ml-auto shrink-0 rounded p-1 text-text-disabled hover:text-text-secondary"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        ) : null}

        <TextField
          ref={inputRef}
          aria-label={
            draft?.mode === "reply"
              ? "답글 입력"
              : draft?.mode === "edit"
                ? "댓글 수정"
                : "댓글 입력"
          }
          placeholder={
            !gate.isAuthenticated
              ? "로그인 후 댓글을 남길 수 있어요"
              : draft?.mode === "reply"
                ? "답글을 입력해주세요"
                : "댓글을 입력해주세요"
          }
          maxLength={COMMENT_MAX}
          submitLabel={draft?.mode === "edit" ? "수정" : "등록"}
          value={text}
          disabled={pending}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
            // 빈 입력에서 Esc → 작업 모드 해제
            if (e.key === "Escape" && draft) reset();
          }}
          onSubmit={submit}
        />

        {error ? (
          <p role="alert" className="mt-1 text-body-3 text-text-brand">
            {getErrorMessage(error)}
          </p>
        ) : null}
      </div>

      {/* 비회원이 댓글·답글·신고를 시도했을 때 */}
      <LoginModalContainer open={gate.loginOpen} onOpenChange={gate.setLoginOpen} />

      {/* 삭제 확인 — 논리 삭제라 목록에는 "삭제된 댓글입니다"로 남는다 */}
      <ConfirmModal
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="이 댓글을 삭제할까요?"
        description="삭제한 댓글은 되돌릴 수 없어요."
        cancelLabel="취소"
        confirmLabel="삭제하기"
        onConfirm={() => {
          if (deleteTarget) {
            remove.mutate(deleteTarget.id);
            // 삭제 대상을 수정/답글 중이었다면 입력창도 함께 정리한다.
            if (draft?.target.id === deleteTarget.id) reset();
          }
          setDeleteTarget(null);
        }}
      />

      {/* 댓글 신고 — 게시글 신고와 같은 모달·사유 목록을 쓴다 */}
      <ReportModal
        open={reportTarget !== null}
        onOpenChange={(open) => {
          if (!open) setReportTarget(null);
        }}
        target="comment"
        // 닫힌 뒤에도 잠깐 남아 있는 대상(애니메이션 중)에 대비해 빈 문자열로 방어한다.
        targetId={reportTarget?.id ?? ""}
        onReported={() => setReportTarget(null)}
      />
    </div>
  );
}

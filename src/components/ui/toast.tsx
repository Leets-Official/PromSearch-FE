"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/api";

/**
 * 토스트 — 화면 하단에 잠깐 떴다 사라지는 알림.
 *
 * 왜 필요했나: 추천·북마크·복사·잠금해제처럼 **버튼 하나로 끝나는 액션**은 결과를 적을
 * 자리가 화면에 없다. 그래서 실패해도 아무 일이 없는 것처럼 보였고(특히 포인트가 걸린
 * 잠금해제), 성공해도 됐는지 알 수 없었다. 모달·폼처럼 자리가 있는 곳은 지금처럼
 * 인라인 문구를 쓰고, 자리가 없는 액션만 여기로 보낸다.
 *
 * 시안이 없어 기존 토큰으로 조립했다 — dim 배경 + on-brand 텍스트(이미지 위 오버레이와
 * 같은 규칙), radius/md, Interaction drop-shadow. 실패는 brand 색 점으로 구분한다.
 *
 * 접근성: 컨테이너가 `aria-live` 영역이라 **메시지를 넣기만 해도** 스크린리더가 읽는다.
 * 성공/안내는 `polite`(하던 말을 끊지 않음), 실패는 `assertive`(즉시 알림)로 나눈다.
 */
export type ToastTone = "success" | "error";

export type Toast = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  /** 성공/안내 — 하던 작업을 끊지 않고 알린다 */
  toastSuccess: (message: string) => void;
  /** 실패 — 서버 문구를 그대로 넘기면 된다 */
  toastError: (message: string) => void;
  /**
   * 실패를 `unknown` 에러에서 바로 띄운다.
   * mutation 의 `onError` 에 그대로 물릴 수 있게 만든 편의 함수.
   */
  toastApiError: (error: unknown) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

/** 한 토스트가 떠 있는 시간(ms). 한 문장을 읽고도 남을 만큼만. */
const TOAST_DURATION_MS = 3000;
/** 동시에 쌓이는 최대 개수 — 넘치면 오래된 것부터 밀어낸다. */
const MAX_VISIBLE = 3;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const nextId = React.useRef(0);

  const remove = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = React.useCallback(
    (message: string, tone: ToastTone) => {
      const trimmed = message.trim();
      if (!trimmed) return;
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, message: trimmed, tone }].slice(-MAX_VISIBLE));
      setTimeout(() => remove(id), TOAST_DURATION_MS);
    },
    [remove],
  );

  const value = React.useMemo<ToastContextValue>(
    () => ({
      toastSuccess: (message) => push(message, "success"),
      toastError: (message) => push(message, "error"),
      toastApiError: (error) => push(getErrorMessage(error), "error"),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={remove} />
    </ToastContext.Provider>
  );
}

/** "지금 클라이언트인가" 판정용 — 값이 바뀔 일이 없어 구독은 빈 함수다. */
const subscribeNever = () => () => {};
const getTrue = () => true;
const getFalse = () => false;

/**
 * 토스트를 그리는 곳. `document.body` 로 포털한다 —
 * 모달 안에서 띄워도 모달의 stacking context 에 갇히지 않아야 한다.
 */
function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  // 포털은 DOM 이 있어야 하므로 마운트 후에만 그린다(SSR 안전).
  // effect + setState 대신 useSyncExternalStore 를 쓴다 — 서버 스냅샷 false / 클라이언트 true 라
  // 하이드레이션 불일치 없이 한 번에 정해지고, "effect 안 setState" 도 피한다
  // (`use-auth-status` 가 쓰는 것과 같은 패턴).
  const mounted = React.useSyncExternalStore(subscribeNever, getTrue, getFalse);
  if (!mounted) return null;

  return createPortal(
    <div
      data-slot="toast-viewport"
      // 하단 중앙. 모바일은 안전영역만큼 띄우고, 모달(z-50)보다 위에 둔다.
      className="pointer-events-none fixed inset-x-0 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-4"
    >
      {/*
        aria-live 영역은 **비어 있는 채로 먼저 존재**해야 한다.
        메시지와 함께 영역까지 새로 생기면 스크린리더가 변화를 놓치는 경우가 있다.
      */}
      <div aria-live="polite" aria-atomic="false" className="contents">
        {toasts
          .filter((t) => t.tone !== "error")
          .map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
          ))}
      </div>
      <div aria-live="assertive" aria-atomic="false" className="contents">
        {toasts
          .filter((t) => t.tone === "error")
          .map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
          ))}
      </div>
    </div>,
    document.body,
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  return (
    <button
      type="button"
      // 다 읽었으면 눌러서 바로 치울 수 있다(자동으로도 사라진다).
      onClick={() => onDismiss(toast.id)}
      className={cn(
        "pointer-events-auto flex max-w-140 items-center gap-2 rounded-md bg-dim px-4 py-3 text-left",
        "text-body-2 text-text-on-brand shadow-[0_4px_8px_rgb(35_35_33/0.13)]",
        "animate-in duration-150 fade-in-0 slide-in-from-bottom-2",
      )}
    >
      {toast.tone === "error" ? (
        // 색만으로 구분하지 않도록 점 + 접두어를 함께 둔다(색각 이상·흑백 환경)
        <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-brand" />
      ) : null}
      <span>
        {toast.tone === "error" ? <span className="sr-only">오류: </span> : null}
        {toast.message}
      </span>
    </button>
  );
}

/**
 * 토스트를 띄우는 훅.
 *
 * Provider 밖에서 부르면 **조용히 무시**한다(no-op). 알림 하나 때문에 화면이 통째로
 * 죽는 편보다 낫고, 테스트에서 Provider 없이 컴포넌트를 렌더할 수 있게도 해 준다.
 */
const NOOP: ToastContextValue = {
  toastSuccess: () => {},
  toastError: () => {},
  toastApiError: () => {},
};

export function useToast(): ToastContextValue {
  return React.useContext(ToastContext) ?? NOOP;
}

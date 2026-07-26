"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  DEV_PREVIEW_DEFAULT,
  DEV_PREVIEW_PARAM,
  DEV_TOOLBAR_ENABLED,
  isDefaultDevPreview,
  parseDevPreview,
  serializeDevPreview,
  writeDevPreviewCookie,
  type DevPreview,
} from "@/lib/dev-preview";

type DevPreviewContextValue = {
  /** 툴바 활성 여부(=오버라이드를 적용해도 되는지). 꺼져 있으면 소비자는 실동작(env)로 폴백. */
  enabled: boolean;
  preview: DevPreview;
  setPreview: (next: Partial<DevPreview>) => void;
  reset: () => void;
};

const DevPreviewContext = createContext<DevPreviewContextValue>({
  enabled: false,
  preview: DEV_PREVIEW_DEFAULT,
  setPreview: () => {},
  reset: () => {},
});

/**
 * Dev 프리뷰 상태 프로바이더.
 *
 * 초기값은 **서버가 쿠키에서 읽어** prop 으로 내려준다 → 첫 클라 렌더가 서버와 일치(플래시/불일치 없음).
 * 상태 변경 시: 쿠키 기록 → 주소창 `?dev=` 동기화(공유용) → 서버 컴포넌트/쿼리 무효화로 데이터 갱신.
 *
 * 서버가 `router.refresh()` 로 새 쿠키를 반영하면 `initialPreview` prop 이 갱신되는데,
 * 이를 로컬 state 에 반영하려고 **렌더 중 동기화**(React 권장 패턴)를 쓴다 — effect + setState 금지 규칙 회피.
 *
 * 툴바가 꺼져 있으면(`enabled=false`) 상태를 그대로 통과시키고 소비자가 실동작으로 폴백한다.
 */
export function DevPreviewProvider({
  initialPreview,
  children,
}: {
  initialPreview: DevPreview;
  children: ReactNode;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [preview, setPreviewState] = useState<DevPreview>(initialPreview);

  // 서버 prop 이 바뀌면(=router.refresh 후 쿠키 재시드) 로컬 state 를 렌더 중 맞춘다.
  const [seededKey, setSeededKey] = useState(() => serializeDevPreview(initialPreview));
  const initialKey = serializeDevPreview(initialPreview);
  if (initialKey !== seededKey) {
    setSeededKey(initialKey);
    setPreviewState(initialPreview);
  }

  // 공유 링크(?dev=...)로 진입: URL 값이 현재 시드와 다르면 쿠키에 반영하고 서버 렌더를 다시 시드한다.
  // (setState 없이 부수효과만 — 이후 prop 갱신은 위의 렌더 중 동기화가 처리)
  const hydratedFromUrl = useRef(false);
  useEffect(() => {
    if (!DEV_TOOLBAR_ENABLED || hydratedFromUrl.current) return;
    hydratedFromUrl.current = true;
    const raw = new URLSearchParams(window.location.search).get(DEV_PREVIEW_PARAM);
    if (!raw) return;
    const fromUrl = parseDevPreview(raw);
    if (serializeDevPreview(fromUrl) === initialKey) return;
    writeDevPreviewCookie(fromUrl);
    router.refresh(); // 서버 컴포넌트를 새 쿠키로 재실행 → initialPreview 갱신 → 렌더 중 동기화
    void queryClient.resetQueries();
  }, [initialKey, queryClient, router]);

  const applyToUrl = useCallback((value: DevPreview) => {
    const url = new URL(window.location.href);
    if (isDefaultDevPreview(value)) {
      url.searchParams.delete(DEV_PREVIEW_PARAM);
    } else {
      url.searchParams.set(DEV_PREVIEW_PARAM, serializeDevPreview(value));
    }
    window.history.replaceState(null, "", url.toString());
  }, []);

  const setPreview = useCallback(
    (next: Partial<DevPreview>) => {
      const value: DevPreview = { ...preview, ...next };
      setPreviewState(value);
      setSeededKey(serializeDevPreview(value)); // refresh 후 재시드가 이 값을 덮어쓰지 않도록
      // 부수효과는 렌더(updater) 밖 이벤트 핸들러에서 실행 — 렌더 중 Router/쿼리 갱신 금지.
      writeDevPreviewCookie(value);
      applyToUrl(value);
      // content/edge 는 쿼리키에 없어 invalidate(백그라운드 리페치)로는 isPending 이 안 뜬다.
      // reset 으로 캐시를 비워 처음부터 다시 받게 해야 로딩 스켈레톤·에러가 옛 데이터 없이 반영된다.
      void queryClient.resetQueries();
      // 서버 컴포넌트(쿠키 기반)도 새 상태로 재실행.
      router.refresh();
    },
    [preview, applyToUrl, queryClient, router],
  );

  const reset = useCallback(() => setPreview(DEV_PREVIEW_DEFAULT), [setPreview]);

  const value = useMemo<DevPreviewContextValue>(
    () => ({ enabled: DEV_TOOLBAR_ENABLED, preview, setPreview, reset }),
    [preview, setPreview, reset],
  );

  return <DevPreviewContext.Provider value={value}>{children}</DevPreviewContext.Provider>;
}

export function useDevPreview(): DevPreviewContextValue {
  return useContext(DevPreviewContext);
}

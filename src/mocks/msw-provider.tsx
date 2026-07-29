"use client";

import { useEffect, useState, type ReactNode } from "react";

const MOCKING_ENABLED = process.env.NEXT_PUBLIC_API_MOCKING === "enabled";

/**
 * MSW 브라우저 목 워커 시작 게이트.
 *
 * BE 스펙 확정 전, `NEXT_PUBLIC_API_MOCKING=enabled` 일 때만 워커를 켜고 그동안 렌더를 보류한다.
 * (첫 fetch 가 워커 준비 전에 나가는 것을 막기 위함) 플래그가 꺼져 있으면 아무 것도 안 하고 그대로 렌더.
 * 서버/클라이언트 초기 상태가 동일(플래그는 public env)하여 hydration 불일치가 없다.
 */
export function MswProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!MOCKING_ENABLED);

  useEffect(() => {
    if (!MOCKING_ENABLED) return;
    let active = true;
    void (async () => {
      const { worker } = await import("@/mocks/browser");
      await worker.start({ onUnhandledRequest: "bypass" });
      if (active) setReady(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}

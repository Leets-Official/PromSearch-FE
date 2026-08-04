"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** 스와이프로 인정할 최소 가로 이동량(px) — 화면 폭 비율 임계값과 함께 큰 쪽을 쓴다 */
const SWIPE_THRESHOLD_PX = 40;
/** 화면 폭 대비 임계 비율 — 넓은 화면에서 40px 은 너무 민감하다 */
const SWIPE_THRESHOLD_RATIO = 0.15;
/** 손을 뗀 뒤 다음/이전 장으로 붙는 애니메이션 시간(ms). CSS transition 과 같은 값. */
export const CAROUSEL_SETTLE_MS = 280;
/** 가로/세로 중 어느 축의 제스처인지 확정하는 최소 이동량(px) */
const AXIS_LOCK_PX = 8;

/**
 * 손가락을 따라오는 캐러셀 스와이프.
 *
 * 기존 구현은 "터치가 끝난 뒤 임계값을 넘었으면 index 를 바꾸고 opacity 크로스페이드"라
 * 드래그 중에는 아무 반응이 없다가 손을 떼는 순간 툭 바뀌었다(= 끊기는 느낌).
 * 여기서는 이동량(offset)을 그대로 노출해 **드래그 중에는 트랙이 손가락을 따라오고**,
 * 손을 떼면 다음/이전 장 위치까지 이어서 애니메이션한 뒤 index 를 교체한다.
 *
 * 순환(마지막 → 처음)도 자연스럽게 이어지도록, 각 슬라이드 위치는 index 기준
 * **최단 순환 거리**로 계산한다(`slidePosition`). 화면에 보이는 건 언제나 ±1 뿐이라
 * 멀리 있는 슬라이드가 어떻게 배치되든 눈에 띄지 않는다.
 *
 * 사용법:
 *   const swipe = useCarouselSwipe({ total });
 *   <div ref={swipe.setContainer} {...swipe.touchHandlers} style={{ touchAction: "pan-y" }}>
 *     <div style={swipe.trackStyle}>
 *       {items.map((src, i) => <img style={swipe.slideStyle(i)} ... />)}
 *
 * 컨테이너는 ref 객체가 아니라 **콜백 ref**(`setContainer`)로 받는다 — 훅이 ref 객체를
 * 반환하면 반환 객체 전체가 "렌더 중 ref 접근"으로 잡힌다(react-hooks/refs).
 */
export function useCarouselSwipe({
  total,
  initialIndex = 0,
  /** false 면 터치를 무시한다(예: 확대 모달에서 핀치 줌 중) */
  enabled = true,
}: {
  total: number;
  initialIndex?: number;
  enabled?: boolean;
}) {
  const [index, setIndex] = useState(initialIndex);
  /** 트랙의 현재 가로 이동량(px). 드래그 중엔 손가락 delta, 붙는 중엔 ±컨테이너 폭 */
  const [offset, setOffset] = useState(0);
  /** transition on/off — 드래그 중엔 꺼야 손가락을 지연 없이 따라온다 */
  const [settling, setSettling] = useState(false);

  const containerRef = useRef<HTMLElement | null>(null);
  /** 콜백 ref — 훅 밖으로 ref 객체를 내보내지 않기 위해 함수로 받는다 */
  const setContainer = useCallback((node: HTMLElement | null) => {
    containerRef.current = node;
  }, []);
  const start = useRef<{ x: number; y: number } | null>(null);
  const axis = useRef<"x" | "y" | null>(null);
  const offsetRef = useRef(0);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** 이번 제스처가 스와이프였는지 — 스와이프 끝에 딸려오는 click(확대 모달 등) 억제용 */
  const swiped = useRef(false);

  const hasMultiple = total > 1;

  const applyOffset = (next: number) => {
    offsetRef.current = next;
    setOffset(next);
  };

  useEffect(() => {
    return () => {
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
  }, []);

  /**
   * delta 만큼 이동. 0 이면 제자리로 되돌린다(임계값 미달).
   * 트랙을 한 칸 폭만큼 애니메이션한 뒤, 끝나는 시점에 index 를 바꾸고 offset 을 0 으로
   * 되돌린다 — 두 상태가 같은 렌더에서 바뀌므로 화면상 변화는 없다(깜빡임 없음).
   */
  const settle = useCallback(
    (delta: -1 | 0 | 1) => {
      const width = containerRef.current?.clientWidth ?? 0;
      setSettling(true);
      applyOffset(delta === 0 ? 0 : -delta * width);

      if (settleTimer.current) clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(() => {
        if (delta !== 0) setIndex((i) => (i + delta + total) % total);
        setSettling(false);
        applyOffset(0);
      }, CAROUSEL_SETTLE_MS);
    },
    [total],
  );

  /** 이전(-1)/다음(+1) — 화살표 버튼·키보드에서 사용. 스와이프와 같은 애니메이션을 탄다. */
  const go = useCallback(
    (delta: -1 | 1) => {
      if (!hasMultiple || settling) return;
      settle(delta);
    },
    [hasMultiple, settling, settle],
  );

  /** 임의 인덱스로 즉시 이동(썸네일 클릭 등) — 애니메이션 없이 교체 */
  const goTo = useCallback((next: number) => {
    if (settleTimer.current) clearTimeout(settleTimer.current);
    setSettling(false);
    applyOffset(0);
    setIndex(next);
  }, []);

  const onTouchStart = (event: React.TouchEvent) => {
    if (!enabled || !hasMultiple || settling) return;
    if (event.touches.length !== 1) return; // 핀치(2점)는 줌으로 넘긴다
    start.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    axis.current = null;
    swiped.current = false;
  };

  const onTouchMove = (event: React.TouchEvent) => {
    const from = start.current;
    if (!from || event.touches.length !== 1) return;
    const dx = event.touches[0].clientX - from.x;
    const dy = event.touches[0].clientY - from.y;

    // 처음 몇 px 로 가로/세로를 확정한다. 세로면 이번 제스처는 스크롤에 넘긴다.
    if (axis.current === null) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < AXIS_LOCK_PX) return;
      axis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (axis.current !== "x") return;

    swiped.current = true;
    applyOffset(dx);
  };

  const onTouchEnd = () => {
    const from = start.current;
    start.current = null;
    if (!from || axis.current !== "x") {
      axis.current = null;
      return;
    }
    axis.current = null;

    const width = containerRef.current?.clientWidth ?? 0;
    const threshold = Math.max(SWIPE_THRESHOLD_PX, width * SWIPE_THRESHOLD_RATIO);
    const dx = offsetRef.current;
    settle(Math.abs(dx) > threshold ? (dx < 0 ? 1 : -1) : 0);
  };

  /**
   * 슬라이드 i 가 놓일 자리(칸 단위). 현재 장은 0, 좌우가 ∓1.
   * index 기준 **최단 순환 거리**라 마지막 → 처음도 옆칸으로 이어진다.
   */
  const slidePosition = (i: number) => {
    if (!hasMultiple) return 0;
    let pos = i - index;
    if (pos > total / 2) pos -= total;
    if (pos < -total / 2) pos += total;
    return pos;
  };

  return {
    index,
    /** 현재 화면에 걸쳐 있는 슬라이드인지(= src 를 걸어 프리로드할 대상) */
    isVisible: (i: number) => Math.abs(slidePosition(i)) <= 1,
    setContainer,
    go,
    goTo,
    /** 스와이프 직후 발생하는 click 을 무시해야 하는지 */
    didSwipe: () => swiped.current,
    touchHandlers: { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel: onTouchEnd },
    trackStyle: {
      transform: `translate3d(${offset}px, 0, 0)`,
      transition: settling
        ? `transform ${CAROUSEL_SETTLE_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1)`
        : "none",
    } satisfies React.CSSProperties,
    slideStyle: (i: number) =>
      ({
        transform: `translate3d(${slidePosition(i) * 100}%, 0, 0)`,
      }) satisfies React.CSSProperties,
  };
}

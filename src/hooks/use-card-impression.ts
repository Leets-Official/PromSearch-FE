"use client";

import { useEffect, useRef, useState, type RefCallback } from "react";
import { track } from "@/analytics/track";
import type { UserStatus } from "@/analytics/events";

const DEFAULT_THRESHOLD = 0.5;
const DEFAULT_DELAY_MS = 1000;
const viewedCardIds = new Set<string>();

type UseCardImpressionOptions = {
  cardId: string;
  position: number;
  userStatus: UserStatus;
  delayMs?: number;
  source?: string;
  threshold?: number;
};

export function useCardImpression({
  cardId,
  delayMs = DEFAULT_DELAY_MS,
  position,
  source,
  threshold = DEFAULT_THRESHOLD,
  userStatus,
}: UseCardImpressionOptions): RefCallback<HTMLElement> {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!target || !cardId || viewedCardIds.has(cardId)) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const clearPendingImpression = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some(
          (entry) => entry.isIntersecting && entry.intersectionRatio >= threshold,
        );

        if (!isVisible) {
          clearPendingImpression();
          return;
        }

        if (timeoutRef.current || viewedCardIds.has(cardId)) {
          return;
        }

        timeoutRef.current = setTimeout(() => {
          viewedCardIds.add(cardId);
          timeoutRef.current = null;
          track("card_impression", {
            card_id: cardId,
            position,
            source,
            user_status: userStatus,
          });
        }, delayMs);
      },
      { threshold },
    );

    observer.observe(target);

    return () => {
      clearPendingImpression();
      observer.disconnect();
    };
  }, [cardId, delayMs, position, source, target, threshold, userStatus]);

  return setTarget;
}

export function resetCardImpressionSessionForTest() {
  viewedCardIds.clear();
}

/**
 * 신고 접수 API.
 *
 * - `[MODERATION-001] POST /reports/posts/{postId}`
 * - `[MODERATION-002] POST /reports/comments/{commentId}`
 *
 * 게시글과 댓글이 **경로로 갈린다**(본문에 targetType 을 담지 않는다).
 */

import { api } from "@/lib/api";

import type { ApiReportReason } from "./dto";

export type ReportTargetType = "post" | "comment";

/** 신고 사유 — 서버 enum 과 1:1. 라디오 노출 순서대로 둔다. */
export const REPORT_REASONS: { value: ApiReportReason; label: string }[] = [
  { value: "SPAM", label: "스팸·광고" },
  { value: "INAPPROPRIATE", label: "부적절한 내용" },
  { value: "COPYRIGHT", label: "저작권 침해" },
  { value: "LOW_QUALITY", label: "품질이 낮음" },
  { value: "ETC", label: "기타" },
];

export function createReport(
  target: ReportTargetType,
  targetId: string,
  reason: ApiReportReason,
  description: string,
): Promise<void> {
  const path = target === "post" ? "posts" : "comments";
  // description 은 required 라 비어 있으면 사유 라벨로 채운다.
  const fallback = REPORT_REASONS.find((r) => r.value === reason)?.label ?? "";
  return api.post(`/reports/${path}/${targetId}`, {
    reason,
    description: description.trim() || fallback,
  });
}

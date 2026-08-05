/**
 * 프롬프트 상세 API — `[PROMPT-001] GET /prompts/{promptId}`.
 *
 * 인증은 선택이다(비회원도 조회 가능). 잠금 판정(`access`)과 본문 노출 범위는 **서버가** 정하므로
 * 프론트는 받은 값을 그대로 렌더한다.
 */

import { api, isApiError } from "@/lib/api";

import type { ApiPromptDetail } from "./dto";
import { toPromptDetail } from "./map";
import type { PromptDetail } from "../types";

/** 없는/비공개/삭제된 게시글 — 화면에서 404 상태로 분기하기 위한 전용 에러 */
export class PromptNotFoundError extends Error {
  constructor(id: string) {
    super(`프롬프트를 찾을 수 없습니다: ${id}`);
    this.name = "PromptNotFoundError";
  }
}

export async function fetchPromptDetail(id: string): Promise<PromptDetail> {
  try {
    const result = await api.get<ApiPromptDetail>(`/prompts/${id}`);
    return toPromptDetail(result);
  } catch (error) {
    if (isApiError(error) && error.status === 404) {
      throw new PromptNotFoundError(id);
    }
    throw error;
  }
}

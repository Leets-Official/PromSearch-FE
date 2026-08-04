/**
 * BE 태그 ID 매핑.
 *
 * ⚠️ **임시 하드코딩** — 태그 목록 조회 API(요청서 C-1)가 아직 없어서 FE 상수로 들고 있다.
 * 값은 **BE 회신(2026-08-05)** 기준이며, BE 에서 태그를 추가/변경하면 이 파일도 함께 고쳐야 한다.
 * 태그 API 가 생기면 이 파일을 지우고 런타임 조회로 교체한다.
 *
 * 쓰이는 곳
 * - 홈 직군별 목록 `GET /home/prompts/jobs/{jobTagId}`
 * - 프롬프트 생성 `POST /prompts` 의 `jobTagIds` / `taskTagIds` / `aiModelTagIds`
 *
 * @see {@link file://./categories.ts} 라벨·순서 정의(단일 출처)
 * @see [docs/api-requests-be.md](../../../docs/api-requests-be.md) C-1
 */

import type { AiModel, JobCategory, Task } from "./types";

/** 직군 → JOB 태그 ID */
export const JOB_TAG_ID: Record<JobCategory, number> = {
  student: 1, // 학생
  worker: 2, // 직장인
  self_employed: 3, // 자영업자
  planner: 4, // 기획자
  designer: 5, // 디자이너
  developer: 6, // 개발자
};

/** 태스크 → TASK 태그 ID */
export const TASK_TAG_ID: Record<Task, number> = {
  ppt: 7, // PPT
  report: 8, // 레포트
  email: 9, // 이메일
  document: 10, // 보고서
  meeting_notes: 11, // 회의록
  image_gen: 12, // 이미지 생성
};

/**
 * AI 모델 → AI_MODEL 태그 ID.
 *
 * **"기타"(etc)는 태그가 아니다** — BE 에 해당 태그 행이 없고, 대신 프롬프트의
 * `customAiModel` 문자열 필드에 사용자가 입력한 모델명을 담는다. 그래서 값이 `null` 이고,
 * 업로드 시 `aiModelTagIds` 에서 제외한 뒤 `customAiModel` 을 채워 보내야 한다.
 *
 * 부작용: 기타 모델로 올린 프롬프트는 목록/상세 응답의 `tags` 에 AI_MODEL 항목이 없어
 * **모델명을 표시할 방법이 없다**(응답에 `customAiModel` 필드가 없음 — 요청서 7-4 확인 대기).
 * 그때까지 카드/상세는 "기타"로만 노출된다.
 */
export const AI_MODEL_TAG_ID: Record<AiModel, number | null> = {
  chatgpt: 13,
  gemini: 14,
  claude: 15,
  etc: null,
};

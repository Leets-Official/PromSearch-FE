import type { AgreementsPayload } from "@/features/auth/api/types";

/** 화면의 약관 id → BE agreements 필드 매핑. 실제 TERMS 상수의 id 값과 반드시 일치해야 함 */
const TERM_ID_TO_FIELD: Record<string, keyof AgreementsPayload> = {
  service: "serviceTerms",
  community: "communityTerms",
  "content-copyright": "contentPolicy",
  "age-over-14": "age14OrOver",
  marketing: "marketing",
};

/** 동의한 약관 id 배열 → API 요청용 agreements 객체 (5개 키 모두 채워서 전송) */
export function toAgreementsPayload(agreedTerms: string[]): AgreementsPayload {
  const agreedSet = new Set(agreedTerms);
  return {
    serviceTerms: agreedSet.has("service"),
    communityTerms: agreedSet.has("community"),
    contentPolicy: agreedSet.has("content-copyright"),
    age14OrOver: agreedSet.has("age-over-14"),
    marketing: agreedSet.has("marketing"),
  };
}

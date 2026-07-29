export interface TermItem {
  id: string;
  label: string;
  required: boolean;
  href?: string;
}

/** 약관 목록 — BE/기획 확정 시 문구·href 교체 */
export const TERMS: readonly TermItem[] = [
  { id: "service", label: "프롬써치 이용약관", required: true },
  { id: "terms-a", label: "다른이용약관123", required: false },
  { id: "terms-b", label: "다른이용약관123", required: false },
  { id: "terms-c", label: "다른이용약관123", required: false },
] as const;

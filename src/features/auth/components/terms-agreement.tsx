"use client";

import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { TERMS } from "../signup/terms";

interface TermsAgreementProps {
  /** 동의한 약관 id 집합 */
  agreed: Set<string>;
  onChange: (agreed: Set<string>) => void;
}

/**
 * 약관 동의란 (Figma: 회원가입 약관 블록)
 * - 전체 동의: 모든 항목 토글 / 개별이 전부 체크되면 전체동의도 켜짐(양방향)
 * - 필수/선택 뱃지, 항목별 '보기' 링크, 하단 개인정보 안내 박스
 */
export function TermsAgreement({ agreed, onChange }: TermsAgreementProps) {
  const allChecked = TERMS.every((t) => agreed.has(t.id));

  const toggleAll = () => {
    onChange(allChecked ? new Set() : new Set(TERMS.map((t) => t.id)));
  };

  const toggleOne = (id: string) => {
    const next = new Set(agreed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  };

  return (
    <div className="flex w-full flex-col items-center gap-12 rounded-2xl border border-stroke-primary p-8">
      <div className="flex w-full flex-col gap-4">
        {/* 전체 동의 */}
        <label className="flex cursor-pointer items-start gap-2">
          <Checkbox checked={allChecked} onChange={toggleAll} />
          <div className="flex flex-col gap-1">
            <span className="text-title-1 text-text-primary">약관 전체 동의하기</span>
            <p className="text-body-3 text-text-secondary">
              캡션으로 안내 문구를 작성합니다.
              <br />
              캡션으로 안내 문구를 작성합니다. 캡션으로 안내 문구를 작성합니다.
            </p>
          </div>
        </label>

        {/* 개별 항목 */}
        <div className="flex flex-col gap-3">
          {TERMS.map((term) => (
            <div key={term.id} className="flex items-center gap-2">
              <label className="flex flex-1 cursor-pointer items-center gap-2">
                <Checkbox checked={agreed.has(term.id)} onChange={() => toggleOne(term.id)} />
                <span
                  className={cn(
                    "text-caption-1",
                    term.required ? "text-text-brand" : "text-text-disabled",
                  )}
                >
                  {term.required ? "필수" : "선택"}
                </span>
                <span className="text-body-3 text-text-primary">{term.label}</span>
              </label>
              {term.href ? (
                <a
                  href={term.href}
                  className="text-body-3 text-text-secondary hover:text-text-primary"
                >
                  보기
                </a>
              ) : (
                <span className="text-body-3 text-text-secondary">보기</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 개인정보 수집·이용 안내 */}
      <div className="flex w-full flex-col gap-2">
        <span className="text-title-3 text-text-primary">개인정보 수집 및 이용 안내</span>
        <div className="max-h-24 overflow-y-auto rounded-lg bg-bg-secondary p-4 text-body-3 text-text-disabled">
          캡션으로 안내 문구를 작성합니다.
          <br />
          캡션으로 안내 문구를 작성합니다. 캡션으로 안내 문구를 작성합니다.
          <br />
          길어지면 더보기
        </div>
      </div>
    </div>
  );
}

/** 사각 체크박스 (브랜드 채움) */
function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded border transition-colors",
        checked ? "border-brand bg-brand text-white" : "border-stroke-disabled bg-bg-primary",
      )}
    >
      {checked && <CheckIcon className="size-3.5" />}
    </button>
  );
}

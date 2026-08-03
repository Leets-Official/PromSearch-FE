"use client";

import type { ReactNode } from "react";
import { CheckIcon, CircleAlertIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { SearchBar } from "@/components/ui/search-bar";
import { Textarea } from "@/components/ui/textarea";

import { SpecCell, SpecGroup, SpecSection } from "./spec";

/**
 * Input 스펙 시트 (Figma Input 섹션 309:1873).
 * 디자이너 "Text Input" 은 Title* 라벨 + 인풋 + Caption 이 한 세트 → Field 로 재현.
 * hover/active 상태는 인풋 내부 규칙과 동일한 토큰을 className 으로 강제 적용(문서용).
 */

const FOCUS_SHADOW = "shadow-[0px_4px_8px_rgba(35,33,33,0.13)]";

// Title* + 필드 + Caption 세트
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="w-full max-w-xs space-y-1.5">
      <span className="flex items-center gap-0.5 text-title-3 text-text-primary">
        Title <span className="text-text-brand">*</span>
      </span>
      {children}
      <p className="text-caption-1 text-text-disabled">{label}</p>
    </div>
  );
}

export function InputSection() {
  return (
    <SpecSection id="input" label="Input">
      {/* Text Input — 7 states */}
      <SpecGroup title="Text Input" className="flex-col items-stretch gap-6">
        <Field label="default">
          <Input placeholder="Placeholder" />
        </Field>
        <Field label="hover">
          <Input placeholder="Placeholder" className="border-stroke-strong" />
        </Field>
        <Field label="active">
          <Input placeholder="Placeholder" className={`border-stroke-strong ${FOCUS_SHADOW}`} />
        </Field>
        <Field label="filled">
          <Input defaultValue="Placeholder" />
        </Field>
        <Field label="disabled">
          <Input placeholder="Placeholder" disabled />
        </Field>
        <Field label="error">
          <div className="relative">
            <Input aria-invalid defaultValue="Placeholder" className="pr-11" />
            <CircleAlertIcon className="absolute top-1/2 right-4 size-5 -translate-y-1/2 text-red-500" />
          </div>
        </Field>
        <Field label="success">
          <div className="relative">
            <Input data-success defaultValue="Placeholder" className="pr-11" />
            <CheckIcon className="absolute top-1/2 right-4 size-5 -translate-y-1/2 text-[#005eeb]" />
          </div>
        </Field>
      </SpecGroup>

      {/* Text Area — 5 states */}
      <SpecGroup title="Text Area" className="flex-col items-stretch gap-6">
        <Field label="default">
          <Textarea placeholder="Placeholder" />
        </Field>
        <Field label="active">
          <Textarea placeholder="Placeholder" className={`border-stroke-strong ${FOCUS_SHADOW}`} />
        </Field>
        <Field label="filled">
          <Textarea defaultValue="Placeholder" />
        </Field>
        <Field label="disabled">
          <Textarea placeholder="Placeholder" disabled />
        </Field>
      </SpecGroup>

      {/* Search Bar — 4 states */}
      <SpecGroup title="Search Bar" className="flex-col items-start gap-4">
        <SpecCell label="default" className="items-start">
          <SearchBar placeholder="Placeholder" />
        </SpecCell>
        <SpecCell label="hover" className="items-start">
          <SearchBar placeholder="Placeholder" className="border-stroke-strong" />
        </SpecCell>
        <SpecCell label="active" className="items-start">
          <SearchBar placeholder="Placeholder" className={`border-stroke-strong ${FOCUS_SHADOW}`} />
        </SpecCell>
        <SpecCell label="filled" className="items-start">
          <SearchBar defaultValue="Placeholder" />
        </SpecCell>
      </SpecGroup>
    </SpecSection>
  );
}

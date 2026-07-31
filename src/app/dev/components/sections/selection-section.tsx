"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Chip } from "@/components/ui/chip";
import { Switch } from "@/components/ui/switch";
import {
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlList,
} from "@/components/ui/segmented-control";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { SpecCell, SpecGroup, SpecSection } from "./spec";

/**
 * Selection 스펙 시트 (Figma Selection 섹션 309:1877).
 * Chip·Segment·Tab 은 실제 클릭 동작하는 controlled 데모로 구성.
 * Dropdown 상태(default/hover/active/selected)만 정적 스와치로 나열.
 */

// 드롭다운 트리거 상태 스와치 — select.tsx SelectTrigger 와 동일한 토큰
function DropdownSwatch({
  state,
  value,
}: {
  state: "default" | "hover" | "active" | "selected";
  value?: string;
}) {
  const border =
    state === "default" || state === "selected" ? "border-stroke-disabled" : "border-stroke-strong";
  const shadow = state === "active" ? "shadow-md" : "";
  const filled = state === "selected";
  return (
    <div
      className={`flex h-12 w-56 items-center justify-between gap-1.5 rounded-md border ${border} ${shadow} bg-bg-primary px-4 text-body-1`}
    >
      <span className={filled ? "text-text-primary" : "text-text-disabled"}>
        {value ?? "Placeholder"}
      </span>
      {state === "active" ? (
        <ChevronUpIcon className="size-5 text-text-primary" />
      ) : (
        <ChevronDownIcon className="size-5 text-text-primary" />
      )}
    </div>
  );
}

const SORT_OPTIONS = [
  { value: "popular", label: "인기순" },
  { value: "latest", label: "최신순" },
  { value: "views", label: "조회순" },
];

export function SelectionSection() {
  const [chips, setChips] = useState<string[]>(["디자인"]);
  const [sort, setSort] = useState("popular");
  const [tab, setTab] = useState("prompt");
  const [agreed, setAgreed] = useState(true);
  const [alertOn, setAlertOn] = useState(true);

  const toggleChip = (job: string) =>
    setChips((prev) => (prev.includes(job) ? prev.filter((j) => j !== job) : [...prev, job]));

  return (
    <SpecSection id="selection" label="Selection">
      {/* Chip — 클릭해서 선택 토글 */}
      <SpecGroup title="Chip (클릭 → 선택 토글)">
        {["개발", "디자인", "마케팅", "기획"].map((job) => (
          <Chip key={job} selected={chips.includes(job)} onClick={() => toggleChip(job)}>
            {job}
          </Chip>
        ))}
        <span className="self-center text-caption-1 text-text-disabled">
          선택됨: {chips.length ? chips.join(", ") : "없음"}
        </span>
      </SpecGroup>

      {/* Dropdown — 상태 스와치 (정적) */}
      <SpecGroup title="Dropdown (상태)" className="flex-col items-start gap-4">
        <DropdownSwatch state="default" />
        <DropdownSwatch state="hover" />
        <DropdownSwatch state="active" />
        <DropdownSwatch state="selected" value="선택된 값" />
      </SpecGroup>

      {/* Checkbox — Figma 1085:2437 */}
      <SpecGroup title="Checkbox (클릭 → 토글)">
        <SpecCell label="default / selected">
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox checked={agreed} onCheckedChange={setAgreed} />
            <span className="text-body-3 text-text-primary">Placeholder</span>
          </label>
        </SpecCell>
        <SpecCell label="indeterminate">
          <Checkbox indeterminate checked={false} />
        </SpecCell>
        <SpecCell label="disabled">
          <Checkbox disabled />
        </SpecCell>
      </SpecGroup>

      {/* Toggle — Figma 1512:6792 */}
      <SpecGroup title="Toggle (클릭 → on/off)">
        <SpecCell label={alertOn ? "on" : "off"}>
          <Switch checked={alertOn} onCheckedChange={setAlertOn} />
        </SpecCell>
        <SpecCell label="disabled">
          <Switch disabled />
        </SpecCell>
      </SpecGroup>

      {/* Segment Control — 클릭해서 전환 (controlled) */}
      <SpecGroup title="Segment Control (클릭 → 전환)" className="flex-col items-start gap-3">
        <SegmentedControl value={sort} onValueChange={setSort} className="w-full max-w-md">
          <SegmentedControlList>
            {SORT_OPTIONS.map((opt) => (
              <SegmentedControlItem key={opt.value} value={opt.value}>
                {opt.label}
              </SegmentedControlItem>
            ))}
          </SegmentedControlList>
        </SegmentedControl>
        <span className="text-caption-1 text-text-disabled">
          선택됨: {SORT_OPTIONS.find((o) => o.value === sort)?.label}
        </span>
      </SpecGroup>

      {/* Tab (밑줄형) — 클릭해서 전환 (controlled) */}
      <SpecGroup title="Tab (밑줄형, 클릭 → 전환)" className="flex-col items-start gap-3">
        <Tabs value={tab} onValueChange={setTab} className="w-full max-w-xs">
          <TabsList>
            <TabsTrigger value="prompt">프롬프트</TabsTrigger>
            <TabsTrigger value="output">아웃풋</TabsTrigger>
            <TabsTrigger value="review">리뷰</TabsTrigger>
          </TabsList>
        </Tabs>
        <span className="text-caption-1 text-text-disabled">선택됨: {tab}</span>
      </SpecGroup>
    </SpecSection>
  );
}

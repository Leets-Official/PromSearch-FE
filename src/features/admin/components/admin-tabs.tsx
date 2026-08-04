"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * 어드민 목록 상단 탭(시안 551:3678 / 1587:9395).
 * 선택 상태는 URL 쿼리(`tab`)가 소유하므로 controlled 로만 쓴다.
 */
export function AdminTabs<Tab extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: readonly { value: Tab; label: string }[];
  value: Tab;
  onChange: (value: Tab) => void;
  /** 스크린리더용 탭 목록 이름 */
  label: string;
}) {
  return (
    <Tabs value={value} onValueChange={(next) => onChange(next as Tab)} className="w-full">
      <TabsList aria-label={label} className="w-fit">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

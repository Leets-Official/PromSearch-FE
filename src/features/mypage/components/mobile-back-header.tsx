"use client";

import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

/** 모바일 전용 상단 뒤로가기 헤더 (sm 미만에서만 노출) */
export function MobileBackHeader() {
  const router = useRouter();
  return (
    <div className="flex h-14 items-center px-2">
      <Button variant="plain" size="icon-sm" aria-label="뒤로 가기" onClick={() => router.back()}>
        <ChevronLeftIcon />
      </Button>
    </div>
  );
}

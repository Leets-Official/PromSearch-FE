import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * 디자인 시스템 "스펙 시트" 갤러리 프리미티브.
 * Figma 컴포넌트 시트(각 컴포넌트를 상태별로 나열한 판)를 코드로 재현하기 위한 래퍼들.
 * - SpecSection : 좌상단 라벨 칩 + 회색 컨테이너 (Figma의 섹션 프레임)
 * - SpecGroup   : 점선 테두리 그룹 (한 컴포넌트의 상태/변형 묶음)
 * - SpecCell    : 상태 라벨이 붙은 개별 셀
 */

export function SpecSection({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <span className="inline-flex rounded-md border border-stroke-secondary bg-bg-elevated px-3 py-1.5 text-title-3 text-text-primary">
        {label}
      </span>
      <div className="space-y-8 rounded-2xl border border-stroke-secondary bg-bg-secondary/40 p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

export function SpecGroup({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="space-y-2">
      {title && <p className="text-caption-1 text-text-disabled">{title}</p>}
      <div
        className={cn(
          "flex flex-wrap items-start gap-x-6 gap-y-5 rounded-lg border border-dashed border-brand/40 p-5",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function SpecCell({
  label,
  children,
  className,
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="flex min-h-11 items-center justify-center">{children}</div>
      {label && <span className="text-caption-1 text-text-disabled">{label}</span>}
    </div>
  );
}

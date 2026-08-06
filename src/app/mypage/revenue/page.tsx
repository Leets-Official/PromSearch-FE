import type { ReactNode } from "react";
import { HelpIcon } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MOCK_REVENUE } from "@/mocks/data/mypage";
import { SALES_CANDIDATE_TOOLTIP } from "@/features/mypage/constants/revenue";

function StatCard({
  label,
  value,
  unit,
  hint,
  className,
}: {
  label: string;
  value: number;
  unit: string;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("gap-6", className)}>
      <div className="flex items-center gap-1">
        <span className="text-body-2 text-text-secondary">{label}</span>
        {hint && (
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  aria-label={`${label} 설명`}
                  className="flex items-center justify-center rounded-full text-text-disabled transition-colors hover:text-text-secondary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <HelpIcon className="size-4" />
                </button>
              }
            />
            <TooltipContent>{hint}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <span className="text-display-2 text-text-primary">
        {value.toLocaleString()}
        <span className="ml-1 text-body-2 text-text-secondary">{unit}</span>
      </span>
    </Card>
  );
}

export default function RevenuePage() {
  const revenue = MOCK_REVENUE;

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-16">
        <section className="flex flex-col gap-4">
          <h1 className="text-heading-1 text-text-primary">수익</h1>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <StatCard label="이번 달 수익" value={revenue.monthly} unit="P" />
            <StatCard label="누적 수익" value={revenue.total} unit="P" />
            {/* 모바일 2열에서 혼자 남는 항목 → 가로 꽉 (lg 3열에선 1칸 복원) */}
            <StatCard
              label="판매 후보 지표"
              value={revenue.salesCandidate}
              unit="회"
              className="col-span-2 lg:col-span-1"
              hint={
                <>
                  {SALES_CANDIDATE_TOOLTIP.title}
                  <br />
                  {SALES_CANDIDATE_TOOLTIP.description}
                </>
              }
            />
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-heading-1 text-text-primary">게시글 인사이트</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <StatCard label="누적 조회수" value={revenue.views} unit="회" />
            <StatCard label="누적 추천 수" value={revenue.likes} unit="회" />
            {/* 모바일 2열에서 혼자 남는 항목 → 가로 꽉 */}
            <StatCard
              label="누적 복사 수"
              value={revenue.copies}
              unit="회"
              className="col-span-2 lg:col-span-1"
            />
          </div>
        </section>
      </div>
    </TooltipProvider>
  );
}

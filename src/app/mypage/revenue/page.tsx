import type { ReactNode } from "react";
import { HelpCircleIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MOCK_REVENUE } from "@/mocks/data/mypage";

function StatCard({
  label,
  value,
  unit,
  hint,
}: {
  label: string;
  value: number;
  unit: string;
  hint?: ReactNode;
}) {
  return (
    <Card className="gap-6">
      <div className="flex items-center gap-1">
        <span className="text-title-3 text-text-secondary">{label}</span>
        {hint && (
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  aria-label={`${label} 설명`}
                  className="flex items-center justify-center rounded-full text-text-disabled transition-colors hover:text-text-secondary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <HelpCircleIcon className="size-4" />
                </button>
              }
            />
            <TooltipContent>{hint}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <span className="text-heading-1 text-text-primary">
        {value.toLocaleString()}
        <span className="ml-1 text-title-2 text-text-secondary">{unit}</span>
      </span>
    </Card>
  );
}

export default function RevenuePage() {
  const revenue = MOCK_REVENUE;

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-10">
        <section className="flex flex-col gap-4">
          <h1 className="text-heading-2 text-text-primary">수익</h1>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <StatCard label="이번 달 수익" value={revenue.monthly} unit="P" />
            <StatCard label="누적 수익" value={revenue.total} unit="P" />
            <StatCard
              label="판매 후보 지표"
              value={revenue.salesCandidate}
              unit="회"
              hint={
                <span>
                  판매 후보 지표란?
                  <br />
                  설명설명설명. 설명설명
                </span>
              }
            />
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-heading-2 text-text-primary">게시글 인사이트</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <StatCard label="누적 조회수" value={revenue.views} unit="회" />
            <StatCard label="누적 추천 수" value={revenue.likes} unit="회" />
            <StatCard label="누적 복사 수" value={revenue.copies} unit="회" />
          </div>
        </section>
      </div>
    </TooltipProvider>
  );
}

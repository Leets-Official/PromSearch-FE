"use client";

import { useParams } from "next/navigation";

import { MobilePageHeader } from "@/components/layout/mobile-page-header";
import { PromptNotFoundError } from "@/features/prompt-detail/api/prompt-detail";
import {
  DetailError,
  DetailNotFound,
  DetailSkeleton,
} from "@/features/prompt-detail/components/detail-states";
import { PromptDetailView } from "@/features/prompt-detail/components/prompt-detail-view";
import { usePromptDetail } from "@/features/prompt-detail/hooks/use-prompt-detail";

export default function PromptDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data, isPending, isError, error, refetch } = usePromptDetail(id);

  // 로딩/에러 상태에서도 모바일에는 뒤로가기 헤더가 필요하다
  // (상단바는 sm 미만에서 숨김, 본문 성공 상태는 PromptDetailView 가 액션까지 포함해 직접 렌더).
  if (isError) {
    return (
      <>
        <MobilePageHeader />
        {error instanceof PromptNotFoundError ? (
          <DetailNotFound />
        ) : (
          <DetailError onRetry={() => void refetch()} />
        )}
      </>
    );
  }

  if (isPending) {
    return (
      <>
        <MobilePageHeader />
        <DetailSkeleton />
      </>
    );
  }

  return <PromptDetailView detail={data} />;
}

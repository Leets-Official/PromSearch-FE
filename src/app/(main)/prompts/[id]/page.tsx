"use client";

import { useParams } from "next/navigation";

import { PromptNotFoundError } from "@/features/prompt-detail/api/prompt-detail";
import {
  DetailError,
  DetailNotFound,
  DetailSkeleton,
} from "@/features/prompt-detail/components/DetailStates";
import { PromptDetailView } from "@/features/prompt-detail/components/PromptDetailView";
import { usePromptDetail } from "@/features/prompt-detail/hooks/use-prompt-detail";

export default function PromptDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data, isPending, isError, error, refetch } = usePromptDetail(id);

  if (isError) {
    return error instanceof PromptNotFoundError ? (
      <DetailNotFound />
    ) : (
      <DetailError onRetry={() => void refetch()} />
    );
  }

  if (isPending) {
    return <DetailSkeleton />;
  }

  return <PromptDetailView detail={data} />;
}

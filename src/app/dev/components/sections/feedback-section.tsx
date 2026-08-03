import { Spinner } from "@/components/ui/spinner";

import { SpecCell, SpecGroup, SpecSection } from "./spec";

/**
 * Spinner — 로딩 표시. (Badge=Tag 는 Data Display, 아이콘은 Icon 섹션 참고)
 */
export function FeedbackSection() {
  return (
    <SpecSection id="feedback-spinner" label="Spinner">
      <SpecGroup title="size · color">
        <SpecCell label="16">
          <Spinner />
        </SpecCell>
        <SpecCell label="24">
          <Spinner className="size-6" />
        </SpecCell>
        <SpecCell label="32 · brand">
          <Spinner className="size-8 text-text-brand" />
        </SpecCell>
      </SpecGroup>
    </SpecSection>
  );
}

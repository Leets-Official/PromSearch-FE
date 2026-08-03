import { Spinner } from "@/components/ui/spinner";

import { SpecCell, SpecGroup, SpecSection } from "./spec";

/**
 * Spinner — 로딩 표시(디자이너 Lottie). 색은 JSON 에 브랜드로 박혀 있어 크기만 조절한다.
 * (Badge=Tag 는 Data Display, 아이콘은 Icon 섹션 참고)
 */
export function FeedbackSection() {
  return (
    <SpecSection id="feedback-spinner" label="Spinner">
      <SpecGroup title="size">
        <SpecCell label="h-16">
          <Spinner />
        </SpecCell>
        <SpecCell label="h-24">
          <Spinner className="h-6 w-20" />
        </SpecCell>
        <SpecCell label="h-32">
          <Spinner className="h-8 w-26" />
        </SpecCell>
      </SpecGroup>
    </SpecSection>
  );
}

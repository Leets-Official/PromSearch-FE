import type { UserStatus } from "@/analytics/events";
import type { PromptSummary } from "@/features/gallery/types";

import { GalleryCard } from "./gallery-card";
import { GalleryEmpty } from "./gallery-states";

type GalleryGridProps = {
  prompts: PromptSummary[];
  /** 인증 상태(analytics user_status) */
  userStatus: UserStatus;
  /** 빈 결과 시 필터 초기화 콜백 */
  onResetFilters?: () => void;
};

/**
 * 프롬프트 카드 그리드.
 * - 결과가 있으면 3열(반응형) 그리드로 렌더
 * - 결과가 없으면 빈 상태를 노출
 */
export function GalleryGrid({ prompts, userStatus, onResetFilters }: GalleryGridProps) {
  if (prompts.length === 0) {
    return <GalleryEmpty onReset={onResetFilters} />;
  }

  return (
    <ul data-slot="gallery-grid" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {prompts.map((prompt, index) => (
        <li key={prompt.id}>
          <GalleryCard prompt={prompt} position={index + 1} userStatus={userStatus} />
        </li>
      ))}
    </ul>
  );
}

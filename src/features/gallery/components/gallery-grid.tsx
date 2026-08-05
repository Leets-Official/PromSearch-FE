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
    /*
      간격 (디자인 QA 반영):
      - 모바일 1열 — 카드 사이 24px (세로만 의미 있다)
      - sm+ 2·3열  — 가로 8px / 세로 24px. 가로를 좁게 두는 이유는 카드가 이미
        좌우 8px 패딩(PromptCard 의 히트영역)을 갖고 있어, 8 + 8 + 8 = 24px 로
        보이기 때문이다. 여기에 24를 주면 실제로는 40px 로 벌어진다.
    */
    <ul
      data-slot="gallery-grid"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-x-2 sm:gap-y-6 lg:grid-cols-3"
    >
      {prompts.map((prompt, index) => (
        <li key={prompt.id}>
          <GalleryCard prompt={prompt} position={index + 1} userStatus={userStatus} />
        </li>
      ))}
    </ul>
  );
}

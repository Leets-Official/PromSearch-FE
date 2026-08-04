import Link from "next/link";

import { PencilIcon } from "@/components/ui/icons";

/**
 * 모바일 업로드 진입 버튼(우하단 플로팅).
 *
 * 모바일 시안의 홈 헤더는 [햄버거+로고] / [알림·검색] 로 이미 채워져 있어 업로드 자리가 없다.
 * 데스크톱 상단바에는 "업로드" 버튼이 상시 노출되므로, 모바일에서는 주 액션을
 * 엄지가 닿는 우하단 플로팅 버튼으로 제공한다.
 *
 * 디자인 시스템 매핑(신규 컴포넌트가 아니라 기존 토큰 조합):
 * - 색      : Interaction/Brand default·hover·pressed (Button/Brand 와 동일 규칙)
 * - 아이콘  : 데스크톱 업로드 버튼과 같은 PencilIcon 24px, Text/on-brand
 * - 크기    : 56px 원형(Radius/full) — 상세의 유틸 플로팅(44px·dim)보다 한 단계 크게 두어
 *             "주 액션 = brand·56 / 보조 액션 = dim·44" 로 위계를 나눈다.
 * - 그림자  : Interaction drop-shadow(0 4px 8px, gray-900 13%)
 * - 위치    : 우·하 16px + 하단 안전영역
 */
export function UploadFab() {
  return (
    <Link
      href="/upload"
      aria-label="프롬프트 업로드"
      className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 flex size-14 items-center justify-center rounded-full bg-interaction-brand text-text-on-brand shadow-[0_4px_8px_rgb(35_35_33/0.13)] transition-colors outline-none hover:bg-interaction-brand-hover focus-visible:ring-3 focus-visible:ring-ring/50 active:bg-interaction-brand-pressed sm:hidden"
    >
      <PencilIcon className="size-6" />
    </Link>
  );
}

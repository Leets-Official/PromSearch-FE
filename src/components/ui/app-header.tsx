import { cn } from "@/lib/utils";

import { Logo } from "@/components/ui/logo";

/**
 * 상단 헤더 바 (Figma Header 340:2585 기준).
 *
 * 레이아웃/치수(시안):
 * - 높이 80px, 상하 패딩 16px(= py-4), 배경 bg-bg-primary
 * - 하단 구분선 없음(시안 기준)
 * - [좌] 로고 · [중앙] 검색/네비 등 유연 영역 · [우] 알림/프로필 등 액션 영역
 *
 * 실제 항목(검색바·업로드·알림·프로필)은 프로젝트마다 달라질 수 있어
 * center/end 슬롯 props 와 children 으로 유연하게 주입받습니다.
 * children 을 넘기면 좌/중/우 3분할 레이아웃 대신 그대로 렌더합니다.
 */
type AppHeaderProps = React.ComponentProps<"header"> & {
  /** 좌측 영역. 미지정 시 기본 로고(horizontal) 렌더 */
  start?: React.ReactNode;
  /** 중앙 유연 영역 (검색바·네비 등). flex-1 로 확장 */
  center?: React.ReactNode;
  /** 우측 액션 영역 (알림·프로필 등) */
  end?: React.ReactNode;
};

function AppHeader({ className, start, center, end, children, ...props }: AppHeaderProps) {
  return (
    <header
      data-slot="app-header"
      className={cn(
        // 높이 80 · 상하 패딩 16 · 배경 primary (하단 구분선 없음)
        "flex h-20 w-full items-center gap-8 bg-bg-primary px-6 py-4",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          {/* 좌측: 로고 (기본형 = 가로 로고) */}
          <div className="flex shrink-0 items-center">{start ?? <Logo variant="horizontal" />}</div>

          {/* 중앙: 검색/네비 등 유연 영역 */}
          {center != null && <div className="flex min-w-0 flex-1 items-center gap-6">{center}</div>}

          {/* 우측: 알림/프로필 등 액션 */}
          {end != null && <div className="ml-auto flex shrink-0 items-center gap-2">{end}</div>}
        </>
      )}
    </header>
  );
}

export { AppHeader };

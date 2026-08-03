import { cn } from "@/lib/utils";

import { Logo } from "@/components/ui/logo";

/**
 * 상단 헤더 바 (Figma Header 340:2585 기준).
 *
 * 레이아웃/치수(시안):
 * - desktop(340:2585): 높이 80px, 상하 패딩 16px(= py-4), 배경 bg-bg-primary(불투명)
 * - mobile(Header/mobile/* 1214:5885 · 1233:6473 · 1378:5042):
 *   높이 56px, 상하 패딩 12px, 배경 bg-bg-primary/80 + backdrop-blur 6px
 * - 하단 구분선 없음(시안 기준)
 * - [좌] 로고 · [중앙] 검색/네비 등 유연 영역 · [우] 알림/프로필 등 액션 영역
 *
 * 모바일 시안 3종(home / page / search)은 컨테이너는 같고 **채우는 내용만** 다르므로
 * 별도 컴포넌트를 만들지 않고 start/center/end 슬롯 조합으로 구성한다.
 * - home  : start=[메뉴 + 로고]        end=[알림, 검색]
 * - page  : start=[뒤로가기]            end=[좋아요, 북마크, 신고]
 * - search: start=[뒤로가기]            center=[검색바]
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
        "flex w-full items-center",
        // mobile: 높이 56 · 상하 패딩 12 · 반투명 배경 + blur
        "h-14 gap-3 bg-bg-primary/80 px-4 py-3 backdrop-blur-[6px]",
        // desktop: 높이 80 · 상하 패딩 16 · 불투명 배경 (하단 구분선 없음)
        "sm:h-20 sm:gap-8 sm:bg-bg-primary sm:px-6 sm:py-4 sm:backdrop-blur-none",
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

          {/* 우측: 알림/프로필 등 액션 — 모바일 시안은 아이콘 간격 24px, 데스크톱은 8px */}
          {end != null && (
            <div className="ml-auto flex shrink-0 items-center gap-6 sm:gap-2">{end}</div>
          )}
        </>
      )}
    </header>
  );
}

export { AppHeader };

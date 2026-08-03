"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";

import { cn } from "@/lib/utils";

/**
 * 캐러셀 네비게이션 — Figma Table/Carousel Navigation(1006:2985, 114x36).
 *
 * "현재/전체" 카운터 + 이전/다음 버튼이 한 알약에 묶인 형태.
 * 이미지 위에 얹히는 컨트롤이라 배경이 Opacity/dim, 텍스트·아이콘은 흰색이다.
 * - 컨테이너: radius/md(8px), pl 12 / pr 6 / py 6, gap 8
 * - 카운터  : Body 2(16/20 Medium), Text/on-brand
 * - 버튼    : 24px 아이콘 2개가 간격 없이 붙어 있음
 *
 * 데스크톱 전용/모바일 전용 구분이 없는 단일 시안이라 반응형 분기가 없다.
 */
type CarouselNavigationProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  /** 현재 인덱스 (1-base) */
  page: number;
  /** 전체 개수 */
  total: number;
  /** 이동 콜백 — 범위를 벗어나는 요청은 컴포넌트가 막는다 */
  onPageChange?: (page: number) => void;
};

function CarouselNavigation({
  className,
  page,
  total,
  onPageChange,
  ...props
}: CarouselNavigationProps) {
  const goTo = (next: number) => {
    if (next < 1 || next > total || next === page) return;
    onPageChange?.(next);
  };

  return (
    <div
      data-slot="carousel-navigation"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md bg-dim py-1.5 pr-1.5 pl-3",
        className,
      )}
      {...props}
    >
      <span className="flex items-center gap-1 text-body-2 leading-5 whitespace-nowrap text-text-on-brand">
        {/* 스크린리더에는 "10개 중 1번째" 로 읽히도록 */}
        <span className="sr-only">{`${total}개 중 ${page}번째`}</span>
        <span aria-hidden>{page}</span>
        <span aria-hidden>/</span>
        <span aria-hidden>{total}</span>
      </span>

      <div className="flex items-center">
        <CarouselNavigationButton
          aria-label="이전"
          disabled={page <= 1}
          onClick={() => goTo(page - 1)}
        >
          <ChevronLeftIcon />
        </CarouselNavigationButton>
        <CarouselNavigationButton
          aria-label="다음"
          disabled={page >= total}
          onClick={() => goTo(page + 1)}
        >
          <ChevronRightIcon />
        </CarouselNavigationButton>
      </div>
    </div>
  );
}

function CarouselNavigationButton({ className, ...props }: ButtonPrimitive.Props) {
  return (
    <ButtonPrimitive
      data-slot="carousel-navigation-button"
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-sm text-text-on-brand transition-opacity outline-none select-none",
        "hover:opacity-70 focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-40",
        "[&_svg]:pointer-events-none [&_svg]:size-6 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

export { CarouselNavigation };
export type { CarouselNavigationProps };

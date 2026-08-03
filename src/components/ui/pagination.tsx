"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Pagination — 페이지 번호 + 이전/다음 이동 컨트롤.
 *
 * Figma 시안(412:1906) 기준:
 * - 버튼 1칸: 36x36 정사각, radius 4px(Radius/xs), 내부 padding 10px
 * - 번호 타이포: Title 2 (Pretendard SemiBold 16/20)
 * - default    : 배경 없음(bg/primary), 텍스트 text/secondary
 * - selected   : bg interaction/neutral/selected(red-400 25%) + border stroke/brand + 텍스트 text/brand
 * - icon 버튼  : lucide Chevron 화살표(20px)
 *
 * 사용은 controlled 단일 컴포넌트(page/pageCount/onPageChange) + 조립용 서브파트 export 조합.
 */

// 버튼 1칸 공통 스타일. selected/default 상태는 cva variant로, pressed/hover는 CSS 상태로 매핑.
const paginationButtonVariants = cva(
  // 모바일(Pagination/Button(Mobile) 1206:3243)은 24x24 · radius/sm(6px) · Title 3(14/20),
  // sm 이상에서 시안 데스크톱 값(36x36 · radius 4px · Title 2)으로 전환. 아이콘은 20px 공통.
  "inline-flex size-6 shrink-0 items-center justify-center rounded-sm border border-transparent text-title-3 outline-none transition-all select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:text-text-disabled sm:size-9 sm:rounded-[4px] sm:text-title-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      isActive: {
        // selected: 브랜드 채움 + 브랜드 보더 + 브랜드 텍스트
        true: "border-stroke-brand bg-interaction-neutral-selected text-text-brand",
        // default: 무채색 텍스트. hover 는 투명 배경 위라 흰색(neutral-hover)이면 안 보여서
        // 회색(bg-secondary) 으로 노출, pressed 는 gray-300.
        false: "text-text-secondary hover:bg-bg-secondary active:bg-interaction-neutral-pressed",
      },
    },
    defaultVariants: {
      isActive: false,
    },
  },
);

// 루트: 접근성을 위해 <nav>로 감싼다.
function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="페이지네이션"
      data-slot="pagination"
      className={cn("mx-auto flex w-fit justify-center", className)}
      {...props}
    />
  );
}

// 아이템 목록 컨테이너 — gap 4px(spacing/component/xs).
function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & React.ComponentProps<typeof ButtonPrimitive> &
  VariantProps<typeof paginationButtonVariants>;

// 번호 버튼. 현재 페이지는 aria-current="page"로 표기.
function PaginationLink({ className, isActive, ...props }: PaginationLinkProps) {
  return (
    <ButtonPrimitive
      data-slot="pagination-link"
      data-active={isActive}
      aria-current={isActive ? "page" : undefined}
      className={cn(paginationButtonVariants({ isActive }), className)}
      {...props}
    />
  );
}

// 이전 페이지 이동 버튼(아이콘).
function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof ButtonPrimitive>) {
  return (
    <ButtonPrimitive
      data-slot="pagination-previous"
      aria-label="이전 페이지"
      className={cn(paginationButtonVariants({ isActive: false }), className)}
      {...props}
    >
      <ChevronLeftIcon />
    </ButtonPrimitive>
  );
}

// 다음 페이지 이동 버튼(아이콘).
function PaginationNext({ className, ...props }: React.ComponentProps<typeof ButtonPrimitive>) {
  return (
    <ButtonPrimitive
      data-slot="pagination-next"
      aria-label="다음 페이지"
      className={cn(paginationButtonVariants({ isActive: false }), className)}
      {...props}
    >
      <ChevronRightIcon />
    </ButtonPrimitive>
  );
}

// 말줄임 표시(…). 클릭 대상이 아니므로 aria-hidden.
function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="pagination-ellipsis"
      aria-hidden
      className={cn(
        "flex size-6 items-center justify-center text-text-secondary sm:size-9 [&_svg]:size-5",
        className,
      )}
      {...props}
    >
      <MoreHorizontalIcon />
      <span className="sr-only">더 많은 페이지</span>
    </span>
  );
}

/**
 * 표시할 페이지 번호 배열을 계산한다.
 * - 항상 첫/끝 페이지 노출, 현재 페이지 주변 siblingCount 개 노출
 * - 사이 간격이 벌어지면 "ellipsis"(말줄임) 토큰 삽입
 */
type PageToken = number | "ellipsis";

function getPageTokens(page: number, pageCount: number, siblingCount = 1): PageToken[] {
  // 첫/끝 + 현재 주변 + 양쪽 말줄임 2칸까지 다 보이면 전부 나열
  const totalSlots = siblingCount * 2 + 5;
  if (pageCount <= totalSlots) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(page - siblingCount, 1);
  const rightSibling = Math.min(page + siblingCount, pageCount);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < pageCount - 1;

  const tokens: PageToken[] = [1];
  if (showLeftEllipsis) {
    tokens.push("ellipsis");
  } else {
    // 말줄임이 없으면 2..leftSibling 사이를 채운다
    for (let i = 2; i < leftSibling; i++) tokens.push(i);
  }

  for (let i = leftSibling; i <= rightSibling; i++) {
    if (i !== 1 && i !== pageCount) tokens.push(i);
  }

  if (showRightEllipsis) {
    tokens.push("ellipsis");
  } else {
    for (let i = rightSibling + 1; i < pageCount; i++) tokens.push(i);
  }

  tokens.push(pageCount);
  return tokens;
}

type PaginationRootProps = {
  /** 현재 페이지 (1-base) */
  page: number;
  /** 전체 페이지 수 */
  pageCount: number;
  /** 페이지 변경 콜백 */
  onPageChange?: (page: number) => void;
  /** 현재 페이지 좌우로 노출할 형제 개수 (기본 1) */
  siblingCount?: number;
  className?: string;
};

/**
 * controlled Pagination. page/pageCount를 받아 번호 + 이전/다음 버튼을 렌더링한다.
 * 세밀한 커스터마이징이 필요하면 위 서브파트로 직접 조립 가능.
 */
function PaginationRoot({
  page,
  pageCount,
  onPageChange,
  siblingCount = 1,
  className,
}: PaginationRootProps) {
  const tokens = React.useMemo(
    () => getPageTokens(page, pageCount, siblingCount),
    [page, pageCount, siblingCount],
  );

  const goTo = (next: number) => {
    if (next < 1 || next > pageCount || next === page) return;
    onPageChange?.(next);
  };

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious disabled={page <= 1} onClick={() => goTo(page - 1)} />
        </PaginationItem>

        {tokens.map((token, index) =>
          token === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={token}>
              <PaginationLink
                isActive={token === page}
                aria-label={`${token} 페이지`}
                onClick={() => goTo(token)}
              >
                {token}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext disabled={page >= pageCount} onClick={() => goTo(page + 1)} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationRoot,
  paginationButtonVariants,
  getPageTokens,
};

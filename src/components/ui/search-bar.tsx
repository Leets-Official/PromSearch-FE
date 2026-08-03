import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { SearchIcon } from "@/components/ui/icons";

import { cn } from "@/lib/utils";

/**
 * Search Bar (Figma 238:296)
 * - 좌측 검색 아이콘 + 인풋을 감싼 래퍼. 기본 폭 348px, 높이 48px(h-12), radius 8px(rounded-md).
 * - 상태별 border(시맨틱 토큰 매핑, focus-within 으로 내부 인풋 포커스 반영):
 *   · default → stroke-disabled(gray-400)
 *   · hover / active(focus) → stroke-strong(black), focus 시 Interaction 그림자
 *   · filled → 값이 있으면 검은 테두리 유지(시안). 별도 상태 표현 없이 hover/focus 규칙으로 충분.
 *   · disabled → bg-disabled(gray-200) + stroke-disabled
 * - 아이콘/placeholder는 text-disabled, 입력값은 text-primary.
 * - controlled/uncontrolled 모두 지원: native input props 를 그대로 전달한다.
 * - 라이트 온리 프로젝트라 dark:* 미사용.
 */
function SearchBar({ className, disabled, ...props }: React.ComponentProps<"input">) {
  return (
    <div
      data-slot="search-bar"
      data-disabled={disabled ? "" : undefined}
      className={cn(
        // 형태 · 치수 · 레이아웃 (아이콘과 인풋을 가로 정렬)
        "flex h-12 w-full max-w-87 items-center gap-3 rounded-md border px-4 transition-colors",
        // 색: 기본 배경 primary + gray-400 테두리
        "border-stroke-disabled bg-bg-primary text-text-primary",
        // hover / focus(active): 테두리 강조 + 포커스 그림자
        "focus-within:border-stroke-strong focus-within:shadow-[0px_4px_8px_rgba(35,35,33,0.13)] hover:border-stroke-strong",
        // disabled: 배경/테두리 disabled + 상호작용 차단
        "data-disabled:pointer-events-none data-disabled:border-stroke-disabled data-disabled:bg-bg-disabled data-disabled:text-text-disabled",
        className,
      )}
    >
      {/* 검색 아이콘 — placeholder 대비 톤을 맞추기 위해 disabled 색 사용 */}
      <SearchIcon className="size-6 shrink-0 text-text-disabled" aria-hidden="true" />
      <InputPrimitive
        type="search"
        disabled={disabled}
        className={cn(
          // 인풋 본체: 래퍼가 테두리/배경을 담당하므로 투명 + 테두리 없음
          // 검색창 텍스트는 16/24 (body-1 이 16/28 로 바뀌어 leading-6 으로 행간만 24 고정)
          "h-full w-full min-w-0 border-0 bg-transparent text-body-1 leading-6 outline-none",
          "text-text-primary placeholder:text-text-disabled",
          "disabled:cursor-not-allowed",
        )}
        {...props}
      />
    </div>
  );
}

export { SearchBar };

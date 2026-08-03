import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * 시맨틱 HTML <table> 기반 조립 컴포넌트 모음.
 * 디자인 시스템 시안(Figma Table 410:9997)을 따릅니다.
 * - header/cell 높이: 48px
 * - 경계선: stroke-secondary (gray-100)
 * - 헤더: bg-brand-tint(Opacity/brand, red-500/10%) + text-primary + Title 2 타이포
 * - 셀: text-secondary + Body 1 타이포
 * - 공통 패딩: px-16(Spacing/Component/xl) / py-12(Spacing/Component/lg)
 * 각 파트에 data-slot 부여, 테이블은 가로 스크롤 컨테이너로 감쌉니다.
 */

// 가로 스크롤 래퍼 + <table>. 넓은 표가 레이아웃을 밀지 않도록 overflow-x-auto 로 감쌉니다.
function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom border-collapse text-body-1", className)}
        {...props}
      />
    </div>
  );
}

// 헤더 영역 <thead>. 하단 경계선으로 본문과 구분합니다.
function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b [&_tr]:border-stroke-secondary", className)}
      {...props}
    />
  );
}

// 본문 영역 <tbody>. 마지막 행의 경계선은 제거해 하단을 깔끔하게 처리합니다.
function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

// 행 <tr>. 하단 경계선 + hover 시 옅은 배경 강조(interaction-neutral-selected, red-400/25%).
function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-stroke-secondary transition-colors hover:bg-interaction-neutral-selected data-selected:bg-interaction-neutral-selected",
        className,
      )}
      {...props}
    />
  );
}

// 헤더 셀 <th>. 높이 48 · 헤더 배경(brand-tint) · text-primary · Title 2 타이포.
function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-12 bg-brand-tint px-4 py-3 text-left align-middle text-title-2 whitespace-nowrap text-text-primary has-[[role=checkbox]]:pr-0",
        className,
      )}
      {...props}
    />
  );
}

// 본문 셀 <td>. 높이 48 · text-secondary · Body 1 타이포.
function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "h-12 px-4 py-3 align-middle text-body-1 whitespace-nowrap text-text-secondary has-[[role=checkbox]]:pr-0",
        className,
      )}
      {...props}
    />
  );
}

// 표 설명 <caption>. 표 하단에 보조 텍스트로 배치합니다.
function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-caption-1 text-text-secondary", className)}
      {...props}
    />
  );
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption };

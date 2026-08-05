"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * 어드민 표 공통 파트.
 *
 * 디자인 시스템 `ui/table` 을 그대로 쓰되 어드민 시안(551:3682)에 맞게 세 가지를 조정한다.
 * - 헤더 배경: brand-tint → background/secondary(#f2f2f2), 헤더 하단 구분선 없음
 * - 행 구분선/hover 강조 없음(시안에 라인이 없고 행 자체는 클릭 대상이 아니다)
 * - 셀 패딩/타이포: 데스크톱 시안값(px-16·py-12·16px), 좁은 폭에서는 한 단계 축소
 *
 * 반응형 원칙(모바일·태블릿 시안 없음):
 * 표는 `ui/table` 의 가로 스크롤 컨테이너 안에서만 넘치고, **셀 텍스트는 절대 줄바꿈하지 않는다**
 * (`whitespace-nowrap` + 필요 시 말줄임). 행 높이가 세로로 늘어나지 않아 목록 스캔이 유지된다.
 */

/** 표 루트 — 가로 스크롤은 ui/table 의 컨테이너가 담당한다 */
function AdminTable({ className, ...props }: React.ComponentProps<typeof Table>) {
  return <Table className={cn("min-w-max", className)} {...props} />;
}

/** 헤더 영역 — 시안엔 헤더 하단 구분선이 없다(배경색으로 구분) */
function AdminTableHeader({ className, ...props }: React.ComponentProps<typeof TableHeader>) {
  return <TableHeader className={cn("[&_tr]:border-0", className)} {...props} />;
}

const AdminTableBody = TableBody;

/** 행 — 시안엔 구분선/hover 강조가 없다 */
function AdminTableRow({ className, ...props }: React.ComponentProps<typeof TableRow>) {
  return <TableRow className={cn("border-0 hover:bg-transparent", className)} {...props} />;
}

/** 헤더 셀 — 회색 배경 + Title 2 (좁은 폭에서 14px 로 줄어드는 건 전역 모바일 스케일이 처리) */
function AdminTableHead({ className, ...props }: React.ComponentProps<typeof TableHead>) {
  return (
    <TableHead className={cn("bg-bg-secondary px-3 text-title-2 sm:px-4", className)} {...props} />
  );
}

/** 본문 셀 — Body 2 · text/secondary */
function AdminTableCell({ className, ...props }: React.ComponentProps<typeof TableCell>) {
  return <TableCell className={cn("px-3 text-body-2 sm:px-4", className)} {...props} />;
}

/**
 * 액션 컬럼(맨 오른쪽 [숨김][유지] / [승인])은 **항상 오른쪽 끝에 붙여 고정**한다.
 *
 * 시안처럼 액션이 한눈에 들어와야 하는데, 좁은 화면에서 표가 가로 스크롤되면 액션이 화면
 * 밖으로 밀려 "가로로 끝까지 스크롤해야 처리할 수 있는" 상태가 된다. sticky 로 고정하고
 * 불투명 배경 + 좌측 경계선을 줘서 본문이 그 아래로 지나가게 한다.
 * (헤더/본문 배경이 다르므로 셀 종류별로 배경을 맞춘다)
 */
// 시안엔 구분선이 없으므로 경계선 대신 아주 옅은 그림자만 둔다(스크롤 시에만 눈에 띈다).
const STICKY_ACTION =
  "sticky right-0 z-10 w-px text-right whitespace-nowrap shadow-[-8px_0_8px_-8px_rgb(35_35_33/0.12)]";

/** 액션 컬럼 헤더 — 시안엔 라벨이 없어 스크린리더용 텍스트만 둔다 */
function AdminTableActionHead({ className, children, ...props }: React.ComponentProps<"th">) {
  return (
    <AdminTableHead className={cn(STICKY_ACTION, "bg-bg-secondary", className)} {...props}>
      <span className="sr-only">{children ?? "처리"}</span>
    </AdminTableHead>
  );
}

/** 액션 컬럼 본문 셀 */
function AdminTableActionCell({ className, children, ...props }: React.ComponentProps<"td">) {
  return (
    <AdminTableCell className={cn(STICKY_ACTION, "bg-bg-primary", className)} {...props}>
      <div className="flex items-center justify-end gap-1">{children}</div>
    </AdminTableCell>
  );
}

/**
 * 길어질 수 있는 텍스트 셀(제목·댓글 내용·신고 사유).
 * 줄바꿈 없이 최대 폭까지만 차지하고 넘치면 말줄임 — 표가 무한정 넓어지는 것도 막는다.
 * 전체 문구는 `title` 속성으로 확인할 수 있다.
 */
function AdminTableTruncatedCell({
  children,
  className,
  cellClassName,
  strong,
}: {
  children: string;
  /** 말줄임 폭 등 텍스트 래퍼에 얹을 클래스 */
  className?: string;
  cellClassName?: string;
  /** 제목처럼 강조되는 첫 컬럼 여부 */
  strong?: boolean;
}) {
  return (
    <AdminTableCell className={cellClassName}>
      <span
        title={children}
        className={cn(
          "block max-w-40 truncate sm:max-w-64 lg:max-w-80",
          strong && "text-title-2 text-text-primary",
          className,
        )}
      >
        {children}
      </span>
    </AdminTableCell>
  );
}

/**
 * 행 액션(숨김/유지/승인) — 시안은 배경 없는 텍스트 버튼이다.
 * `tone="brand"` 는 유저 등급의 [승인]처럼 브랜드 색 강조가 필요한 경우.
 */
function AdminRowAction({
  tone = "neutral",
  className,
  ...props
}: React.ComponentProps<typeof Button> & { tone?: "neutral" | "brand" }) {
  return (
    <Button
      variant="plain"
      size="sm"
      className={cn(
        "px-2 font-normal",
        tone === "brand" ? "text-text-brand" : "text-text-secondary",
        className,
      )}
      {...props}
    />
  );
}

/** 이미 적용된 상태 표시(예: 이미 "숨김" 처리된 행) — 버튼이 아니라 현재 상태 라벨이다 */
function AdminRowStatus({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-9 items-center px-2 text-title-3 text-text-brand">
      {children}
    </span>
  );
}

export {
  AdminRowAction,
  AdminRowStatus,
  AdminTable,
  AdminTableActionCell,
  AdminTableActionHead,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
  AdminTableTruncatedCell,
};

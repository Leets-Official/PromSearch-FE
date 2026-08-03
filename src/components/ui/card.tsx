import { cn } from "@/lib/utils";

/**
 * 범용 Card 컨테이너 + 조립 파트(shadcn 스타일 + 우리 디자인 토큰).
 *
 * Figma 참고:
 * - Card/Info(271:1322, 210x120), Card/Profile(271:1323, 470x120)
 * - 공통: 배경 Background/primary, 테두리 Stroke/primary, radius 8px(=rounded-md),
 *   패딩 px-20 / py-16 (Spacing/Component xxl=20, xl=16).
 *
 * 시안이 카드 배경으로 Background/primary(#fdfdfc)를 쓰지만,
 * 스펙상 "bg-bg-elevated" 를 기본으로 하고 필요 시 className 으로 덮어쓴다.
 * (elevated=white, primary=gray-50 — 둘 다 거의 흰색이라 시각차 미미)
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-4 rounded-md border border-stroke-primary bg-bg-elevated px-5 py-4 text-text-primary",
        className,
      )}
      {...props}
    />
  );
}

/** 카드 상단 영역 — 제목/설명/액션을 담는다. */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-header" className={cn("flex flex-col gap-1", className)} {...props} />
  );
}

/** 카드 제목 — Heading 2(text-heading-2) 톤. */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-heading-2 text-text-primary", className)}
      {...props}
    />
  );
}

/** 카드 보조 설명 — Body 1, 보조 텍스트 색. */
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-body-1 text-text-secondary", className)}
      {...props}
    />
  );
}

/** 카드 본문 영역. */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("flex flex-col", className)} {...props} />;
}

/** 카드 하단 영역 — 액션/메타 정보. */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-footer" className={cn("flex items-center", className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };

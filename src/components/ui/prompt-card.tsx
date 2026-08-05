import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Thumbnail } from "./thumbnail";

/**
 * 프롬프트 카드 — 제품 핵심 컴포넌트.
 *
 * Figma Card/Prompt(209:3690 default / 228:303 hover / 209:3861 pressed, 226x211):
 * - 구조: thumbnail(16:9) → 제목(Heading 2, 1줄 말줄임) → 태그 목록(Caption 1, brand-tint).
 * - 상태:
 *   default : 배경 없음.
 *   hover   : 살짝 떠오르는 느낌 → bg-bg-elevated + shadow.
 *   pressed : 눌린 느낌 → bg-bg-secondary(gray-100).
 * - 클릭 가능한 카드이므로 render prop 으로 <a>/<button> 등 다형성 지원(기본 div).
 *   상호작용을 카드 전체 영역에 주기 위해 패딩/음수마진으로 히트영역 확장.
 */

/** 태그 pill — brand-tint 배경 + brand 텍스트. Figma Tag(209:3694). */
function PromptCardTag({ label }: { label: string }) {
  return (
    <span
      data-slot="prompt-card-tag"
      className="inline-flex items-center justify-center rounded-[4px] bg-brand-tint px-2 py-1.5 text-caption-1 text-text-brand"
    >
      {label}
    </span>
  );
}

type PromptAuthor = {
  name: string;
  avatarSrc?: string;
};

type PromptCardProps = useRender.ComponentProps<"div"> & {
  /** 프롬프트 제목 */
  title: string;
  /** 태그 목록 */
  tags?: string[];
  /** 썸네일 이미지 URL */
  thumbnailSrc?: string;
  /**
   * 썸네일의 뷰포트별 표시 폭 힌트(`Thumbnail.sizes` 로 그대로 전달).
   * 기본값은 홈 갤러리 그리드 기준이라, **갤러리가 아닌 곳에 카드를 쓰면 반드시 넘긴다**
   * (안 넘기면 실제 표시 폭보다 큰 후보를 받아 대역폭을 낭비한다).
   */
  thumbnailSizes?: string;
  /**
   * 첫 화면에 보이는 카드면 `true` — 썸네일 지연 로딩을 끈다.
   * 홈 갤러리의 LCP 요소가 이 썸네일이라 상단 카드에만 켠다.
   */
  eagerThumbnail?: boolean;
  /** 썸네일 우하단 배지(선택) — 결과물타입 등 */
  badge?: React.ReactNode;
  /** 작성자 정보(선택) — 있으면 아바타+이름 노출 */
  author?: PromptAuthor;
};

function PromptCard({
  className,
  title,
  tags,
  thumbnailSrc,
  thumbnailSizes,
  eagerThumbnail,
  badge,
  author,
  render,
  ...props
}: PromptCardProps) {
  const content = (
    <>
      {/* 썸네일 16:9 (+ 우하단 결과물타입 배지) */}
      <div className="relative w-full">
        <Thumbnail src={thumbnailSrc} alt={title} sizes={thumbnailSizes} eager={eagerThumbnail} />
        {badge ? <div className="absolute right-2 bottom-2">{badge}</div> : null}
      </div>

      {/* 제목 + 작성자 — Figma 209:3690: [아바타 | 제목 / 작성자이름] */}
      <div data-slot="prompt-card-head" className="flex w-full items-start gap-2">
        {author ? (
          <Avatar size="sm" className="size-8 shrink-0 border border-stroke-primary">
            {author.avatarSrc ? <AvatarImage src={author.avatarSrc} alt={author.name} /> : null}
            <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
          </Avatar>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="w-full truncate text-title-1 text-text-primary">{title}</p>
          {author ? (
            <p className="w-full truncate text-caption-1 text-text-secondary">{author.name}</p>
          ) : null}
        </div>
      </div>

      {/* 태그 목록 */}
      {tags && tags.length > 0 ? (
        <div
          data-slot="prompt-card-tags"
          className="flex w-full flex-wrap content-center items-center gap-1.75"
        >
          {tags.map((tag) => (
            <PromptCardTag key={tag} label={tag} />
          ))}
        </div>
      ) : null}
    </>
  );

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: cn(
          // 레이아웃: 세로 스택, 시안 gap 16px
          "group/prompt-card flex w-full flex-col items-start gap-4",
          // 클릭 영역: 패딩 + 음수마진으로 컨텐츠 정렬 유지하며 히트영역 확보
          "cursor-pointer rounded-lg p-2 outline-none transition-all",
          // hover: 떠오름(elevated + shadow), pressed: 눌림(secondary)
          "hover:bg-bg-elevated hover:shadow-md active:bg-bg-secondary active:shadow-none",
          // 키보드 포커스 링(기존 컴포넌트 패턴)
          "focus-visible:ring-3 focus-visible:ring-ring/50",
          className,
        ),
        children: content,
      },
      // data-slot 은 별도 병합(literal 타입 제약 회피)
      { "data-slot": "prompt-card" } as React.HTMLAttributes<HTMLDivElement>,
      props,
    ),
    state: {
      slot: "prompt-card",
    },
  });
}

export { PromptCard, PromptCardTag };
export type { PromptCardProps, PromptAuthor };

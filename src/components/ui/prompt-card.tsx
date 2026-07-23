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
  /** 보조 설명(선택) */
  description?: string;
  /** 태그 목록 */
  tags?: string[];
  /** 썸네일 이미지 URL */
  thumbnailSrc?: string;
  /** 썸네일 우하단 배지(선택) — 결과물타입 등 */
  badge?: React.ReactNode;
  /** 작성자 정보(선택) — 있으면 하단에 아바타+이름 노출 */
  author?: PromptAuthor;
};

function PromptCard({
  className,
  title,
  description,
  tags,
  thumbnailSrc,
  badge,
  author,
  render,
  ...props
}: PromptCardProps) {
  const content = (
    <>
      {/* 썸네일 16:9 (+ 우하단 배지) */}
      <div className="relative w-full">
        <Thumbnail src={thumbnailSrc} alt={title} />
        {badge ? <div className="absolute right-2 bottom-2">{badge}</div> : null}
      </div>

      {/* 제목 + 설명 */}
      <div data-slot="prompt-card-body" className="flex w-full flex-col gap-1">
        <p className="w-full truncate text-heading-2 text-text-primary">{title}</p>
        {description ? (
          <p className="line-clamp-2 text-body-3 text-text-secondary">{description}</p>
        ) : null}
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

      {/* 작성자(선택) */}
      {author ? (
        <div data-slot="prompt-card-author" className="flex w-full items-center gap-2">
          <Avatar size="sm">
            {author.avatarSrc ? <AvatarImage src={author.avatarSrc} alt={author.name} /> : null}
            <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="truncate text-body-3 text-text-secondary">{author.name}</span>
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

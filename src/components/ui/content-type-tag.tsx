import { ImageIcon, TextIcon } from "@/components/ui/icons";

import { cn } from "@/lib/utils";

/**
 * 결과물 타입 배지 — Figma Tag/Content Type(1006:2313 image / 1006:2312 text).
 * 24x24(아이콘 16 + 패딩 4), radius 4px, Background/brand 채움 + 흰 아이콘.
 * 프롬프트 카드 썸네일 우하단에 올려 결과물이 이미지인지 텍스트인지 표시한다.
 * (PromptCard 의 `badge` 슬롯에 그대로 넣어 쓴다)
 */
type ContentType = "image" | "text";

const CONTENT_TYPE_META = {
  image: { Icon: ImageIcon, label: "이미지 결과물" },
  text: { Icon: TextIcon, label: "텍스트 결과물" },
} as const;

type ContentTypeTagProps = React.ComponentProps<"span"> & {
  type: ContentType;
};

function ContentTypeTag({ className, type, ...props }: ContentTypeTagProps) {
  const { Icon, label } = CONTENT_TYPE_META[type];
  return (
    <span
      data-slot="content-type-tag"
      className={cn(
        "inline-flex items-center justify-center rounded-[4px] bg-bg-brand p-1 text-text-on-brand",
        className,
      )}
      {...props}
    >
      <Icon className="size-4" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export { ContentTypeTag };
export type { ContentType, ContentTypeTagProps };

"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { PencilIcon, UserIcon } from "@/components/ui/icons";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

/**
 * 편집 가능한 프로필 아바타 — Figma Profile(1315:6083 image / 1315:6082 placeholder).
 * - 80x80 원형 + Stroke/primary 테두리.
 * - 이미지 없으면 Background/secondary 배경 + user 아이콘 placeholder.
 * - 우하단에 24px 원형 편집 버튼(Opacity/dim 배경 + 16px 흰 연필).
 * 프로필 수정 화면에서 아바타 자체가 업로드 트리거가 되는 패턴.
 */
type EditableAvatarProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  /** 프로필 이미지 URL. 없으면 placeholder. */
  src?: string;
  /** 이미지 대체 텍스트 */
  alt?: string;
  /** 편집 버튼 클릭. 미지정 시 편집 버튼을 렌더링하지 않는다. */
  onEdit?: () => void;
  /** 편집 버튼 접근성 라벨 */
  editLabel?: string;
};

function EditableAvatar({
  className,
  src,
  alt = "",
  onEdit,
  editLabel = "프로필 사진 변경",
  ...props
}: EditableAvatarProps) {
  return (
    <div
      data-slot="editable-avatar"
      className={cn("relative inline-flex size-20 shrink-0", className)}
      {...props}
    >
      <Avatar size="xl" className="border border-stroke-primary">
        {src ? <AvatarImage src={src} alt={alt} /> : null}
        <AvatarFallback>
          {/* 시안 placeholder 는 원 안을 거의 채우는 큰 user 글리프 */}
          <UserIcon className="size-11! text-text-disabled" aria-hidden="true" />
        </AvatarFallback>
      </Avatar>

      {onEdit ? (
        <ButtonPrimitive
          data-slot="editable-avatar-edit"
          aria-label={editLabel}
          onClick={onEdit}
          className="absolute right-0 bottom-0 inline-flex size-6 items-center justify-center rounded-full bg-dim text-text-on-brand transition-[filter] outline-none hover:brightness-125 focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <PencilIcon className="size-4" />
        </ButtonPrimitive>
      ) : null}
    </div>
  );
}

export { EditableAvatar };
export type { EditableAvatarProps };

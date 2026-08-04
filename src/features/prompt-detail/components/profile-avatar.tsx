import { UserIcon } from "@/components/ui/icons";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ProfileAvatarProps = {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  /** 반응형 크기 조정 등 세부 조정용 */
  className?: string;
};

/** 작성자 프로필 아바타 — 이미지 없으면 이니셜/아이콘 폴백 */
export function ProfileAvatar({ name, src, size = "md", className }: ProfileAvatarProps) {
  const initial = name.trim().charAt(0);
  return (
    <Avatar size={size} className={className}>
      {src ? <AvatarImage src={src} alt={name} /> : null}
      <AvatarFallback>{initial || <UserIcon />}</AvatarFallback>
    </Avatar>
  );
}

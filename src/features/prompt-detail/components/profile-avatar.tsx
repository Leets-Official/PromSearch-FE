import { User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ProfileAvatarProps = {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
};

/** 작성자 프로필 아바타 — 이미지 없으면 이니셜/아이콘 폴백 */
export function ProfileAvatar({ name, src, size = "md" }: ProfileAvatarProps) {
  const initial = name.trim().charAt(0);
  return (
    <Avatar size={size}>
      {src ? <AvatarImage src={src} alt={name} /> : null}
      <AvatarFallback>{initial || <User />}</AvatarFallback>
    </Avatar>
  );
}

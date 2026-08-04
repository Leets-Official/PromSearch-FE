"use client";

import { useEffect, useId, useState } from "react";
import { PencilIcon } from "@/components/ui/icons";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import type { NicknameStatus } from "@/features/auth/hooks/use-nickname-check";
import { NICKNAME_MAX } from "@/components/modals/onboarding/constants";

interface ProfileNicknameFieldProps {
  nickname: string;
  onNicknameChange: (nickname: string) => void;
  nicknameStatus: NicknameStatus;
  avatarFile: File | null;
  onAvatarChange: (file: File | null) => void;
  /** 프로필+닉네임 배치 (회원가입=가로, 온보딩=세로) */
  layout?: "horizontal" | "vertical" | "responsive";
}

/**
 * 프로필 이미지 + 닉네임 입력 (온보딩·회원가입 공용).
 * avatarFile로부터 미리보기 URL을 내부에서 만들고 정리한다(blob URL 누수 방지).
 * 닉네임 자동 중복확인 결과(nicknameStatus)는 부모가 주입하고 여기선 표시만.
 */
export function ProfileNicknameField({
  nickname,
  onNicknameChange,
  nicknameStatus,
  avatarFile,
  onAvatarChange,
  layout = "vertical",
}: ProfileNicknameFieldProps) {
  // 온보딩·회원가입이 동시에 마운트돼도 id가 겹치지 않도록 useId 사용
  const nicknameId = useId();

  // avatarFile → 미리보기 URL.
  // preview는 avatarFile에서 파생되는 값이라 렌더 중에 생성한다(state 조정 패턴).
  // effect에서 setState하면 cascading render 경고(react-hooks/set-state-in-effect)가
  // 나므로, 생성은 렌더 중에 하고 effect는 revoke(정리)만 담당한다.
  const [preview, setPreview] = useState<string | null>(null);
  const [prevFile, setPrevFile] = useState<File | null>(null);

  if (avatarFile !== prevFile) {
    setPrevFile(avatarFile);
    setPreview(avatarFile ? URL.createObjectURL(avatarFile) : null);
  }

  // 생성한 blob URL 정리 전용 (변경/언마운트 시 revoke)
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  return (
    <div
      // layout prop 타입: "horizontal" | "vertical" | "responsive"
      // 컨테이너 className 분기를 아래로 교체
      className={
        layout === "responsive"
          ? "flex w-full flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center sm:gap-6"
          : layout === "horizontal"
            ? "flex w-full items-start justify-center gap-6"
            : "flex w-full flex-col items-center gap-4"
      }
    >
      {/* 프로필 이미지 */}
      <label className="relative shrink-0 cursor-pointer">
        <Avatar className="size-20 border border-stroke-primary">
          {preview && <AvatarImage src={preview} alt="프로필 미리보기" />}
          <AvatarFallback className="items-end">
            <ProfileIcon className="!size-4/5 text-stroke-secondary" />
          </AvatarFallback>
        </Avatar>
        <span className="absolute right-0 bottom-0 flex size-6 items-center justify-center rounded-full bg-dim text-white">
          <PencilIcon className="size-3.5" />
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onAvatarChange(e.target.files?.[0] ?? null)}
          className="sr-only"
        />
      </label>

      {/* 닉네임 */}
      <div className="flex w-full flex-col gap-1.5">
        <label htmlFor={nicknameId} className="text-title-3 text-text-primary">
          닉네임
        </label>
        <Input
          id={nicknameId}
          value={nickname}
          onChange={(e) => onNicknameChange(e.target.value.slice(0, NICKNAME_MAX))}
          placeholder="한글, 영어, 숫자로 10자 이하"
          maxLength={NICKNAME_MAX}
          aria-invalid={nicknameStatus === "taken" || nicknameStatus === "invalid"}
          data-success={nicknameStatus === "available" ? "" : undefined}
        />
        <div className="flex items-center justify-between">
          <NicknameMessage status={nicknameStatus} />
          <span className="text-body-3 text-text-secondary">
            {nickname.length}/{NICKNAME_MAX}
          </span>
        </div>
      </div>
    </div>
  );
}

/** 닉네임 검증 상태 메시지 */
function NicknameMessage({ status }: { status: NicknameStatus }) {
  switch (status) {
    case "checking":
      return <span className="text-body-3 text-text-secondary">확인 중…</span>;
    case "available":
      return <span className="text-body-3 text-[#005eeb]">사용 가능한 닉네임입니다.</span>;
    case "taken":
      return <span className="text-body-3 text-text-brand">이미 사용 중인 닉네임입니다.</span>;
    case "invalid":
      return <span className="text-body-3 text-text-brand">닉네임 형식을 확인해주세요.</span>;
    default:
      return <span />;
  }
}

/** 프로필 기본 아바타 아이콘 (Figma export) */
function ProfileIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 66 66" fill="none" aria-hidden="true" className={className} {...props}>
      <path
        d="M51.613 57.2727C51.613 54.8828 50.055 52.2753 46.6006 50.1163C43.1876 47.9833 38.2903 46.5687 32.7272 46.5687C27.1641 46.5687 22.2668 47.9833 18.8538 50.1163C15.3994 52.2753 13.8414 54.8828 13.8414 57.2727C13.8414 58.8919 12.5282 60.2051 10.909 60.2051C9.28984 60.2051 7.97668 58.8919 7.97668 57.2727C7.97668 52.1315 11.3034 47.9202 15.7457 45.1438C20.2292 42.3417 26.2408 40.704 32.7272 40.704C39.2136 40.704 45.2252 42.3417 49.7088 45.1438C54.151 47.9202 57.4777 52.1315 57.4777 57.2727C57.4777 58.8919 56.1646 60.2051 54.5454 60.2051C52.9262 60.2051 51.613 58.8919 51.613 57.2727ZM43.4312 21.8182C43.4312 15.9062 38.6392 11.1142 32.7272 11.1142C26.8153 11.1142 22.0232 15.9062 22.0232 21.8182C22.0232 27.7301 26.8153 32.5222 32.7272 32.5222C38.6392 32.5222 43.4312 27.7301 43.4312 21.8182ZM49.2959 21.8182C49.2959 30.9685 41.8776 38.3869 32.7272 38.3869C23.5769 38.3869 16.1585 30.9685 16.1585 21.8182C16.1585 12.6678 23.5769 5.24945 32.7272 5.24945C41.8776 5.24945 49.2959 12.6678 49.2959 21.8182Z"
        fill="currentColor"
      />
    </svg>
  );
}

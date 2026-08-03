"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ProfileNicknameField } from "@/features/auth/components/profile-nickname-field";
import { InterestChips } from "@/features/auth/components/interest-chips";
import type { NicknameStatus } from "@/features/auth/hooks/use-nickname-check";
import { MOCK_PROFILE } from "@/mocks/data/mypage";

export default function MyProfileEditPage() {
  const router = useRouter();

  const [nickname, setNickname] = useState(MOCK_PROFILE.username);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  // TODO: use-nickname-check 훅과 연결. 중립값 리터럴이 "idle"이 아니면 맞춰주세요.
  const [nicknameStatus] = useState<NicknameStatus>("idle");

  // TODO: 초기 선택값은 프로필 API 응답으로 대체
  const [jobs, setJobs] = useState<string[]>(["직장인", "기획자"]);
  const [tasks, setTasks] = useState<string[]>(["PPT", "이메일", "이미지 생성"]);

  const handleSave = () => {
    // TODO: 저장 API 연동 (nickname, avatarFile, jobs, tasks)
    router.push("/mypage");
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-heading-1 text-text-primary">프로필</h1>

      <div className="mx-auto flex w-full max-w-[560px] flex-col gap-8">
        <ProfileNicknameField
          layout="horizontal"
          nickname={nickname}
          onNicknameChange={setNickname}
          nicknameStatus={nicknameStatus}
          avatarFile={avatarFile}
          onAvatarChange={setAvatarFile}
        />

        <InterestChips jobs={jobs} tasks={tasks} onJobsChange={setJobs} onTasksChange={setTasks} />

        <Button variant="brand" size="lg" onClick={handleSave} className="mt-2 w-full">
          저장하기
        </Button>
      </div>
    </div>
  );
}

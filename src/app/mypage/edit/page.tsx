"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ProfileNicknameField } from "@/features/auth/components/profile-nickname-field";
import { InterestChips } from "@/features/auth/components/interest-chips";
import { useMyProfile } from "@/features/auth/hooks/use-my-profile";
import {
  updateMyProfile,
  checkNicknameAvailability,
  type MyProfile,
} from "@/features/auth/api/profile";
import { toJobTagIds, toTaskTagIds } from "@/features/auth/lib/tag-mapping";
import { useNicknameCheck } from "@/features/auth/hooks/use-nickname-check";
import { getErrorMessage } from "@/lib/api";

export default function MyProfileEditPage() {
  const { data: profile, isLoading } = useMyProfile();

  if (isLoading || !profile) {
    return <div className="flex flex-col gap-8" aria-busy="true" />; // TODO: 스켈레톤 UI
  }

  // profile 이 준비된 뒤에만 마운트되므로, 아래 폼은 항상 실제 데이터로 초기화된 상태로 시작한다.
  // (effect 로 나중에 채우지 않아도 되어 react-hooks/set-state-in-effect 문제 자체가 없다)
  return <MyProfileEditForm profile={profile} />;
}

function MyProfileEditForm({ profile }: { profile: MyProfile }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [nickname, setNicknameState] = useState(profile.nickname);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [jobs, setJobs] = useState<string[]>(profile.interestJobTags.map((t) => t.name));
  const [tasks, setTasks] = useState<string[]>(profile.interestTaskTags.map((t) => t.name));
  const [error, setError] = useState<string | null>(null);

  // 닉네임을 안 바꿨으면 중복 확인을 돌릴 필요가 없다 — 원래 값과 같으면 항상 available 취급
  const checkNickname = (value: string, signal: AbortSignal) =>
    value === profile.nickname ? Promise.resolve(true) : checkNicknameAvailability(value, signal);

  const { setNickname: setCheckedNickname, status: nicknameStatus } = useNicknameCheck({
    checkNickname,
  });

  const handleNicknameChange = (value: string) => {
    setNicknameState(value);
    setCheckedNickname(value);
  };

  const { mutate: submitUpdate, isPending } = useMutation({
    mutationFn: () =>
      updateMyProfile({
        nickname,
        interestJobTagIds: toJobTagIds(jobs),
        interestTaskTagIds: toTaskTagIds(tasks),
        // TODO: avatarFile → 프로필 이미지 업로드(USER-007~009) 연동 후 profileImageUrl 채우기
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      router.push("/mypage");
    },
    onError: (err) => setError(getErrorMessage(err, "프로필 저장 중 오류가 발생했습니다.")),
  });

  const canSubmit =
    !isPending &&
    (nickname === profile.nickname || nicknameStatus === "available") &&
    jobs.length > 0 &&
    tasks.length > 0;

  const handleSave = () => {
    setError(null);
    submitUpdate();
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="hidden text-heading-2 text-text-primary sm:block">프로필</h1>

      <div className="mx-auto flex w-full max-w-[560px] flex-col gap-8">
        <ProfileNicknameField
          layout="responsive"
          nickname={nickname}
          onNicknameChange={handleNicknameChange}
          nicknameStatus={nicknameStatus}
          avatarFile={avatarFile}
          onAvatarChange={setAvatarFile}
        />

        <InterestChips jobs={jobs} tasks={tasks} onJobsChange={setJobs} onTasksChange={setTasks} />

        {error && <span className="text-body-3 text-text-brand">{error}</span>}

        <Button
          variant="brand"
          size="lg"
          onClick={handleSave}
          disabled={!canSubmit}
          className="mt-2 w-full"
        >
          {isPending ? "저장 중…" : "저장하기"}
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateEmail } from "@/features/auth/lib/validation";
import { useMyProfile } from "@/features/auth/hooks/use-my-profile";
import { api, getErrorMessage } from "@/lib/api";

export default function EmailChangePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useMyProfile();

  // 소셜 계정은 이메일 변경 불가 — URL 직접 진입 시 설정으로 돌려보냄
  // NOTE: authProvider 필드가 아직 API에 없어(리포트 확인 사항 4번) 지금은 이 가드가 동작하지 않는다.
  // authProvider 가 추가되면 profile.authProvider !== "email" 조건으로 되돌린다.
  useEffect(() => {
    // if (profile && profile.authProvider !== "email") router.replace("/mypage/settings");
  }, [profile, router]);

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const canSubmit = validateEmail(email).status === "valid";

  const { mutate: submitEmail, isPending } = useMutation({
    mutationFn: (nextEmail: string) =>
      // NOTE: 이메일 변경 전용 API가 Swagger에 없어 PATCH /users/me 의 email 필드를 재사용한다.
      // 다른 필드(닉네임/관심사)를 함께 보내야 하는지는 BE 확인 필요.
      api.patch<void>("/users/me", { email: nextEmail }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      router.push("/mypage/settings");
    },
    onError: (err) => setError(getErrorMessage(err, "이메일 변경 중 오류가 발생했습니다.")),
  });

  const handleSave = () => {
    if (validateEmail(email).status !== "valid") {
      setError("이메일 형식으로 입력해주세요.");
      return;
    }
    setError(null);
    submitEmail(email);
  };

  if (isLoading || !profile) {
    return <div className="flex flex-col gap-8" aria-busy="true" />; // TODO: 스켈레톤 UI
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-heading-1 text-text-primary">이메일 변경</h1>

      <div className="mx-auto flex w-full max-w-[520px] flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-title-1 text-text-primary">현재 이메일</span>
          <span className="text-body-1 text-text-secondary">{profile.email}</span>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-title-1 text-text-primary">새 이메일</span>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="새 이메일을 입력해주세요."
            autoComplete="email"
            aria-invalid={error ? true : undefined}
            disabled={isPending}
          />
          {error && <span className="text-body-3 text-text-brand">{error}</span>}
        </label>

        <Button
          variant="brand"
          size="lg"
          onClick={handleSave}
          disabled={!canSubmit || isPending}
          className="mt-2 w-full"
        >
          {isPending ? "저장 중…" : "저장하기"}
        </Button>
      </div>
    </div>
  );
}

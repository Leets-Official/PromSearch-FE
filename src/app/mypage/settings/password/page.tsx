"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validatePassword } from "@/features/auth/lib/validation";
import {
  useChangePassword,
  getChangePasswordErrorMessage,
} from "@/features/auth/hooks/use-change-password";

export default function PasswordChangePage() {
  const router = useRouter();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { mutate: changePassword, isPending } = useChangePassword();

  // 파생값: 형식/일치 여부 (렌더·활성화·힌트에서 공용)
  const pw = validatePassword(next);
  const mismatch = confirm.length > 0 && next !== confirm;
  const canSubmit = current.length > 0 && pw.isValid && next === confirm && !isPending;

  const handleSave = () => {
    if (!pw.isValid) {
      setError(pw.message ?? "비밀번호 형식을 확인해주세요.");
      return;
    }
    if (next !== confirm) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    setError(null);

    changePassword(
      { currentPassword: current, newPassword: next },
      {
        onSuccess: () => router.push("/mypage/settings"),
        onError: (err) => setError(getChangePasswordErrorMessage(err)),
      },
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-heading-1 text-text-primary">비밀번호 변경</h1>

      <div className="mx-auto flex w-full max-w-[520px] flex-col gap-6">
        <label className="flex flex-col gap-2">
          <span className="text-title-1 text-text-primary">현재 비밀번호</span>
          <Input
            type="password"
            value={current}
            placeholder="현재 비밀번호를 입력해주세요."
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            disabled={isPending}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-title-1 text-text-primary">새 비밀번호</span>
          <Input
            type="password"
            value={next}
            placeholder="새 비밀번호를 입력해주세요."
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            aria-invalid={next.length > 0 && !pw.isValid ? true : undefined}
            disabled={isPending}
          />
          {/* 실시간 형식 힌트: 입력이 있고 아직 형식 미달일 때 */}
          {next.length > 0 && !pw.isValid && (
            <span className="text-body-3 text-text-brand">
              {pw.message ?? "영문·숫자·특수문자 중 2가지 이상, 8~20자"}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-title-1 text-text-primary">새 비밀번호 확인</span>
          <Input
            type="password"
            value={confirm}
            placeholder="새 비밀번호를 다시 입력해주세요."
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            aria-invalid={mismatch ? true : undefined}
            disabled={isPending}
          />
          {/* 실시간 불일치 힌트 */}
          {mismatch && (
            <span className="text-body-3 text-text-brand">새 비밀번호가 일치하지 않습니다.</span>
          )}
        </label>

        {error && <span className="text-body-3 text-text-brand">{error}</span>}

        <Button
          variant="brand"
          size="lg"
          onClick={handleSave}
          disabled={!canSubmit}
          className="mt-2 w-full"
        >
          {isPending ? "변경 중…" : "저장하기"}
        </Button>
      </div>
    </div>
  );
}

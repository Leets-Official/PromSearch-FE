"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validatePassword } from "@/features/auth/lib/validation";

export default function PasswordChangePage() {
  const router = useRouter();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const pw = validatePassword(next);
    if (!pw.isValid) {
      setError(pw.message ?? "비밀번호 형식을 확인해주세요.");
      return;
    }
    if (next !== confirm) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    setError(null);
    // TODO: PATCH /account/password { current, next }
    router.push("/mypage/settings");
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
            aria-invalid={error ? true : undefined}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-title-1 text-text-primary">새 비밀번호 확인</span>
          <Input
            type="password"
            value={confirm}
            placeholder="새 비밀번호를 다시 입력해주세요."
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            aria-invalid={error ? true : undefined}
          />
          {error && <span className="text-body-3 text-text-brand">{error}</span>}
        </label>

        <Button variant="brand" size="lg" onClick={handleSave} className="mt-2 w-full">
          저장하기
        </Button>
      </div>
    </div>
  );
}

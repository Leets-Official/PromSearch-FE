"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateEmail } from "@/features/auth/lib/validation";
import { MOCK_ACCOUNT } from "@/mocks/data/mypage";

export default function EmailChangePage() {
  const router = useRouter();
  const account = MOCK_ACCOUNT;

  // 소셜 계정은 이메일 변경 불가 — URL 직접 진입 시 설정으로 돌려보냄
  useEffect(() => {
    if (account.provider !== "email") router.replace("/mypage/settings");
  }, [account.provider, router]);

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (validateEmail(email).status !== "valid") {
      setError("이메일 형식으로 입력해주세요.");
      return;
    }
    setError(null);
    // TODO: PATCH /account/email { email }
    router.push("/mypage/settings");
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-heading-1 text-text-primary">이메일 변경</h1>

      <div className="mx-auto flex w-full max-w-[520px] flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-title-1 text-text-primary">현재 이메일</span>
          <span className="text-body-1 text-text-secondary">{account.email}</span>
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

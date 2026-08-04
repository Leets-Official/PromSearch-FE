"use client";

import { useState } from "react";

import { Logo } from "@/components/ui/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProfileNicknameField } from "./profile-nickname-field";
import { InterestChips } from "./interest-chips";
import { TermsAgreement } from "./terms-agreement";
import { validateEmail, validatePassword } from "@/features/auth/lib/validation";
import { TERMS } from "@/features/auth/constants/terms";
import type { NicknameStatus } from "@/features/auth/hooks/use-nickname-check";

export interface SignUpValues {
  id: string;
  password: string;
  nickname: string;
  avatarFile: File | null;
  jobs: string[];
  tasks: string[];
  agreedTerms: string[];
}

interface SignUpFormProps {
  nicknameStatus?: NicknameStatus;
  onNicknameChange?: (nickname: string) => void;
  onSubmit?: (values: SignUpValues) => void;
}

/**
 * 회원가입 폼 (Figma: 회원가입 페이지)
 * sm+: 로고(세로) → 폼. 모바일: "회원가입" 제목 → 폼 (로고 숨김, 상단 뒤로가기는 page 가 렌더).
 * 프로필/닉네임은 모바일 세로 / sm+ 가로(responsive).
 * 닉네임 검증은 useNicknameCheck(부모 주입), 나머지 상태는 폼이 관리.
 */
export function SignUpForm({
  nicknameStatus = "idle",
  onNicknameChange,
  onSubmit,
}: SignUpFormProps) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [jobs, setJobs] = useState<string[]>([]);
  const [tasks, setTasks] = useState<string[]>([]);
  const [agreed, setAgreed] = useState<Set<string>>(new Set());
  const emailV = validateEmail(id);
  const passwordV = validatePassword(password);

  const handleNickname = (value: string) => {
    setNickname(value);
    onNicknameChange?.(value);
  };

  const requiredTermsOk = TERMS.filter((t) => t.required).every((t) => agreed.has(t.id));

  const canSubmit =
    emailV.status === "valid" &&
    passwordV.isValid &&
    nicknameStatus === "available" &&
    jobs.length > 0 &&
    tasks.length > 0 &&
    requiredTermsOk;

  return (
    <div className="flex min-h-[720px] w-full max-w-[1120px] flex-col items-center gap-8 sm:py-12">
      {/* sm+: 로고 / 모바일: "회원가입" 제목 (뒤로가기는 page 의 MobileBackHeader) */}
      <Logo variant="vertical" className="hidden sm:block" />
      <p className="w-[480px] max-w-full text-display-1 text-text-primary sm:hidden">회원가입</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.({
            id,
            password,
            nickname,
            avatarFile,
            jobs,
            tasks,
            agreedTerms: [...agreed],
          });
        }}
        noValidate
        className="flex w-[480px] max-w-full flex-col gap-8"
      >
        {/* 아이디 (이메일) */}
        <label className="flex flex-col gap-2">
          <span className="text-title-1 text-text-primary">아이디</span>
          <Input
            type="email"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="이메일을 입력해주세요."
            aria-invalid={emailV.status === "invalid"}
          />
          {emailV.message && <span className="text-body-3 text-text-brand">{emailV.message}</span>}
        </label>

        {/* 비밀번호 */}
        <label className="flex flex-col gap-2">
          <span className="text-title-1 text-text-primary">비밀번호</span>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="영문·숫자·특수문자 중 2가지 이상, 8~20자"
            aria-invalid={passwordV.status === "invalid"}
          />
          {passwordV.message && (
            <span className="text-body-3 text-text-brand">{passwordV.message}</span>
          )}
        </label>

        {/* 프로필 + 닉네임 (모바일 세로 / sm+ 가로) */}
        <ProfileNicknameField
          nickname={nickname}
          onNicknameChange={handleNickname}
          nicknameStatus={nicknameStatus}
          avatarFile={avatarFile}
          onAvatarChange={setAvatarFile}
          layout="responsive"
        />

        {/* 관심 직군 / 태스크 */}
        <InterestChips jobs={jobs} tasks={tasks} onJobsChange={setJobs} onTasksChange={setTasks} />

        {/* 약관 동의 */}
        <TermsAgreement agreed={agreed} onChange={setAgreed} />

        {/* 가입하기 */}
        <Button type="submit" variant="brand" size="lg" className="w-full" disabled={!canSubmit}>
          가입하기
        </Button>
      </form>
    </div>
  );
}

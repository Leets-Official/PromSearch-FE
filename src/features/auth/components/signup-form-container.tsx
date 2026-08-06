"use client";

import { useRouter } from "next/navigation";

import { getErrorMessage } from "@/lib/api";
import { SignUpForm, type SignUpValues } from "./signup-form";
import { useNicknameCheck } from "@/features/auth/hooks/use-nickname-check";
import { useSignup } from "@/features/auth/hooks/use-signup";
import { toJobTagIds, toTaskTagIds } from "@/features/auth/lib/tag-mapping";
import { toAgreementsPayload } from "@/features/auth/lib/agreements";
import { checkNicknameAvailability } from "@/features/auth/api/profile";

/** 회원가입 폼 컨테이너 — useNicknameCheck 연결 + 제출 처리 */
export function SignUpFormContainer() {
  const router = useRouter();

  const { setNickname, status } = useNicknameCheck({ checkNickname: checkNicknameAvailability });
  const {
    mutate: submitSignup,
    isPending,
    error,
  } = useSignup({
    onSuccess: () => router.push("/home"),
  });

  const handleSubmit = (values: SignUpValues) => {
    submitSignup({
      nickname: values.nickname,
      email: values.id,
      password: values.password,
      interestJobTagIds: toJobTagIds(values.jobs),
      interestTaskTagIds: toTaskTagIds(values.tasks),
      agreements: toAgreementsPayload(values.agreedTerms),
      // 프로필 이미지는 인증이 필요한 API(USER-007~008)라 가입+로그인 완료 이후에만 업로드할 수 있다.
      // 실제 업로드는 useSignup 내부에서 로그인 성공 뒤에 처리한다.
      avatarFile: values.avatarFile,
    });
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <SignUpForm nicknameStatus={status} onNicknameChange={setNickname} onSubmit={handleSubmit} />
      {isPending && (
        <p className="text-body-3 text-text-secondary" role="status">
          가입 처리 중입니다…
        </p>
      )}
      {error && (
        <p role="alert" className="text-body-3 text-text-brand">
          {getErrorMessage(error, "회원가입 중 오류가 발생했습니다.")}
        </p>
      )}
    </div>
  );
}

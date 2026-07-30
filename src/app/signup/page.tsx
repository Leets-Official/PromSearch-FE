import type { Metadata } from "next";

import { SignUpFormContainer } from "@/features/auth/components/signup-form-container";

export const metadata: Metadata = {
  title: "회원가입 | PromSearch",
};

/**
 * 회원가입 페이지 — (main) 셸(헤더/사이드바) 밖의 독립 화면.
 * 시안: 좌우 패딩 80px(px-20), 배경 primary, 중앙 정렬.
 */
export default function SignUpPage() {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center bg-bg-primary px-20">
      <SignUpFormContainer />
    </div>
  );
}

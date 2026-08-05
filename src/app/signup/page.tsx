import type { Metadata } from "next";

import { MobileBackHeader } from "@/components/layout/mobile-back-header";
import { SignUpFormContainer } from "@/features/auth/components/signup-form-container";

export const metadata: Metadata = {
  title: "회원가입 | PromSearch",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-bg-primary">
      <div className="sm:hidden">
        <MobileBackHeader />
      </div>

      <div className="flex w-full flex-col items-center px-4 pb-10 sm:px-20">
        <SignUpFormContainer />
      </div>
    </div>
  );
}

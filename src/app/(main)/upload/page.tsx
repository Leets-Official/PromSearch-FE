import type { Metadata } from "next";

import { PromptUploadForm } from "@/features/upload/components/prompt-upload-form";

export const metadata: Metadata = {
  title: "프롬프트 업로드",
};

// (main) 셸(헤더+사이드바) 안에서 업로드 폼만 렌더한다. 폼 로직은 클라이언트 컴포넌트에 위임.
export default function UploadPage() {
  return <PromptUploadForm />;
}

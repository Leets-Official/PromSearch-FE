import { Suspense } from "react";

import { OAuthCallbackPage } from "@/features/auth/components/oauth-callback-page";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OAuthCallbackPage />
    </Suspense>
  );
}

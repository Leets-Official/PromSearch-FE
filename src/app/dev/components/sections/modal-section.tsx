"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/modals/login-modal";

import { SpecGroup, SpecSection } from "./spec";

/**
 * Modal 스펙 시트.
 * 오버레이 컴포넌트라 정적 나열 대신 "열기 → 모달" 형태로 시연한다.
 */
export function ModalSection() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <SpecSection id="modal" label="Modal">
      <SpecGroup title="Login Modal">
        <Button variant="brand" onClick={() => setLoginOpen(true)}>
          로그인 모달 열기
        </Button>
        <LoginModal
          open={loginOpen}
          onOpenChange={setLoginOpen}
          onLogin={(id, pw) => console.log("login", id, pw)}
          onSignUp={() => console.log("signup")}
          onGoogleLogin={() => console.log("google")}
          onKakaoLogin={() => console.log("kakao")}
        />
      </SpecGroup>
    </SpecSection>
  );
}

"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { LoginModal } from "@/components/modals/login/login-modal";
import { OnboardingModal } from "@/components/modals/onboarding/onboarding-modal";
import { useNicknameCheck } from "@/features/auth/hooks/use-nickname-check";

import { SpecGroup, SpecSection } from "./spec";

/**
 * Modal 스펙 시트.
 * 오버레이 컴포넌트라 정적 나열 대신 "열기 → 모달" 형태로 시연한다.
 */
export function ModalSection() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // 온보딩 닉네임 자동 중복확인 — 목(관리자만 중복 처리)
  const checkNickname = useCallback(async (nickname: string, signal: AbortSignal) => {
    await new Promise((r) => setTimeout(r, 300));
    if (signal.aborted) throw new Error("aborted");
    return nickname !== "관리자";
  }, []);

  const { setNickname, status } = useNicknameCheck({ checkNickname });

  return (
    <SpecSection id="modal" label="Modal">
      {/* Figma Modal(1517:8755) — sm 미만이면 mobile 레이아웃(가운데 정렬 + 5:5 버튼)으로 전환 */}
      <SpecGroup title="Confirm Modal (창 폭을 줄이면 mobile 레이아웃으로 전환)">
        <Button variant="brand" onClick={() => setConfirmOpen(true)}>
          확인 모달 열기
        </Button>
        <ConfirmModal
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="모달 타이틀입니다"
          description="모달에 필요한 설명을 적는 부분입니다. 두 줄 정도로 긴 설명을 작성해도 괜찮은 공간입니다."
          onConfirm={() => {
            console.log("confirm");
            setConfirmOpen(false);
          }}
        />
      </SpecGroup>

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

      <SpecGroup title="Onboarding Modal">
        <Button variant="brand" onClick={() => setOnboardingOpen(true)}>
          온보딩 모달 열기
        </Button>
        <OnboardingModal
          open={onboardingOpen}
          onOpenChange={setOnboardingOpen}
          nicknameStatus={status}
          onNicknameChange={setNickname}
          onComplete={(result) => {
            console.log("onboarding complete", result);
            setOnboardingOpen(false);
          }}
          onSkip={() => setOnboardingOpen(false)}
        />
      </SpecGroup>
    </SpecSection>
  );
}

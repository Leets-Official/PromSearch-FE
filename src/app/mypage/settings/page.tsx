"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { GoogleIcon, KakaoIcon } from "@/components/ui/brand-icons";
import { MOCK_ACCOUNT, MOCK_NOTIFICATIONS, type AuthProvider } from "@/mocks/data/mypage";

const PROVIDER_ICON: Partial<Record<AuthProvider, React.ReactNode>> = {
  google: <GoogleIcon />,
  kakao: <KakaoIcon />,
};

export default function SettingsPage() {
  const account = MOCK_ACCOUNT;
  const isEmailAccount = account.provider === "email";

  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const toggleNotification = (id: string, next: boolean) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, enabled: next } : n)));
    // TODO: PATCH /settings/notifications { id, enabled: next }
  };

  return (
    <div className="flex flex-col gap-12">
      {/* 계정 설정 */}
      <section className="flex flex-col gap-6">
        <h1 className="text-heading-1 text-text-primary">계정 설정</h1>

        {/* 아이디(연결된 계정) */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-title-1 text-text-primary">아이디 (연결된 계정)</span>
            <span className="flex items-center gap-1.5 text-body-1 text-text-secondary">
              {account.email}
              {PROVIDER_ICON[account.provider]}
            </span>
          </div>

          {isEmailAccount ? (
            <Button
              variant="neutral"
              size="sm"
              nativeButton={false}
              render={<Link href="/mypage/settings/email" />}
            >
              이메일 변경하기
            </Button>
          ) : (
            // 소셜 계정: 비활성 · 클릭 불가
            <Button variant="neutral" size="sm" disabled>
              소셜 계정 연동완료
            </Button>
          )}
        </div>

        {/* 비밀번호 변경 — 자체 로그인만 (소셜은 비밀번호가 없음) */}
        {isEmailAccount && (
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-title-1 text-text-primary">비밀번호 변경</span>
              <span className="text-body-1 text-text-secondary">
                최근 변경: {account.passwordUpdatedAt}
              </span>
            </div>
            <Button
              variant="neutral"
              size="sm"
              nativeButton={false}
              render={<Link href="/mypage/settings/password" />}
            >
              변경하기
            </Button>
          </div>
        )}
      </section>

      {/* 알림 설정 */}
      <section className="flex flex-col gap-6">
        <h2 className="text-heading-1 text-text-primary">알림 설정</h2>

        <ul className="flex flex-col">
          {notifications.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between border-b border-stroke-primary py-4 last:border-b-0"
            >
              <div className="flex flex-col gap-1">
                <span className="text-title-1 text-text-primary">{item.label}</span>
                <span className="text-body-3 text-text-secondary">{item.description}</span>
              </div>
              <Switch
                checked={item.enabled}
                onCheckedChange={(next) => toggleNotification(item.id, next)}
                aria-label={item.label}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

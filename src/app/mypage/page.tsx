"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRightIcon, PencilIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostStatusTabs } from "@/features/mypage/components/post-status-tabs";
import { MyPostsTable } from "@/features/mypage/components/my-posts-table";
import { MOCK_ACCOUNT, MOCK_POSTS, MOCK_PROFILE, type PostStatus } from "@/mocks/data/mypage";

const RECENT_LIMIT = 5;

// 모바일 전용 네비게이션 (sm+ 는 사이드바/햄버거가 담당)
const MOBILE_MENU = [
  { label: "내 게시글", href: "/mypage/posts" },
  { label: "북마크한 게시글", href: "/mypage/bookmarks" },
  { label: "수익", href: "/mypage/revenue" },
  { label: "설정", href: "/mypage/settings" },
] as const;

export default function MyProfilePage() {
  const [status, setStatus] = useState<PostStatus>("published");

  const profile = MOCK_PROFILE;
  const recent = MOCK_POSTS.filter((post) => post.status === status).slice(0, RECENT_LIMIT);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="hidden text-heading-2 text-text-primary sm:block">프로필</h1>

      {/* 상단 카드: 프로필 · 보유 포인트 · 현재 등급 */}
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* 프로필 카드 — 모바일 세로(가운데) / sm+ 가로 */}
        <Card className="relative flex-1 flex-col items-center gap-4 text-center sm:flex-row sm:gap-5 sm:text-left">
          <Avatar className="size-20 shrink-0 border border-stroke-primary">
            {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt="" />}
            <AvatarFallback />
          </Avatar>

          <div className="flex flex-col items-center gap-2 sm:items-start">
            <span className="text-heading-2 text-text-primary">{profile.username}</span>
            {/* 모바일: 이메일 */}
            <span className="text-body-3 text-text-secondary sm:hidden">{MOCK_ACCOUNT.email}</span>
            {/* sm+: 관심 태그 */}
            <div className="hidden flex-wrap gap-1.5 sm:flex">
              {profile.interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex h-7 items-center rounded-md border border-stroke-brand bg-interaction-neutral-selected px-2 text-body-3 text-text-brand"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          <Link
            href="/mypage/edit"
            aria-label="프로필 편집"
            className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <PencilIcon className="size-4" />
          </Link>
        </Card>

        {/* 포인트·등급 — 모바일 2열 그리드 / lg+ 행에 편입(contents) */}
        <div className="grid grid-cols-2 gap-4 lg:contents">
          <Card className="justify-between gap-4 lg:w-52">
            <span className="text-title-3 text-text-secondary">보유 포인트</span>
            <span className="text-heading-1 text-text-primary">
              {profile.points.toLocaleString()}
              <span className="ml-1 text-title-2 text-text-secondary">P</span>
            </span>
          </Card>

          <Card className="justify-between gap-4 lg:w-52">
            <span className="text-title-3 text-text-secondary">현재 등급</span>
            <span className="text-heading-1 text-text-primary">{profile.grade}</span>
          </Card>
        </div>
      </div>

      {/* 모바일: 메뉴 리스트 (네비게이션) */}
      <nav className="flex flex-col sm:hidden">
        {MOBILE_MENU.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between border-b border-stroke-primary py-4 text-title-3 text-text-primary"
          >
            {item.label}
            <ChevronRightIcon className="size-5 text-text-secondary" />
          </Link>
        ))}
      </nav>

      {/* sm+: 내 게시글 미리보기 (표) */}
      <section className="hidden flex-col gap-4 sm:flex">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-heading-2 text-text-primary">내 게시글</h2>
            <span className="text-body-3 text-text-secondary">
              최근 {RECENT_LIMIT}개 게시물이 노출됩니다.
            </span>
          </div>
          <Link
            href="/mypage/posts"
            className="flex items-center gap-0.5 rounded-sm text-body-3 text-text-secondary transition-colors hover:text-text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            전체보기
            <ChevronRightIcon className="size-4" />
          </Link>
        </div>

        <PostStatusTabs value={status} onValueChange={setStatus} />
        <MyPostsTable posts={recent} />
      </section>
    </div>
  );
}

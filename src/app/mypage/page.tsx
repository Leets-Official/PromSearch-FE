"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRightIcon, PencilIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostStatusTabs } from "@/features/mypage/components/post-status-tabs";
import { MyPostsTable } from "@/features/mypage/components/my-posts-table";
import { MOCK_POSTS, MOCK_PROFILE, type PostStatus } from "@/mocks/data/mypage";

const RECENT_LIMIT = 5;

export default function MyProfilePage() {
  const [status, setStatus] = useState<PostStatus>("published");

  const profile = MOCK_PROFILE;
  const recent = MOCK_POSTS.filter((post) => post.status === status).slice(0, RECENT_LIMIT);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-heading-2 text-text-primary">프로필</h1>

      {/* 상단 카드: 프로필 · 보유 포인트 · 현재 등급 */}
      <div className="flex flex-col gap-4 lg:flex-row">
        <Card className="relative flex-1 flex-row items-center gap-5">
          <Avatar className="size-20 shrink-0 border border-stroke-primary">
            {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt="" />}
            <AvatarFallback />
          </Avatar>

          <div className="flex flex-col gap-2">
            <span className="text-heading-2 text-text-primary">{profile.username}</span>
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.map((interest) => (
                <Badge key={interest}>{interest}</Badge>
              ))}
            </div>
          </div>

          {/* 연필 → 프로필 편집 화면으로 이동 */}
          <Link
            href="/mypage/edit"
            aria-label="프로필 편집"
            className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <PencilIcon className="size-4" />
          </Link>
        </Card>

        <Card className="w-full justify-between lg:w-52">
          <span className="text-title-3 text-text-secondary">보유 포인트</span>
          <span className="text-heading-1 text-text-primary">
            {profile.points.toLocaleString()}
            <span className="ml-1 text-title-2 text-text-secondary">P</span>
          </span>
        </Card>

        <Card className="w-full justify-between lg:w-52">
          <span className="text-title-3 text-text-secondary">현재 등급</span>
          <span className="text-heading-1 text-text-primary">{profile.grade}</span>
        </Card>
      </div>

      {/* 내 게시글 (최근 N개 미리보기) */}
      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-2">
            <span className="text-heading-1 text-text-primary">내 게시글</span>
            <span className="text-body-3 text-text-disabled">
              최근 {RECENT_LIMIT}개 게시물이 노출됩니다.
            </span>
          </div>

          {/* 전체보기 → 게시글 전체 화면으로 이동 */}
          <Link
            href="/mypage/posts"
            className="flex items-center gap-0.5 rounded-sm text-title-3 text-text-disabled transition-colors hover:text-text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
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

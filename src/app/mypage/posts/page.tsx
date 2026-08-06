"use client";

import { useState } from "react";

import { PaginationRoot } from "@/components/ui/pagination";
import { PostStatusTabs } from "@/features/mypage/components/post-status-tabs";
import { MyPostsTable } from "@/features/mypage/components/my-posts-table";
import { MyPostCard } from "@/features/mypage/components/my-post-card";
import { useMyPrompts } from "@/features/mypage/hooks/use-my-prompts";
import { toMyPost } from "@/features/mypage/api/map";
import type { PostStatus } from "@/mocks/data/mypage";

const PAGE_SIZE = 8;

export default function MyPostsPage() {
  const [status, setStatus] = useState<PostStatus>("published");
  const [page, setPage] = useState(1);

  // API 는 0-based page, 화면 상태는 1-based 로 유지(PaginationRoot 관례와 맞춤)
  const { data, isLoading } = useMyPrompts(status, page - 1, PAGE_SIZE);

  const pageCount = data ? Math.max(1, data.totalPages) : 1;

  // 마이페이지 프로필의 미리보기와 **같은 변환**을 쓴다(features/mypage/api/map.ts).
  const posts = (data?.content ?? []).map((item) => toMyPost(item, status));

  const handleStatusChange = (next: PostStatus) => {
    setStatus(next);
    setPage(1);
  };

  const handleDelete = (id: string) => {
    // TODO: 삭제 확인 모달 + 삭제 API (DELETE /prompts/{id} — 구현 상태 재확인 필요)
    console.log("delete", id);
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-heading-1 text-text-primary">내 게시글</h1>

      {/* 탭 — 모바일에서 스크롤 시 화면 상단 고정 */}
      <div className="sticky top-0 z-10 -mx-4 bg-bg-primary px-4 py-2 sm:static sm:mx-0 sm:bg-transparent sm:p-0">
        <PostStatusTabs value={status} onValueChange={handleStatusChange} />
      </div>

      {/* 모바일(sm 미만): 카드 리스트 */}
      <div className="flex flex-col gap-6 sm:hidden">
        {isLoading ? (
          <p className="py-12 text-center text-body-3 text-text-secondary" aria-busy="true" />
        ) : posts.length === 0 ? (
          <p className="py-12 text-center text-body-3 text-text-secondary">게시물이 없습니다.</p>
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-8">
              {posts.map((post) => (
                <li key={post.id}>
                  <MyPostCard post={post} showActions onDelete={handleDelete} />
                </li>
              ))}
            </ul>
            {pageCount > 1 && (
              <PaginationRoot page={page} pageCount={pageCount} onPageChange={setPage} />
            )}
          </>
        )}
      </div>

      {/* sm+: 기존 표 + 페이지네이션 */}
      <div className="hidden sm:flex sm:flex-col sm:gap-6">
        <MyPostsTable posts={posts} showActions onDelete={handleDelete} />
        {pageCount > 1 && (
          <PaginationRoot
            page={page}
            pageCount={pageCount}
            onPageChange={setPage}
            className="mt-2"
          />
        )}
      </div>
    </div>
  );
}

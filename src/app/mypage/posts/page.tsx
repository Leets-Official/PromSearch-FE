"use client";

import { useState } from "react";

import { PaginationRoot } from "@/components/ui/pagination";
import { PostStatusTabs } from "@/features/mypage/components/post-status-tabs";
import { MyPostsTable } from "@/features/mypage/components/my-posts-table";
import { MOCK_POSTS, type PostStatus } from "@/mocks/data/mypage";

const PAGE_SIZE = 8;

export default function MyPostsPage() {
  const [status, setStatus] = useState<PostStatus>("published");
  const [page, setPage] = useState(1);

  const filtered = MOCK_POSTS.filter((post) => post.status === status);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleStatusChange = (next: PostStatus) => {
    setStatus(next);
    setPage(1); // 탭 전환 시 첫 페이지로 리셋
  };

  const handleEdit = (id: string) => {
    // TODO: 게시글 수정 화면으로 이동
    console.log("edit", id);
  };

  const handleDelete = (id: string) => {
    // TODO: 삭제 확인 모달 + 삭제 API
    console.log("delete", id);
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-heading-2 text-text-primary">내 게시글</h1>

      <PostStatusTabs value={status} onValueChange={handleStatusChange} />

      <MyPostsTable posts={paged} showActions onEdit={handleEdit} onDelete={handleDelete} />

      {pageCount > 1 && (
        <PaginationRoot page={page} pageCount={pageCount} onPageChange={setPage} className="mt-2" />
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";

import { PaginationRoot } from "@/components/ui/pagination";
import { PostStatusTabs } from "@/features/mypage/components/post-status-tabs";
import { MyPostsTable } from "@/features/mypage/components/my-posts-table";
import { MyPostCard } from "@/features/mypage/components/my-post-card";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { MOCK_POSTS, type PostStatus } from "@/mocks/data/mypage";

const PAGE_SIZE = 8;
const MOBILE_PAGE_SIZE = 6;

export default function MyPostsPage() {
  const [status, setStatus] = useState<PostStatus>("published");

  // sm+: 페이지네이션 상태
  const [page, setPage] = useState(1);

  // 모바일: 무한 스크롤 상태 (누적 노출 개수)
  const [mobileCount, setMobileCount] = useState(MOBILE_PAGE_SIZE);

  const filtered = useMemo(() => MOCK_POSTS.filter((post) => post.status === status), [status]);

  // sm+ 표 뷰용 페이지 슬라이스
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 모바일 카드 뷰용 누적 슬라이스
  const mobilePosts = filtered.slice(0, mobileCount);
  const mobileHasMore = mobileCount < filtered.length;

  const sentinelRef = useInfiniteScroll({
    hasMore: mobileHasMore,
    onLoadMore: () => setMobileCount((count) => count + MOBILE_PAGE_SIZE),
  });

  const handleStatusChange = (next: PostStatus) => {
    setStatus(next);
    setPage(1); // sm+ 탭 전환 시 첫 페이지로 리셋
    setMobileCount(MOBILE_PAGE_SIZE); // 모바일 무한 스크롤도 함께 리셋
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
    <div className="flex flex-col gap-2">
      <h1 className="text-heading-1 text-text-primary">내 게시글</h1>

      {/* 탭 — 모바일에서 스크롤 시 화면 상단 고정 */}
      <div className="sticky top-0 z-10 -mx-4 bg-bg-primary px-4 py-2 sm:static sm:mx-0 sm:bg-transparent sm:p-0">
        <PostStatusTabs value={status} onValueChange={handleStatusChange} />
      </div>

      {/* 모바일(sm 미만): 북마크와 동일한 카드 리스트 + 무한 스크롤 */}
      <div className="flex flex-col gap-6 sm:hidden">
        {mobilePosts.length === 0 ? (
          <p className="py-12 text-center text-body-3 text-text-secondary">게시물이 없습니다.</p>
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-8">
              {mobilePosts.map((post) => (
                <li key={post.id}>
                  <MyPostCard post={post} showActions onEdit={handleEdit} onDelete={handleDelete} />
                </li>
              ))}
            </ul>
            {/* IntersectionObserver 대상 — 화면에 보이지 않지만 레이아웃 상 존재해야 함 */}
            {mobileHasMore && <div ref={sentinelRef} className="h-1" aria-hidden="true" />}
          </>
        )}
      </div>

      {/* sm+: 기존 표 + 페이지네이션 */}
      <div className="hidden sm:flex sm:flex-col sm:gap-6">
        <MyPostsTable posts={paged} showActions onEdit={handleEdit} onDelete={handleDelete} />
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

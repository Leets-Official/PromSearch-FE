"use client";

import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import type { MyPost } from "@/mocks/data/mypage";

interface MyPostsTableProps {
  posts: MyPost[];
  showActions?: boolean;
  onDelete?: (id: string) => void;
  className?: string;
}

const detailHref = (id: string) => `/prompts/${id}`;

/**
 * 내 게시글 표 (sm+ 전용).
 * 모바일(sm 미만)은 MyPostCard(마이페이지 전용 카드)로 대체되어 이 컴포넌트는
 * page.tsx 에서 sm+ 구간에서만 렌더링된다.
 */
export function MyPostsTable({
  posts,
  showActions = false,
  onDelete,
  className,
}: MyPostsTableProps) {
  const router = useRouter();
  const colSpan = 4;

  return (
    <table className={cn("w-full border-collapse text-left", className)}>
      <thead>
        <tr className="bg-bg-secondary text-title-1 text-text-primary">
          <th scope="col" className="rounded-l-md px-4 py-3">
            제목
          </th>
          <th scope="col" className="px-4 py-3">
            게시일
          </th>
          <th scope="col" className="px-4 py-3">
            조회
          </th>
          <th scope="col" className={cn("px-4 py-3", !showActions && "rounded-r-md")}>
            추천
          </th>
          {showActions && <th scope="col" className="rounded-r-md px-4 py-3" aria-label="관리" />}
        </tr>
      </thead>
      <tbody>
        {posts.length === 0 ? (
          <tr>
            <td
              colSpan={colSpan}
              className="px-4 py-12 text-center text-body-3 text-text-secondary"
            >
              게시물이 없습니다.
            </td>
          </tr>
        ) : (
          posts.map((post) => (
            <tr
              key={post.id}
              onClick={() => router.push(detailHref(post.id))}
              className="cursor-pointer border-b border-stroke-primary transition-colors hover:bg-bg-secondary"
            >
              <td className="px-4 py-4 text-body-2 text-text-primary">{post.title}</td>
              <td className="px-4 py-4 text-body-1 text-text-secondary">{post.date}</td>
              <td className="px-4 py-4 text-body-1 text-text-secondary">
                {post.stats.views.toLocaleString()}
              </td>
              <td className="px-4 py-4 text-body-1 text-text-secondary">
                {post.stats.likes.toLocaleString()}
              </td>
              {showActions && (
                <td className="px-4 py-4">
                  <div
                    className="flex items-center justify-end gap-9 text-body-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => onDelete?.(post.id)}
                      className="rounded-sm text-text-brand transition-colors hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      삭제
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

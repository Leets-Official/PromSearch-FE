"use client";

import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import type { MyPost } from "@/mocks/data/mypage";

interface MyPostsTableProps {
  posts: MyPost[];
  /** 행마다 수정/삭제 버튼 노출 (전체보기 화면용) */
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

/** 게시글 상세 경로 — 실제 상세 라우트에 맞춰 변경 */
const detailHref = (id: string) => `/prompts/${id}`;

/** 내 게시글 표 (프로필 요약 · 전체보기 공용). 행 클릭 시 상세로 이동. */
export function MyPostsTable({
  posts,
  showActions = false,
  onEdit,
  onDelete,
  className,
}: MyPostsTableProps) {
  const router = useRouter();
  const colSpan = showActions ? 5 : 4;

  return (
    <table className={cn("w-full border-collapse text-left", className)}>
      <thead>
        <tr className="bg-bg-secondary text-title-2 text-text-primary">
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
              <td className="px-4 py-4 text-title-3 text-text-primary">{post.title}</td>
              <td className="px-4 py-4 text-body-3 text-text-secondary">{post.date}</td>
              <td className="px-4 py-4 text-body-3 text-text-secondary">
                {post.views.toLocaleString()}
              </td>
              <td className="px-4 py-4 text-body-3 text-text-secondary">
                {post.likes.toLocaleString()}
              </td>
              {showActions && (
                <td className="px-4 py-4">
                  {/* 버튼 영역 클릭은 행 이동으로 전파되지 않도록 차단 */}
                  <div
                    className="flex items-center justify-end gap-3 text-body-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => onEdit?.(post.id)}
                      className="rounded-sm text-text-secondary transition-colors hover:text-text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      수정
                    </button>
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

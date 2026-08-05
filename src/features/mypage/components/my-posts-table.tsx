"use client";

import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import type { MyPost } from "@/mocks/data/mypage";

interface MyPostsTableProps {
  posts: MyPost[];
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

const detailHref = (id: string) => `/prompts/${id}`;

/** 내 게시글 — 모바일은 카드 리스트(sm 미만), sm+ 는 표. 클릭 시 상세 이동. */
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
    <div className={className}>
      {/* 모바일(sm 미만): 카드 리스트 */}
      <ul className="flex flex-col gap-3 sm:hidden">
        {posts.length === 0 ? (
          <li className="py-12 text-center text-body-3 text-text-secondary">게시물이 없습니다.</li>
        ) : (
          posts.map((post) => (
            <li key={post.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => router.push(detailHref(post.id))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") router.push(detailHref(post.id));
                }}
                className="flex cursor-pointer flex-col gap-2 rounded-md border border-stroke-primary p-4"
              >
                <span className="text-title-2 text-text-primary">{post.title}</span>
                <div className="flex items-center gap-3 text-body-3 text-text-secondary">
                  <span>{post.date}</span>
                  <span>조회 {post.views.toLocaleString()}</span>
                  <span>추천 {post.likes.toLocaleString()}</span>
                </div>
                {showActions && (
                  <div
                    className="flex items-center gap-3 text-body-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => onEdit?.(post.id)}
                      className="rounded-sm text-text-secondary hover:text-text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete?.(post.id)}
                      className="rounded-sm text-text-brand hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))
        )}
      </ul>

      {/* sm+: 표 */}
      <table className="hidden w-full border-collapse text-left sm:table">
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
                  {post.views.toLocaleString()}
                </td>
                <td className="px-4 py-4 text-body-1 text-text-secondary">
                  {post.likes.toLocaleString()}
                </td>
                {showActions && (
                  <td className="px-4 py-4">
                    <div
                      className="flex items-center justify-end gap-9 text-body-1"
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
    </div>
  );
}

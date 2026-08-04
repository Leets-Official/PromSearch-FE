import { redirect } from "next/navigation";

/** `/admin` 진입 시 사이드바 첫 메뉴(신고 게시글 관리)로 보낸다. */
export default function AdminIndexPage() {
  redirect("/admin/reports/posts");
}

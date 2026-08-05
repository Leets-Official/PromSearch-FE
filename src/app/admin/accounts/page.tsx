import { OriginUserView } from "@/features/admin/components/origin-user-view";

/**
 * 어드민 - Origin 유저 관리 ([ADMIN-GRADE-003]).
 *
 * 사이드바 시안에는 "어드민 계정 관리"로 적혀 있지만 어드민 계정 CRUD 엔드포인트가 없고,
 * 이 자리에 붙일 수 있는 API 는 Origin 등급 유저 목록뿐이라 그것으로 채웠다.
 */
export default function AdminAccountsPage() {
  return <OriginUserView />;
}

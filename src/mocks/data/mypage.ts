/**
 * 마이페이지 목데이터 · 상수.
 * BE 연동 시 MOCK_* 는 API 응답으로 교체한다.
 */

export type PostStatus = "published" | "draft" | "private";

export interface MyPost {
  id: string;
  title: string;
  /** 표시용 포맷 문자열 (예: "2026.07.12") */
  date: string;
  views: number;
  likes: number;
  status: PostStatus;
}

export interface MyProfile {
  username: string;
  avatarUrl: string | null;
  /** 프로필 카드에 뱃지로 노출할 관심 직군·태스크 */
  interests: string[];
  points: number;
  grade: string;
}

export const MOCK_PROFILE: MyProfile = {
  username: "Username",
  avatarUrl: null,
  interests: ["직장인", "기획자", "PPT", "이메일", "이미지 생성"],
  points: 20,
  grade: "Node",
};

const SAMPLE_TITLES = [
  "마케팅 카피 생성 프롬프트",
  "코드 리뷰 자동화 프롬프트",
  "이력서 첨삭 프롬프트",
  "프롬프트제목프롬프트제목프롬프트제목",
  "프롬프트제목프롬프트제목",
];

// 페이지네이션 확인용 — 게시완료 40개 (임시저장·비공개는 비어 있는 상태 확인용)
export const MOCK_POSTS: MyPost[] = Array.from({ length: 40 }, (_, i) => ({
  id: `post-${i + 1}`,
  title: SAMPLE_TITLES[i % SAMPLE_TITLES.length],
  date: "2026.07.12",
  views: 1821,
  likes: 1906,
  status: "published",
}));

export const POST_STATUS_TABS = [
  { value: "published", label: "게시완료" },
  { value: "draft", label: "임시저장" },
  { value: "private", label: "비공개" },
] as const satisfies ReadonlyArray<{ value: PostStatus; label: string }>;

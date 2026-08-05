/**
 * 내 프로필 조회 — `[USER-004] GET /users/me`.
 *
 * 헤더(닉네임·아바타)와 마이페이지가 함께 쓴다. 토큰에는 사용자 정보가 없어서,
 * 로그인 여부는 토큰으로 판정하되 **표시할 정보는 이 API 로 받는다.**
 */

import { api, toNumber } from "@/lib/api";

export type ApiInterestTag = {
  tagId: number;
  name: string;
};

export type ApiUserProfile = {
  /** ⚠️ 다른 API 는 nickname 인데 이 응답만 username 이다(요청서 7-11, 통일 요청 중) */
  username: string;
  nickname?: string;
  profileImageUrl: string | null;
  email: string;
  point: number;
  gradeName: string;
  interestJobTags: ApiInterestTag[];
  interestTaskTags: ApiInterestTag[];
};

export type MyProfile = {
  nickname: string;
  avatarUrl?: string;
  email: string;
  point: number;
  grade: string;
  interestJobTags: ApiInterestTag[];
  interestTaskTags: ApiInterestTag[];
};

export async function fetchMyProfile(): Promise<MyProfile> {
  const result = await api.get<ApiUserProfile>("/users/me");

  return {
    // 이름 필드가 API 마다 갈려 있어 둘 다 받는다(요청서 7-11).
    nickname: result.nickname ?? result.username ?? "",
    avatarUrl: result.profileImageUrl ?? undefined,
    email: result.email,
    point: toNumber(result.point),
    grade: result.gradeName,
    interestJobTags: result.interestJobTags ?? [],
    interestTaskTags: result.interestTaskTags ?? [],
  };
}

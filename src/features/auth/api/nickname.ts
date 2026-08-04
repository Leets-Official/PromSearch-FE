/**
 * 닉네임 중복 확인 API — `@/lib/api` 사용 **레퍼런스**.
 *
 * 공통 레이어를 쓰면 API 함수가 이 정도로 얇아진다는 걸 보여주는 실제 동작 예시다.
 * (인증이 필요 없고 BE 구현이 끝난 엔드포인트라 목 없이 그대로 실서버에 붙는다.)
 *
 * 여기서 확인할 것:
 * - 경로는 `/api/v1` 없이 적는다 → baseURL 이 붙여준다
 * - `params` 로 쿼리스트링을 넘긴다 → `?nickname=...`
 * - 반환 타입은 스웨거 응답의 **`result` 안쪽만** 적는다 → 봉투는 인터셉터가 벗긴다
 * - `signal` 을 그대로 넘기면 요청 취소가 된다 → 디바운스 입력에 필수
 * - 실패는 throw 되므로 `res.ok` 검사가 필요 없다
 *
 * 사용 예 — 기존 `useNicknameCheck` 훅에 그대로 주입한다.
 * ```tsx
 * const { nickname, setNickname, status } = useNicknameCheck({
 *   checkNickname: checkNicknameAvailable,
 * });
 * ```
 */

import { api } from "@/lib/api";

/** `GET /api/v1/users/nicknames/availability` 의 result */
type NicknameAvailability = {
  available: boolean;
};

/**
 * 닉네임 사용 가능 여부. 안내용 응답이며, 실제 저장 시 BE 가 중복을 다시 검증한다.
 *
 * @param signal 입력이 바뀌어 이전 요청을 버릴 때 사용(AbortController)
 */
export async function checkNicknameAvailable(
  nickname: string,
  signal?: AbortSignal,
): Promise<boolean> {
  const result = await api.get<NicknameAvailability>("/users/nicknames/availability", {
    params: { nickname },
    signal,
  });

  return result.available;
}

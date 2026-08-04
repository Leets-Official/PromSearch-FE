# lib/api

BE(`https://api.promsearch.kr`) 연동 공통 레이어. **feature 코드는 `@/lib/api` 에서만 import** 한다.

```ts
import { api, isApiError, getErrorMessage, type PageMeta } from "@/lib/api";
```

## 이 레이어가 대신 해주는 것

| 항목      | 내용                                                                        |
| --------- | --------------------------------------------------------------------------- |
| baseURL   | `/api/v1` 자동 결합 → 엔드포인트는 `/prompts/10` 처럼 prefix 없이 적는다    |
| 인증      | 로그인 상태면 `Authorization: Bearer ...` 자동 주입                         |
| 응답 봉투 | `{ success, code, message, result }` 를 벗겨 **`result` 만** 반환           |
| 에러      | 네트워크/HTTP/`success:false` 를 전부 `ApiError` 로 정규화해 throw          |
| 토큰 만료 | 401 이면 `/auth/reissue` 로 1회 재발급 후 원 요청 재시도(동시 401 도 1회만) |
| dev 툴바  | MSW 목이 읽는 프리뷰 헤더 자동 부착(실서버 호출에는 흔적 없음)              |

> 📌 **실제 동작하는 예시**: [`features/auth/api/nickname.ts`](../../features/auth/api/nickname.ts)
> (닉네임 중복 확인 — 목 없이 실서버에 붙는다) + [테스트](../../features/auth/api/nickname.test.ts)

## 1. API 함수 작성

`src/features/<도메인>/api/*.ts` 에 얇게 만든다. 파일에는 **엔드포인트와 타입만** 남는다.

```ts
// src/features/prompt-detail/api/prompt-detail.ts
import { api } from "@/lib/api";

import type { PromptDetail } from "../types";

export function fetchPromptDetail(promptId: number) {
  return api.get<PromptDetail>(`/prompts/${promptId}`);
}

export function deletePrompt(promptId: number) {
  return api.delete(`/prompts/${promptId}`);
}
```

쿼리스트링은 `params` 로 넘긴다. 값이 `undefined` 인 키는 axios 가 알아서 생략한다.

```ts
export function fetchPopularPrompts({ page = 0, size = 12 }) {
  return api.get<PromptCardListResult>("/home/prompts/popular", { params: { page, size } });
}
```

응답 타입은 **`result` 안쪽만** 정의한다(봉투는 이미 벗겨진다).

```ts
// Swagger 의 result 부분만 옮긴다
export type PromptCardListResult = {
  prompts: PromptCard[];
  page: PageMeta; // @/lib/api 에서 재사용
};
```

## 2. React Query 훅 작성

```ts
// src/features/prompt-detail/hooks/use-prompt-detail.ts
"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchPromptDetail } from "../api/prompt-detail";

export function usePromptDetail(promptId: number) {
  return useQuery({
    queryKey: ["prompt-detail", promptId],
    queryFn: () => fetchPromptDetail(promptId),
    enabled: Number.isFinite(promptId),
  });
}
```

뮤테이션은 성공 후 관련 쿼리를 무효화한다.

```ts
export function useLikePrompt(promptId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (liked: boolean) =>
      liked ? api.delete(`/prompts/${promptId}/likes`) : api.post(`/prompts/${promptId}/likes`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["prompt-detail", promptId] });
    },
  });
}
```

`retry` 는 [`query-client.ts`](../query-client.ts) 에 전역 정책이 있다 — **4xx 는 재시도하지 않고**,
네트워크 실패·5xx 만 2회까지. 뮤테이션은 재시도하지 않는다. 훅에서 따로 지정할 필요 없다.

## 3. 에러 다루기

```ts
const { error } = usePromptDetail(promptId);

if (isApiError(error) && error.status === 404) return <NotFound />;
if (error) return <ErrorView message={getErrorMessage(error)} />;
```

`ApiError` 필드: `status`(네트워크 실패는 `0`), `code`(`COMMON-404` 등), `message`(BE 문구), `detail`(응답 `result` 원문).
편의 게터: `isNetworkError` / `isUnauthorized` / `isClientError`.

## 4. 인증 연동 (로그인 담당자용)

토큰은 [`token-store.ts`](./token-store.ts) 하나만 건드리면 된다.

```ts
// 로그인/소셜로그인 성공 후
const result = await api.post<LoginResult>("/auth/login", { email, password });
setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });

// 로그아웃
clearTokens();

// 세션 만료(재발급까지 실패) 시 로그인 모달 열기 — 앱 최상단에서 1회 구독
useEffect(() => onSessionExpired(() => openLoginModal()), []);
```

> 현재 BE 는 토큰을 응답 **본문**으로 준다(httpOnly 쿠키 아님). 저장은 프론트 몫이고 **쿠키**에 둔다
> (`ps_access_token` / `ps_refresh_token`, SameSite=Lax, https 에서 Secure).
> localStorage 가 아닌 이유는 서버(proxy·서버컴포넌트)가 읽어야 하기 때문 — axios 가 값을 읽어
> `Authorization` 헤더에 실어야 해서 httpOnly 는 쓸 수 없고, 따라서 XSS 노출 범위는 localStorage 와 동일하다.
> BE 가 httpOnly 쿠키 방식으로 바뀌면 `auth-cookie.ts` + `token-store.ts` 만 교체한다.

## 5. 라우트 보호 (proxy)

[`src/proxy.ts`](../../proxy.ts) 가 페이지 렌더 전에 인증 쿠키 존재 여부를 보고 리다이렉트한다.
Next 16 에서 `middleware.ts` → **`proxy.ts`** 로 이름이 바뀌었고, export 함수명도 `proxy` 다.

| 상황                            | 동작                                            |
| ------------------------------- | ----------------------------------------------- |
| 비로그인 → `/upload`            | `/home?login=required&redirect=/upload` 로 이동 |
| 로그인 → `/signup`              | `/home` 으로 이동                               |
| accessToken 만료 + refresh 있음 | 통과(진입 후 첫 API 401 → 인터셉터가 재발급)    |

토큰을 검증하지는 않는다 — **보안 경계가 아니라 UX 가드**다. 실제 권한은 BE 가 JWT 로 판정한다.

**보호 페이지를 새로 만들었다면** [`lib/auth-routes.ts`](../auth-routes.ts) 의 목록과
`proxy.ts` 의 `config.matcher` **두 곳 모두**에 추가해야 한다(matcher 는 빌드 타임 정적 분석이라
목록에서 자동 생성할 수 없다). 현재 등록된 건 `/upload`(보호), `/signup`(guest-only) 뿐이고,
`/mypage`·`/admin` 등은 담당자가 페이지를 만들 때 직접 추가해야 한다.

로그인 UI 담당자는 `?login=required` 를 보고 모달을 열고, 성공 후 `?redirect=` 경로로 보내주면 된다.

```ts
import { LOGIN_REQUIRED_PARAM, REDIRECT_PARAM } from "@/lib/auth-routes";
```

## 통신 경로와 MSW

브라우저는 항상 상대경로 `/api/v1/*` 로 요청하고, [`next.config.ts`](../../../next.config.ts) 의 rewrites 가
BE 로 프록시한다. 덕분에 CORS 설정이 필요 없고, MSW 목과도 공존한다.

```
브라우저 ─ /api/v1/... ─→ MSW(핸들러 있으면 목 응답)
                          └ 없으면 통과 → Next rewrites → https://api.promsearch.kr/api/v1/...
```

즉 **핸들러를 지우면 그 엔드포인트만 실서버로 붙는다.** 목에서 실서버로 하나씩 옮겨갈 수 있다.
서버 컴포넌트에서 호출할 때는 상대경로를 못 쓰므로 절대 URL(`NEXT_PUBLIC_API_ORIGIN`)로 자동 전환된다.

## 환경 변수

```bash
# BE 오리진 (기본값: https://api.promsearch.kr). 로컬 BE 를 띄웠다면 http://localhost:8080
NEXT_PUBLIC_API_ORIGIN=https://api.promsearch.kr
```

Swagger: https://api.promsearch.kr/swagger-ui/index.html

## 파일

- `client.ts` — axios 인스턴스, 인터셉터, `api.get/post/put/patch/delete`
- `config.ts` — baseURL·타임아웃·인증 예외 경로
- `error.ts` — `ApiError`, `isApiError`, `getErrorMessage`
- `token-store.ts` — 토큰 저장/조회, 세션 만료 구독
- `auth-cookie.ts` — 인증 쿠키 상수(브라우저·proxy 공용)
- `types.ts` — `ApiResponse<T>`, `PageMeta`, `CursorMeta`
- `index.ts` — 공개 진입점

관련 파일: [`src/proxy.ts`](../../proxy.ts)(라우트 보호), [`src/lib/auth-routes.ts`](../auth-routes.ts)(보호 경로 목록)

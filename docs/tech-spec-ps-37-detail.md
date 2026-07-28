# [PS-37] 프롬프트 상세 조회 — 아웃풋·레시피·댓글

참고: [뱅크샐러드의 특별한 스펙, '테크 스펙'](https://blog.banksalad.com/tech/we-work-by-tech-spec/)
선행: [PS-29 홈 화면 테크 스펙](./tech-spec-ps-29-home.md)

> 기획 결정 확정됨(2026-07-21, 2026-07-22 개정). `## 확정된 사항` 참고.
> **개정(07-22)**: ① 블러 방향 변경 — 비로그인=미리보기 후 블러 / 프리미엄=전체 블러. ② 추천은 표시 전용, 상호작용은 **좋아요(=추천 토글)** + **북마크** 아이콘.

## 요약

홈 갤러리에서 카드를 클릭하면 진입하는 **프롬프트 상세 페이지**(`/prompts/[id]`)를 구현한다. `(main)` 레이아웃 셸(헤더·사이드바·푸터)을 그대로 재사용하고, 본문은 좌측 **아웃풋 이미지 캐러셀** + 우측 **정보 영역**(제목·작성자·메타·태그 + `설명`/`레시피`/`댓글` 3탭)으로 구성된다.

이 화면은 PromSearch 전환 가설의 핵심 지점이다. 홈에서 "아웃풋을 보고 클릭"한 사용자가, 상세에서 **프롬프트 본문(레시피)을 얻으려면 로그인/전환이 필요**하다는 걸 마주한다. 즉 **레시피 탭의 잠금(블러) 정책**이 이 문서의 심장이다.

- `비로그인` : **미리보기 살짝 노출 후 블러** + "로그인하고 프롬프트 보기"
- `로그인·무료` : 전체 열람 + "복사하기"
- `로그인·프리미엄(미결제)` : **전체 블러** + "포인트로 전문 보기"

BE API 확정 전이므로 홈과 동일하게 MSW 목으로 `GET /api/prompts/:id`(상세)와 댓글 엔드포인트를 정의해 병렬 개발한다. 인증/포인트/결제 시스템은 타 팀원·후속 범위이므로 **어댑터로 주입받아 소비만** 하고 미구현 구간은 폴백한다.

## 배경

PromSearch는 결과물 이미지를 먼저 보여주고(홈), 상세에서 프롬프트 본문 획득을 로그인/전환의 관문으로 삼는 프리토타입이다. [PS-29]에서 홈(목록·필터·페이지네이션)과 카드 노출/클릭 지표를 붙였고, 카드 클릭 시 이동 경로(`/prompts/[id]`)만 확정한 채 **상세 페이지는 비워뒀다**. 이 문서가 그 자리를 채운다.

PS-29에서 이미 확보한 재사용 자산:

- `(main)/layout.tsx` — 헤더(`GalleryTopBar`) + 사이드바(`CategoryNav`) + 1280px 컨테이너 셸. 상세는 같은 route group에 얹으면 셸을 그대로 상속한다.
- `useAuthStatus()` — `{ status: "anonymous" | "authenticated", isAuthenticated, user }` 어댑터(현재 `anonymous` 폴백).
- `track()` + analytics 이벤트 맵 — `prompt_copy_click`(prompt_id·user_status·source) **이미 정의됨**. 레시피 복사에 바로 연결한다.
- `PromptSummary` / `categories.ts`(라벨 맵) — 상세 태그·메타 렌더에 재사용.
- `usePromptList` 패턴(`useQuery` + MSW) — 상세는 `usePromptDetail`로 동형 복제.

즉 상세도 홈과 같이 "부품 조립 + 목 API + URL 상태 + 지표 연결"이 골격이고, **새로 정의할 도메인은 (1) 레시피 잠금 모델, (2) 댓글 트리** 둘이다.

### 접근 등급과 레시피 잠금 (핵심)

`tier`(무료/프리미엄/마스터)와 인증 상태의 조합으로 레시피 탭 표현이 갈린다. 프론트는 **잠금 판정을 자체 계산하지 않고**, 상세 응답이 내려주는 접근 정보를 신뢰한다(잠금은 BE 권한 로직 소관, 프론트 우회 방지).

| 상황                     | 레시피 표현                  | CTA                                      | 피그마              |
| ------------------------ | ---------------------------- | ---------------------------------------- | ------------------- |
| 비로그인                 | **앞부분 미리보기 후 블러**  | `로그인하고 프롬프트 보기` → 로그인 유도 | 409:8162            |
| 로그인·무료 / 잠금해제됨 | 전체 노출                    | `복사하기`(복사 이벤트)                  | 409:8197 / 551:4579 |
| 로그인·프리미엄(미결제)  | **전체 블러(미리보기 없음)** | `포인트로 전문 보기` → 포인트 차감 흐름  | 409:8235            |

> 07-22 개정: 블러 방향이 뒤바뀜(기존 Figma 프레임 라벨과 반대). 프리미엄은 결제 유도를 위해 전체 블러, 비로그인은 로그인 유도를 위해 살짝 보여준다.

> **결제/포인트 차감 트랜잭션 자체는 이번 범위 밖**(후속·타 팀원). 이번엔 잠금 판정 소비 + 블러 렌더 + CTA 배치 + CTA 클릭 지표까지. CTA 클릭 시 실제 동작(로그인 모달·포인트 결제)은 스텁으로 두고 라우트/이벤트만 확정한다.

## 목표

- `/prompts/[id]` 라우트를 `(main)` 셸 아래 추가하고, 좌(이미지 캐러셀)·우(정보) 2단 레이아웃을 구성한다.
- 상세 도메인 타입(`PromptDetail`, `PromptComment`, 접근정보)을 정의한다.
- MSW 목 `GET /api/prompts/:id`(상세)를 홈 시드와 **동일 소스**로 정의한다(id 일관성).
- `usePromptDetail(id)`(`useQuery(["prompt", id])`)로 상세를 가져온다.
- 우측 정보 영역: 제목·작성자·메타(작성일·조회·추천)·태그 렌더.
- **`설명`/`레시피`/`댓글` 3탭**을 구성하고 활성 탭을 URL(`?tab=`)로 관리한다(공유·뒤로가기).
- **레시피 탭 잠금 3-상태**(블러 + 조건부 CTA)를 응답 접근정보에 따라 렌더한다.
- 무료/잠금해제 상태에서 **복사하기** → 클립보드 복사 + `prompt_copy_click` 발송.
- **댓글 탭(표시 전용)**: 목 데이터로 댓글/대댓글 트리, "N개의 답글" 펼침, 작성자 배지, 블라인드 처리 렌더. 작성·삭제·신고 없음.
- 좌측 **이미지 캐러셀**(다중 아웃풋 이미지, `1/N` 인디케이터, 이전/다음).
- **좋아요(=추천) 토글 + 북마크 토글**: 추천수는 표시 전용, 상호작용은 좋아요·북마크 아이콘(목 POST + 낙관적 갱신).
- 상세 진입 `prompt_view`, 잠금 CTA 클릭 `prompt_unlock_click` 이벤트 신설.
- 로딩(스켈레톤)·빈·에러(재시도)·**404(없는 id)** 상태 처리.
- 잠금 판정 로직, 탭 URL 상태, 댓글 트리 구성, 복사/추천 이벤트를 Vitest로 검증(TDD).

## 목표가 아닌 것

- 프롬프트 CRUD(업로드·수정·삭제)·업로드 게이트 — 후속 브랜치(PS-29와 동일하게 범위 밖).
- 로그인/온보딩/소셜 로그인, 인증 store 구현 — 타 팀원. `useAuthStatus` 어댑터 소비만.
- **포인트/결제 시스템, 실제 잠금 해제 트랜잭션** — 후속. CTA는 스텁(라우트·이벤트만 확정).
- **댓글 작성·삭제·신고, 모더레이션 액션** — 이번엔 표시 전용(블라인드/대댓글 렌더만). 작성/CRUD는 후속.
- 작성자 **구독·게시글 신고·더보기(수정/삭제)** — 메타행 벨/⋮ **자리만** 두고 클릭 no-op 스텁. 실제 동작은 후속.
- 실제 backend 연동 — MSW 목으로 대체, 스펙 확정 시 어댑터 교체.

## 계획

### 0. 화면 구조 (프레임 499:2806 기준, 1280px)

```
┌──────────────────────────────────────────────────────────────┐
│ [로고] [🔍 검색]              [+ 업로드] [알림][프사]            │ ← (main) 셸 헤더
├──────────────┬───────────────────────────────────────────────┤
│ 홈            │ ┌────────────┐  보고서 초안 작성 프롬프트          │
│ 인기 프롬프트   │ │            │  (프사) 전업프롬프트업로더           │
│ 직군별         │ │  아웃풋      │  2026.07.12 · 조회 123 · 추천 123 │
│  학생          │ │  이미지      │  [등급][학생][직장인][보고서]      │
│  직장인        │ │  캐러셀      │  [ChatGPT][텍스트]               │
│  …            │ │  ‹ 1/10 ›  │  ┌─설명─┬─레시피─┬─댓글─┐         │
│               │ └────────────┘  │  (활성 탭 내용)      │         │
│               │                 └────────────────────┘         │
├──────────────┴───────────────────────────────────────────────┤
│                          임시푸터                               │
└──────────────────────────────────────────────────────────────┘
  좌: Slide 16:9 (432)      우: 정보 (432, gap 24)
```

**탭별 내용:**

- **설명(Description)**: 프롬프트 소개 리치 텍스트(스크롤). 잠금 없음. (409:8088 / 409:8125 / 551:4390)
- **레시피(Recipe)**: 실제 프롬프트 본문. **잠금 3-상태**(위 표). (409:8162 / 409:8197 / 409:8235 / 551:4579)
- **댓글(Comments)**: 댓글 트리 + 입력창. (499:2806 / 551:3330 / 551:3541 / 551:4678)

### 1. 라우트

```
src/app/(main)/
  prompts/
    [id]/
      page.tsx      # /prompts/:id — 상세. (main) 셸(헤더·사이드바) 상속
```

- `(main)` route group 아래라 헤더/사이드바/1280px 컨테이너를 자동 상속한다.
- `page.tsx`는 `"use client"`(탭·캐러셀·복사 등 상호작용). `params.id`로 상세 조회.
- 존재하지 않는 id → 목 404 → 상세 훅 에러 → **not-found UI**(또는 `notFound()`). _(Next.js 16 라우팅 관례는 `node_modules/next/dist/docs/` 확인 후 확정 — AGENTS.md)_

### 2. feature 폴더

홈은 `features/gallery`. 상세는 도메인이 겹치므로(같은 Prompt) **`features/prompt-detail`** 로 분리하되, 공용 타입(`PromptSummary`·라벨)은 `gallery`에서 import한다. _(폴더 위치는 확정 필요: gallery 하위 vs 별도 feature)_

```
src/features/prompt-detail/
  components/
    PromptDetailView.tsx     # 좌우 2단 조립
    OutputCarousel.tsx       # 좌: 아웃풋 이미지 캐러셀
    DetailHeader.tsx         # 우: 제목·작성자·메타·태그
    DetailTabs.tsx           # 설명/레시피/댓글 탭 셸(?tab= 연동)
    DescriptionPanel.tsx     # 설명 탭
    RecipePanel.tsx          # 레시피 탭(잠금 3-상태 + 복사)
    RecipeLockOverlay.tsx    # 블러 + CTA
    CommentPanel.tsx         # 댓글 탭
    CommentItem.tsx          # 댓글/대댓글 1개(작성자배지·블라인드·답글토글)
    DetailStates.tsx         # 로딩/에러/404
  hooks/
    use-prompt-detail.ts     # useQuery(["prompt", id])
    use-detail-tab.ts        # nuqs ?tab= 상태
    use-recipe-access.ts     # 응답 접근정보 → 잠금 판정 소비
    use-comments.ts          # 댓글 조회(표시 전용)
    use-like-prompt.ts       # 추천 토글 뮤테이션(낙관적)
  api/
    prompt-detail.ts         # fetchPromptDetail(id)
    comment.ts               # 댓글 fetch(GET)
    like.ts                  # 추천 토글(POST)
  access.ts                  # 잠금 판정 순수 함수(테스트 대상)
  types.ts                   # PromptDetail, PromptComment, RecipeAccess
```

### 3. 도메인 타입 (초안)

```ts
import type { PromptSummary } from "@/features/gallery/types";

// 레시피 접근 정보 — BE가 내려주는 잠금 판정(프론트는 소비만)
export type RecipeAccess = {
  locked: boolean; // 블러 여부
  reason: "anonymous" | "premium" | null; // null이면 열람 가능
  previewLength?: number; // premium 부분노출 길이(문자 수 등)
};

export type PromptDetail = PromptSummary & {
  images: string[]; // 아웃풋 이미지들(워터마크 합성본). 최소 1
  descriptionBody: string; // 설명 탭 본문(리치 텍스트/마크다운)
  recipeBody: string; // 레시피 탭 본문(잠금 대상). locked면 프리뷰만 신뢰
  access: RecipeAccess;
  commentCount: number;
};

export type PromptComment = {
  id: string;
  author: { name: string; avatarUrl?: string };
  body: string;
  createdAt: string; // ISO
  isAuthor: boolean; // 게시글 작성자 배지
  isBlinded: boolean; // 블라인드 처리 → 본문 대신 안내문
  replies: PromptComment[]; // 1-depth 대댓글(피그마상 답글까지)
};
```

> 실제 응답이 `access`를 안 주면 프론트에서 `tier`+인증으로 임시 계산하는 폴백을 `access.ts`에 둔다(어댑터 격리).

### 4. 목 API (MSW)

`src/mocks/` 홈 시드(`PROMPT_SEED`)를 재사용해 **id 일관성**을 지킨다(홈에서 클릭한 카드 = 상세).

```
GET  /api/prompts/:id           → 200 PromptDetail | 404
GET  /api/prompts/:id/comments  → 200 PromptComment[]   (표시 전용)
POST /api/prompts/:id/like      → 200 { liked, likeCount }  (좋아요=추천 토글)
POST /api/prompts/:id/bookmark  → 200 { bookmarked }        (북마크 토글)
```

- 상세 목: 시드 카드 → `PromptDetail`로 확장(설명/레시피 더미 본문, 이미지 N장, `access`는 `tier`+요청 인증 헤더로 산출).
- 잠금 시뮬레이션: 목이 `access`를 계산해 내려줌 → 프론트 판정 로직 테스트 가능.
- 댓글 목: 블라인드/대댓글/작성자 배지를 포함한 시드(피그마 재현). **읽기 전용**(POST 없음).
- 좋아요/북마크 토글 목: 인메모리 상태로 liked·카운트 / bookmarked 를 토글해 반환(낙관적 갱신 롤백 테스트용).

### 5. 데이터 페칭 — `use-prompt-detail.ts`

```ts
useQuery({
  queryKey: ["prompt", id],
  queryFn: () => fetchPromptDetail(id),
  // 홈에서 프리페치된 요약이 있으면 initialData로 첫 페인트 개선(선택)
});
```

- 홈 목록 캐시(`["prompts", query]`)의 해당 카드로 `placeholderData`/`initialData` 구성 → 제목·썸네일 즉시 표시(선택 최적화).

### 6. 탭 상태 — `use-detail-tab.ts` (nuqs)

`?tab=description|recipe|comments`(기본 `description`). 공유·뒤로가기 유지, analytics에 탭 함께 기록 가능. 잘못된 값은 기본값으로 폴백.

### 7. 레시피 잠금 — `access.ts` + `RecipePanel`

```ts
// 순수 함수(테스트 대상): 응답 access(우선) → 없으면 tier+auth 폴백
export function resolveRecipeAccess(detail, authStatus): RecipeAccess;
```

- `locked=false` → 본문 전체 + `복사하기` 버튼.
- `locked=true, reason="anonymous"` → 전체 블러 + `로그인하고 프롬프트 보기`.
- `locked=true, reason="premium"` → `previewLength`까지 노출 후 블러 + `포인트로 전문 보기`.
- CTA 클릭: 실제 흐름(로그인 모달·포인트 결제)은 스텁, `prompt_unlock_click` 지표만 발송.

**recipeBody 계약(우회 방지 — 확정):** 블러는 장식일 뿐, 잠금 시 **진짜 전문은 DOM에 없어야** 한다. 따라서 응답의 `recipeBody` 는 _열람 가능한 만큼만_ 담는다.

| 상태                   | 응답 `recipeBody`           | 프론트 렌더                             |
| ---------------------- | --------------------------- | --------------------------------------- |
| 비로그인               | 앞 `previewLength` 미리보기 | 미리보기 노출 + 그 아래 더미 블러 + CTA |
| 프리미엄(미결제)       | `""`(미전송)                | **더미 플레이스홀더** 전체 블러 + CTA   |
| 열람(무료·로그인/구매) | 전문                        | 블러 없이 전문                          |

- **더미 블러 필러는 프론트(`RecipePanel`) 상수**다. BE 전문에 절대 의존하지 않는다.
- **로그인/구매 시 전문 획득**: `usePromptDetail` 이 뷰어 상태를 요청에 실어, 인증 상태가 바뀌면 쿼리가 리페치 → BE 가 전문을 내려주면 블러 해제.

### 8. 복사·추천 & analytics

- `복사하기` → `navigator.clipboard.writeText(recipeBody)` + `track("prompt_copy_click", { prompt_id, user_status, source: "detail" })` (이벤트 **이미 존재**).
- **좋아요(=추천) 토글** → `useLikePrompt`(목 `POST /:id/like`) + 낙관적 카운트 갱신, 실패 시 롤백. 추천수는 이 카운트의 읽기 표시.
- **북마크 토글** → `useBookmark`(목 `POST /:id/bookmark`) + 낙관적 갱신, 실패 시 롤백.
- **신규 이벤트 2종**(analytics 이벤트 맵 확장):
  - `prompt_view` : 상세 진입 시 1회. `{ prompt_id, user_status, tier }`
  - `prompt_unlock_click` : 잠금 CTA 클릭. `{ prompt_id, reason, user_status }`

### 9. 댓글 — `CommentPanel` (표시 전용, 확정)

피그마 구성: 최상위 댓글 → "N개의 답글" 펼침 → 대댓글 목록, 각 항목에 프로필·작성자 배지·작성일·⋮ 메뉴(자리만), 블라인드 항목은 "블라인드 처리된 댓글입니다." 대체, 하단 입력창(비활성/placeholder).

- 목 데이터로 트리 렌더 + 블라인드/대댓글(1-depth)/작성자 배지.
- **작성·삭제·신고는 이번 범위 밖**(입력창은 자리만, submit no-op). 후속 브랜치에서 작성(B)·모더레이션(C) 확장.

### 10. 상태 처리

| 상태         | 처리                                   |
| ------------ | -------------------------------------- |
| 로딩         | 좌 이미지 + 우 텍스트 스켈레톤         |
| 에러         | 재시도 버튼                            |
| 404(없는 id) | not-found 안내 + 홈 이동               |
| 레시피 잠금  | 블러 + 조건부 CTA(위)                  |
| 댓글 없음    | "아직 작성된 댓글이 없어요" (551:3330) |

### 11. 테스트 (Vitest) — TDD

TDD로 **테스트를 먼저** 작성하고 하나씩 통과시킨다. 우선순위 대상:

| 대상                  | 케이스                                                                                |
| --------------------- | ------------------------------------------------------------------------------------- |
| `resolveRecipeAccess` | 비로그인→anonymous 잠금 / 무료→열람 / 프리미엄 미구매→premium 잠금 / 응답 access 우선 |
| `use-detail-tab`      | tab 값 URL 반영, 잘못된 값→기본값 폴백                                                |
| 목 핸들러             | `GET /:id` 시드 매핑·존재하는 id/404, access가 tier로 산출                            |
| `RecipePanel`         | 잠금 상태별 CTA 렌더 분기, 열람 시 복사 버튼 노출                                     |
| 복사                  | 클릭 시 clipboard write + `track("prompt_copy_click")`(track mock)                    |
| 추천 토글             | 클릭 시 낙관적 카운트 증감, 목 실패 시 롤백                                           |
| 잠금 CTA              | 클릭 시 `track("prompt_unlock_click", { reason })`                                    |
| 댓글 트리             | 대댓글 중첩·블라인드 렌더·작성자 배지                                                 |

## 이외 고려 사항

### 상세 경로 = `/prompts/[id]` (확정)

PS-29 `promptDetailHref(id)`가 이미 `/prompts/${id}`를 반환. 카드 `<Link>`가 이 경로를 가리키므로 라우트만 채우면 연결된다.

### 잠금은 BE 판정 신뢰 (프론트 우회 방지)

`recipeBody` 전문을 응답에 담고 CSS 블러만 씌우면 DOM에서 노출된다. 잠금 시 **응답이 프리뷰/마스킹된 본문만** 내려주는 걸 원칙으로 하고, 프론트는 `access`로 렌더만 결정한다. 목도 이 원칙을 따른다.

### 카테고리 상수·라벨 재사용

태그(등급·직군·태스크·모델·결과물타입)는 `gallery/categories.ts` 라벨 맵을 그대로 쓴다(단일 출처).

### 반응형

홈과 동일하게 1280px 컨테이너 기준으로 골격을 잡고, 좁은 폭에서 좌우 2단 → 세로 스택 전환은 시안 확정 후. 폭 값은 유틸/토큰으로 모아둔다.

## 리스크와 대응

| 리스크                   | 영향                        | 대응                                              |
| ------------------------ | --------------------------- | ------------------------------------------------- |
| BE 상세/댓글 스펙 미확정 | 응답 shape 불일치           | 목을 타입으로 고정, `access.ts`·api 어댑터로 격리 |
| 포인트/결제 미구현       | 프리미엄 잠금해제 흐름 불가 | CTA 스텁 + 지표만, 트랜잭션은 후속                |
| 잠금 우회                | 전문이 DOM 노출             | 잠금 시 응답이 프리뷰만 제공(BE 원칙)             |
| 댓글 범위 과다           | 일정 초과                   | 표시전용(A)부터, 작성/모더레이션 단계적           |
| 인증/포인트 어댑터 미완  | 상태 분기 확정 불가         | `useAuthStatus` 폴백 + `access` 응답 우선         |
| Next.js 16 라우팅 변경점 | not-found·params 관례 상이  | `node_modules/next/dist/docs/` 확인 후 작성       |

## 마일스톤

| 단계 | 내용                                                                          |
| ---- | ----------------------------------------------------------------------------- |
| 1    | 상세 타입 + `access.ts` + MSW `GET /:id`·`/comments`·`/like` 목(+테스트)      |
| 2    | `usePromptDetail` + 라우트/셸 + 로딩·에러·404                                 |
| 3    | `DetailHeader`(제목·작성자·메타·태그·벨/⋮ 자리) + `OutputCarousel`(다중)      |
| 4    | `DetailTabs`(?tab=) + `DescriptionPanel`                                      |
| 5    | `RecipePanel` 잠금 3-상태 + 복사(`prompt_copy_click`) + `prompt_unlock_click` |
| 6    | 추천 토글(`useLikePrompt` 낙관적) + `prompt_view`                             |
| 7    | `CommentPanel`(표시 전용)                                                     |
| 8    | Vitest 마감 + 지표 점검                                                       |

## 확정된 사항 (2026-07-21)

1. **댓글 범위** — **표시 전용(A)**. 목 트리 렌더 + 블라인드/대댓글(1-depth)/작성자 배지. 작성·삭제·신고는 후속.
2. **프리미엄 잠금** — **블러 + CTA 스텁**까지. 포인트 차감 트랜잭션은 후속(CTA는 지표만).
3. **레시피 잠금 판정** — **응답 `access` 신뢰**. 프론트는 렌더만. 목이 tier+인증으로 산출. 폴백 계산은 어댑터로만.
4. **탭 상태** — **`?tab=` URL화**(nuqs). 공유·뒤로가기 유지.
5. **이미지** — **다중 캐러셀 포함**(`images[]`, `1/N`, 이전/다음).
6. **좋아요·북마크** — 둘 다 **백엔드 토글**(낙관적 갱신). 좋아요=추천 카운트 증감, 추천수는 표시 전용. 북마크는 별도 저장 토글. _(07-22 개정: 추천 단독 토글 → 좋아요/북마크 분리)_
7. **신규 analytics** — **`prompt_view` + `prompt_unlock_click` 둘 다 신설**. 복사는 기존 `prompt_copy_click` 재사용.
8. **메타행 벨/⋮** — **자리만 두기**(클릭 no-op 스텁). 구독·신고·수정/삭제 동작은 후속.
9. **feature 폴더** — `features/prompt-detail` 별도(공용 타입은 `gallery`에서 import). _(구현 착수 시 최종 확인)_

## 남은 오픈 질문 (BE 대조)

- `GET /api/prompts/:id` 응답에 `access`(잠금 판정)를 BE가 내려주는가, 프론트 계산인가.
- 잠금 시 `recipeBody`를 프리뷰/마스킹해서 주는가(우회 방지).
- 댓글 페이지네이션 방식(전체 vs 페이지/커서), 대댓글 depth 제한.
- 이미지 다중 여부와 필드명(`images[]` vs 단일 `thumbnailUrl`).

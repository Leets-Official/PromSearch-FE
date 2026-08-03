# features/gallery/

홈 화면 = **사이드바 + 프롬프트 갤러리** 기능 모듈. (PS-29)

아웃풋(썸네일) 우선 카드 그리드를 검색·필터·페이지네이션으로 탐색한다. BE 스펙 확정 전에는
`src/mocks` 의 MSW 목(`GET /api/prompts`)으로 동작한다.

## 구조

```
gallery/
  types.ts                 # 도메인 타입 (PromptSummary, GalleryQuery, PromptListResponse …)
  categories.ts            # 직군/태스크/AI모델/결과물타입/등급 상수 — 단일 출처
  api/
    prompt.ts              # toSearchParams(필터→쿼리스트링) + fetchPrompts
  hooks/
    use-gallery-filters.ts # nuqs 기반 필터/페이지 URL 상태 (+ 세터)
    use-prompt-list.ts     # useQuery(+keepPreviousData) 목록 조회
  components/
    GalleryTopBar.tsx      # 헤더: 로고·검색(디바운스)·업로드·인증영역
    CategoryNav.tsx        # 사이드바: 홈/인기/직군별
    GalleryFilters.tsx     # 상단 토글 필터: 태스크/AI모델/결과물타입 (멀티)
    GalleryGrid.tsx        # 카드 그리드 / 빈 상태 분기
    GalleryCard.tsx        # PromptCard 래핑 + 노출/클릭 트래킹 + 상세 링크
    GalleryPagination.tsx  # 공통 Pagination 을 page 상태에 연결
    GalleryStates.tsx      # 로딩(스켈레톤)/빈/에러
    HeaderAuthArea.tsx     # 헤더 인증영역: 비회원=로그인 / 회원=알림+프로필
```

라우트/셸은 `src/app/(main)/{layout,home/page}.tsx`. 인증 상태는 `src/hooks/use-auth-status.ts`
어댑터에서 주입받는다(로그인 팀원 연동 전 `anonymous` 폴백).

## 핵심 규칙 (기획/BE 회의 확정)

- **노출**: `status=ACTIVE` 만 (DRAFT/HIDDEN 제외).
- **정렬**: 홈(nav=home)=최신순(`createdAt DESC`) / 인기(nav=popular)=**좋아요순**(`like_count DESC`).
- **필터**: 사이드바 직군(단일) + 상단 태스크/AI모델/결과물타입(멀티). **축 내부 OR, 축 간 AND**.
- **필터/검색 변경 시 `page`는 1로 리셋** (페이지 이동만 예외).
- **필터·페이지 상태는 URL(nuqs)** — 공유·뒤로가기·새로고침에서 유지.
- **권한 경계는 회원 여부뿐**: 헤더 표시(로그인 ↔ 프로필) + analytics `user_status`.
  카드 클릭은 비회원/회원 모두 `/prompts/[id]` 이동(블러/로그인 유도는 상세 브랜치 몫).
  tier(무료/프리미엄/마스터)·등급(Node~Origin)·크리에이터 게이팅은 홈에 없음.

## analytics

- 카드 노출: `useCardImpression`(50%·1초) → `card_impression`
- 카드 클릭: `track("card_click", { source: "home", … })`

## 테스트

```bash
source ~/.nvm/nvm.sh && nvm use
pnpm test src/features/gallery
```

- 질의 계약(필터 AND/OR·정렬·페이지네이션)은 `src/mocks/prompt-query.test.ts` 에서 순수 함수로 고정.
- 진리표는 **긍정+부정 케이스**를 함께 넣어, 조건을 반대로 짜면 깨지도록 설계.

## 후속(별도 브랜치)

- 상세 페이지(`/prompts/[id]`) — 지금은 링크만.
- 북마크 토글 · 작성자→프로필 링크(회의서 MVP 확정) — 카드에 얹을 예정.
- 반응형 좁은 폭(2열/1열·사이드바 드로어) — 시안 확정 후.

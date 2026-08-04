# features/gallery/

홈 화면 = **사이드바 + 프롬프트 갤러리** 기능 모듈. (PS-29)

아웃풋(썸네일) 우선 카드 그리드를 검색·필터·페이지네이션으로 탐색한다.
목록은 **실 BE**(`GET /api/v1/home/prompts/*`)에 붙어 있다.

## ⚠️ 현재 연동 상태 (임시 조치 있음)

서버가 아직 지원하지 않는 축을 FE 가 메꾸고 있다. 요청서
[`docs/api-requests-be.md`](../../../docs/api-requests-be.md) **H-1 · C-1** 이 반영되면 전부 걷어낸다.

| 화면 기능                      | 지금                                        | API 나온 뒤               |
| ------------------------------ | ------------------------------------------- | ------------------------- |
| 인기 탭(좋아요순)              | `GET /home/prompts/popular` ✅ 정상         | 그대로                    |
| 직군별 탭                      | `GET /home/prompts/jobs/{jobTagId}` ✅ 정상 | 그대로                    |
| 직군 → `jobTagId`              | `tag-ids.ts` **하드코딩** (BE 회신 대기)    | 태그 목록 API 조회        |
| 홈 기본 탭(최신순 전체)        | **최신순 API 부재** → 인기순으로 대신 채움  | `sort=LATEST`             |
| 검색 · 태스크/모델/결과물 필터 | **서버 미지원** → 50개 받아 클라이언트 필터 | 쿼리 파라미터로 서버 위임 |

클라이언트 필터 경로의 한계: 서버가 준 **첫 50개 안에서만** 찾는다(그 뒤 결과는 누락되고,
검색어는 목록 응답에 `description` 이 없어 **제목만** 훑는다). 판정 로직은 `applyClientFilters` 에
모아두고 테스트로 고정했으므로, 서버 필터가 붙으면 이 함수와 `hasClientFilters` 만 지우면 된다.

### 🚨 BE 장애로 임시 목이 켜져 있다 (2026-08-05)

실서버(`api.promsearch.kr`)가 TCP 는 받지만 HTTP 응답을 돌려주지 않아(`socket hang up` / `ECONNRESET`)
홈을 확인할 수 없어, **실 엔드포인트와 똑같은 경로·응답 형태**로 MSW 목을 세워 뒀다.

- `src/mocks/home-prompt-cards.ts` — 기존 갤러리 시드를 서버 카드 모양(`ApiPromptCard`)으로 되돌림
- `src/mocks/handlers.ts` 의 `/api/v1/home/prompts/popular`, `/api/v1/home/prompts/jobs/:jobTagId`

봉투(`{ success, code, message, result }`)까지 서버와 동일해서 `api/map.ts` 변환·페이지 계산·
클라이언트 필터가 실제 계약대로 검증된다. **BE 복구 시 위 파일과 핸들러 두 개를 지우면** 그대로 실서버로 붙는다
(목이 없는 요청은 Next rewrites 로 통과하는 구조라 다른 수정이 필요 없다).

목이 살아 있는 동안에는 Dev 툴바의 엣지 상태(빈/로딩/에러) 강제도 홈에서 동작한다.
목을 지우고 실서버로 붙는 순간부터는 헤더를 읽어줄 주체가 없어져 홈에서만 동작하지 않는다.

## 구조

```
gallery/
  types.ts                 # 도메인 타입 (PromptSummary, GalleryQuery, PromptListResponse …)
  categories.ts            # 직군/태스크/AI모델/결과물타입/등급 상수 — 단일 출처
  tag-ids.ts               # 직군 → BE 태그 ID 하드코딩(임시) — 태그 API 나오면 삭제
  api/
    dto.ts                 # BE 응답 타입(HOME-001/002 의 result 그대로)
    map.ts                 # ApiPromptCard → PromptSummary 변환(순수)
    prompt.ts              # 엔드포인트 호출 + 페이지 변환 + 클라이언트 필터(임시)
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

- 응답 매핑·클라이언트 필터·페이지 변환은 `api/prompt.test.ts` 에서 고정
  (MSW 로 `/api/v1/home/prompts/*` 만 세우고 실제 함수를 호출하는 방식).
- 진리표는 **긍정+부정 케이스**를 함께 넣어, 조건을 반대로 짜면 깨지도록 설계.
- `src/mocks/prompt-query.test.ts` 는 목 시절의 질의 계약(축 내부 OR·축 간 AND)을 남겨둔 것으로,
  서버 필터 스펙을 BE 에 설명할 때의 근거로 유지한다.

## 후속(별도 브랜치)

- 상세 페이지(`/prompts/[id]`) — 지금은 링크만.
- 북마크 토글 · 작성자→프로필 링크(회의서 MVP 확정) — 카드에 얹을 예정.
- 반응형 좁은 폭(2열/1열·사이드바 드로어) — 시안 확정 후.

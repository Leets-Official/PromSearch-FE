# [PS-29] 홈 화면 — 사이드바 + 프롬프트 갤러리 뷰

참고: [뱅크샐러드의 특별한 스펙, '테크 스펙'](https://blog.banksalad.com/tech/we-work-by-tech-spec/)

## 요약

PromSearch의 첫 진입 화면인 홈을 구현한다. 상단 헤더(로고·검색·업로드·알림/프로필), 좌측 카테고리 사이드바, 그리고 메인의 프롬프트 갤러리 그리드 + 페이지네이션으로 구성된다.

이미 만들어진 공통 컴포넌트(`AppHeader`, `Sidebar`, `SearchBar`, `PromptCard`, `Pagination` 등)와 analytics 레이어(`useCardImpression`)를 조립해, 비회원 사용자도 아웃풋(썸네일) 우선으로 프롬프트를 탐색할 수 있게 한다.

BE API 확정 전이므로 MSW 목으로 목록/필터/페이지네이션을 정의해 병렬 개발하고, 필터·페이지 상태는 URL(nuqs)로 관리해 공유·뒤로가기가 동작하게 한다.

## 배경

PromSearch는 결과물 이미지를 먼저 보여주고 프롬프트 선택과 가입 전환을 유도하는 프리토타입이다. 홈은 그 가설("아웃풋 우선 노출이 전환을 높이는가")이 처음 검증되는 화면으로, 사용자가 갤러리에서 카드를 얼마나 노출·클릭하는지가 핵심 지표다.

현재 상태:

- 라우트는 placeholder `src/app/page.tsx` 하나뿐이다.
- 디자인 시스템과 공통 컴포넌트(`src/components/ui/*`)는 [PS-32]에서 정비 완료됐다.
- analytics 레이어와 `useCardImpression` 훅은 [PS-17]에서 준비됐으나 실제 카드 UI에는 아직 연결되지 않았다.

즉 홈 구현은 "이미 있는 부품을 화면으로 조립하고, 지표 측정 훅을 실제 카드에 연결"하는 작업이 중심이다.

로그인/온보딩은 다른 팀원 담당이며, 프롬프트 게시물 CRUD(업로드/수정/삭제)는 후속 브랜치에서 별도 스펙으로 진행한다. 이 문서는 홈(조회) 범위에 한정한다.

### 비회원 / 회원 상태

이 제품은 비회원과 회원 화면이 갈린다. 피그마 기준 명확한 분기는 **프롬프트 상세 페이지**다.

- `프롬프트 상세 - 비로그인` : 프롬프트 본문 잠금(블러) + "로그인하고 전체 프롬프트 보기"
- `프롬프트 상세 - 로그인, 무료` : 전체 열람
- `프롬프트 상세 - 로그인, 프리미엄` : 포인트 차감으로 잠금 해제

**홈은 단일 프레임**이며, 비회원/회원 차이는 다음 두 지점에서만 나타난다.

1. **헤더 인증 영역** : 비회원 → 로그인 버튼 / 회원 → 알림 + 프로필 아바타
2. **인증이 필요한 액션** : `업로드` 클릭 시 비회원은 로그인 게이트(CRUD 브랜치 몫)

**카드 클릭에는 권한 분기가 없다.** 비회원/회원 모두 카드 클릭 시 `/prompts/[id]` 상세로 이동한다(피그마 `프롬프트 상세 - 비로그인` 프레임 49:591 존재). 로그인 유도는 상세 페이지에서 본문 일부만 노출 + 블러로 처리하며, 이는 상세 브랜치 몫이라 이번 범위 밖이다.

갤러리 브라우징(목록 조회·필터·검색·페이지 이동)과 상세 진입 자체는 비회원/회원 모두 열려 있다. 결과적으로 **홈 스코프의 권한 경계는 "헤더 표시(로그인 버튼 vs 프로필)"와 analytics `user_status`뿐**이다. tier(무료/프리미엄/마스터)·등급(Node~Origin)·크리에이터(Origin) 게이팅은 상세/업로드/마이페이지에서 일어나므로 이번 범위 밖이다.

> 인증 상태(`isAuthenticated`, 사용자 정보)는 로그인 담당 팀원이 제공하는 소스(예: auth store/세션 훅)에 의존한다. 이번 작업은 그 인터페이스를 **주입받아 소비만** 하고, 미구현 구간은 `anonymous`로 폴백한다.

## 목표

- 헤더 + 사이드바 + 메인을 감싸는 공용 레이아웃 셸을 만든다(후속 화면도 재사용).
- 좌측 사이드바에 확정된 카테고리 네비게이션을 구성한다.
  - `홈` / `인기 프롬프트` / `직군별`(학생·직장인·기획자·개발자·디자이너·자영업자)
- 메인에 프롬프트 갤러리 그리드를 반응형(3열 기준)으로 렌더한다.
- 상단 필터 탭(`태스크` / `모델` / `결과물 타입`)을 구성한다.
- 하단에 **페이지네이션**(공통 `Pagination` 컴포넌트)을 붙인다.
- 사이드바 선택·필터·검색어·페이지 상태를 URL(nuqs)로 관리한다.
- BE 스펙 확정 전, MSW 목으로 `GET /api/prompts`(필터·페이지네이션 포함)를 정의한다.
- TanStack Query로 페이지 단위 목록을 가져온다.
- 헤더 인증 영역을 인증 상태에 따라 조건부 렌더(로그인 버튼 ↔ 알림+프로필)한다.
- 각 카드에 `useCardImpression`을 연결해 유효 노출(`card_impression`)을 발송한다.
- 카드 클릭 시 `card_click`을 발송하고 상세 링크로 이동한다.
- 로딩(스켈레톤/스피너)·빈 상태·에러 상태를 처리한다.
- 필터/페이지 → 쿼리 키 매핑, 그리드 렌더의 핵심 로직을 Vitest로 검증한다.

## 목표가 아닌 것

- 프롬프트 게시물 CRUD(업로드/수정/삭제 폼과 API)는 이번 범위가 아니다(후속 브랜치).
- 프롬프트 상세 페이지는 구현하지 않는다. **카드 클릭 시 상세 경로로 링크만 걸어둔다.**
- 상세의 비회원/회원 잠금(블러·포인트 차감) 정책은 상세 페이지 몫으로 범위 밖이다.
- 로그인/온보딩/소셜 로그인, 인증 상태 store 자체 구현은 다른 팀원 담당으로 범위 밖이다.
- 업로드 버튼의 실제 동작(로그인 게이트 모달·업로드 라우트)은 CRUD 브랜치에서 다룬다. 이번엔 버튼 배치와 인증 상태에 따른 헤더 분기까지만.
- 마이페이지/수익/설정, 관리자(신고 게시글·유저 관리)는 범위 밖이다.
- 실제 backend 연동은 하지 않는다. MSW 목으로 대체하고, 스펙 확정 시 교체한다.
- "인기 프롬프트"의 큐레이션 알고리즘은 구현하지 않는다(정렬 파라미터만 전달, 랭킹은 BE/목 몫).

## 계획

### 0. 화면 구조(홈 프레임 49:589 기준)

```txt
┌───────────────────────────────────────────────────────────────┐
│ [로고]  [🔍 검색어를 입력해주세요]   [+ 업로드]  [알림][프사]      │  ← AppHeader (h-20)
│                                     비회원이면 → [로그인]         │
├──────────────┬────────────────────────────────────────────────┤
│ 홈            │  오늘의 추천                                      │
│ 인기 프롬프트   │  [태스크 전체 ▾][모델 전체 ▾][결과물 타입 전체 ▾]   │ ← 필터 탭
│               │  ┌────┐ ┌────┐ ┌────┐                          │
│ 직군별         │  │카드│ │카드│ │카드│   ← PromptCard 3열 그리드    │
│  학생          │  └────┘ └────┘ └────┘                          │
│  직장인        │  ┌────┐ ┌────┐ ┌────┐                          │
│  기획자        │  │카드│ │카드│ │카드│                            │
│  개발자        │  └────┘ └────┘ └────┘                          │
│  디자이너       │            ‹ 1 2 3 4 5 ›   ← Pagination         │
│  자영업자       │                                                │
└──────────────┴────────────────────────────────────────────────┘
  Sidebar(w-50)              main
```

카드 구성(시안): 썸네일(16:9) → `프롬프트 이름` → `프롬프트 설명 간단하게 적습니다` → `업로드 2026.07.01` → 태그(사용AI·직군·태스크·결과물타입, 예: `ChatGPT` `직장인` `PPT` `이미지`).

### 1. 라우트 셸 (공용 레이아웃)

App Router route group으로 헤더+사이드바 셸을 만들고 홈 페이지를 그 안에 둔다. 후속 화면(상세·마이페이지)이 같은 셸을 재사용한다.

```txt
src/app/
  page.tsx          # 루트(/) = 랜딩 페이지 — 범위 밖. 기존 placeholder 유지
  (main)/
    layout.tsx      # AppHeader + Sidebar + <main> 그리드 셸 (홈/상세/마이 공용)
    home/
      page.tsx      # /home = 홈 갤러리
```

- 루트 `/`는 **랜딩**이므로 이번 범위 밖(추후/타 팀원). `src/app/page.tsx` placeholder는 건드리지 않는다.
- 홈 갤러리는 `(main)/home/page.tsx` → 경로 `/home`. `(main)` route group은 경로에 안 붙으므로 셸만 공유된다.
- 랜딩(`/`)은 `(main)` 밖이라 헤더+사이드바 셸이 적용되지 않는다(랜딩은 자체 레이아웃). 사이드바 `홈` 메뉴는 `/home`으로 링크.

- `layout.tsx`: `AppHeader`(center 슬롯 = `SearchBar`, end 슬롯 = 업로드 + 인증영역) + `Sidebar` + `{children}`.
- 헤더/사이드바는 서버 컴포넌트로 두되, 상호작용(검색 입력·필터·인증 분기)이 필요한 부분만 `"use client"` 하위 컴포넌트로 분리.
- 헤더 end 슬롯의 인증 영역은 별도 `HeaderAuthArea`(client)로 분리 — 인증 상태에 따라 로그인 버튼 ↔ 알림+프로필.

**레이아웃 폭 / 반응형 (디자이너 1280px 기준):**

- 디자이너 작업 기준은 **frame width 1280px**. 콘텐츠는 **최대 1280px 고정폭 컨테이너**(`max-w-[1280px] mx-auto`)에 담고, 그보다 넓은 해상도에서는 좌우를 배경색(`bg-bg-primary`) 여백으로 흘린다.
- 즉 `헤더 내부`와 `사이드바+메인` 모두 같은 1280px 컨테이너 안에서 정렬된다. 컨테이너 바깥(초광폭 모니터의 좌우)은 흰 여백.
- 반응형 breakpoint 시안이 곧 나오므로, **폭 값을 하드코딩으로 흩뿌리지 않고** 컨테이너/그리드 열 수를 토큰·유틸로 모아 나중에 breakpoint만 추가하면 되게 설계한다.
  - 갤러리 그리드는 `grid`로 두고 열 수를 반응형 클래스로 제어(현재 3열 기준, 좁은 폭에서 2열/1열은 시안 확정 후).
  - 사이드바는 데스크톱 고정 노출. 태블릿/모바일에서의 접힘(드로어)은 반응형 시안 확정 후 별도 처리 → 이번엔 데스크톱(≥1280px 기준) 레이아웃을 우선 완성하고 축소 대응 훅만 열어둔다.

```txt
초광폭 화면
│◀──── 흰 여백 ────▶│◀═══ 1280px 컨테이너 ═══▶│◀──── 흰 여백 ────▶│
                    [헤더 / 사이드바+갤러리]
```

### 2. feature 폴더 구성

`features/README.md` 컨벤션에 맞춰 홈 갤러리 기능을 모은다.

```txt
src/features/gallery/
  components/
    GalleryGrid.tsx        # 카드 그리드
    GalleryCard.tsx        # PromptCard 래핑 + impression/click 트래킹 + Link
    GalleryFilters.tsx     # 상단 필터 탭(태스크/모델/결과물 타입)
    GalleryPagination.tsx  # 공통 Pagination 래핑 + page 상태 연결
    CategoryNav.tsx        # 사이드바 카테고리 메뉴 (Sidebar 조립)
    GalleryStates.tsx      # 로딩/빈/에러 상태
  hooks/
    use-prompt-list.ts     # useQuery 래퍼(페이지 단위)
    use-gallery-filters.ts # nuqs 기반 필터/페이지 상태
  api/
    prompt.ts              # fetch 래퍼 (목록 조회)
  categories.ts            # 직군/태스크/모델/결과물타입 상수 (단일 출처)
  types.ts                 # Prompt 도메인 타입
```

> 상세에서도 쓰게 될 `Prompt` 타입 등은 공유 시 `src/types`로 승격한다.

### 3. 도메인 타입 정의

`features/gallery/types.ts`:

```ts
// 결과물(타입): 텍스트/이미지 — 홈 "결과물 타입" 필터의 값
export type OutputType = "text" | "image";
// AI 모델 — "기타"는 자유 입력(예: 뤼튼)
export type AiModel = "chatgpt" | "gemini" | "claude" | "etc";
// 태스크 — PPT/레포트/이메일/회의록/보고서/이미지 생성
export type Task = "ppt" | "report" | "email" | "meeting_notes" | "document" | "image_gen";
// 직군 — 학생/직장인/기획자/디자이너/개발자/자영업자
export type JobCategory =
  "student" | "worker" | "planner" | "designer" | "developer" | "self_employed";
// 콘텐츠 타입(접근 등급) — 무료/프리미엄/마스터. 상세 잠금 정책 근거(이번 범위 밖)
export type Tier = "free" | "premium" | "master";

export type PromptSummary = {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string; // 워터마크가 합성된 이미지 URL (BE 처리본)
  tags: string[]; // 카드에 노출할 태그 라벨
  model: AiModel;
  modelEtcName?: string; // model === "etc" 일 때 직접입력명(예: 뤼튼)
  tasks: Task[]; // 복수 선택
  jobCategories: JobCategory[]; // 복수 선택
  outputType: OutputType; // 텍스트/이미지
  tier: Tier; // 무료/프리미엄/마스터 — 카드 배지·상세 잠금 근거
  author: { name: string; avatarUrl?: string };
  stats: { views: number; likes: number };
  createdAt: string; // ISO
};

export type PromptListResponse = {
  items: PromptSummary[];
  page: number; // 현재 페이지(1-based)
  totalPages: number; // 전체 페이지 수 → Pagination 렌더 근거
  totalCount: number;
};
```

### 4. 목 API (MSW)

BE 확정 전 `src/mocks/handlers.ts`에 목록 핸들러를 추가한다.

```txt
GET /api/prompts?nav=&job=&task=&model=&type=&q=&sort=&page=&size=
→ 200 PromptListResponse
```

- `nav`: `home` | `popular` | `job` (사이드바 선택). `nav=job`이면 `job`으로 직군 필터, `nav=popular`면 인기 정렬.
- **status=ACTIVE 게시글만** 반환 (DRAFT/HIDDEN 제외 — F-2.5, F-3.4).
- **정렬**: `nav=home`/기본 = 최신 게시순(`createdAt DESC`, 기술명세 F-1.1). `nav=popular` = **좋아요(`like_count`) 내림차순**(BE 회의 확정 — 조회수/복사수는 기준 아님, 조회수는 추후 검토).
- `task`/`model`/`type`은 멀티값(콤마 구분) 가능. 축 내 OR·축 간 AND로 필터.
- 시드 데이터(더미 카드 ~50개, tier·status·카운트 섞어서)로 페이지네이션·필터·정렬 동작 확인.
- 응답 shape은 위 `PromptListResponse`를 그대로 따른다 → 실제 API 교체 시 프론트 변경 최소화.

### 5. 데이터 페칭 — `use-prompt-list.ts`

TanStack Query `useQuery`로 페이지 단위 조회(페이지네이션이므로 `useInfiniteQuery` 아님).

```ts
useQuery({
  queryKey: ["prompts", filters], // filters: {nav, job, task, model, type, q, sort, page}
  queryFn: () => fetchPrompts(filters),
  placeholderData: keepPreviousData, // 페이지 이동 시 깜빡임 방지
});
```

- `queryKey`에 필터+페이지를 포함 → 조건 변경 시 자동 리페치·캐싱.
- 응답의 `totalPages`로 `Pagination` 렌더.

### 6. 필터/페이지 상태 — `use-gallery-filters.ts` (nuqs)

사이드바 선택/필터/검색어/정렬/페이지를 URL 쿼리로 관리한다.
예: `/?nav=job&job=designer&type=image&q=포스터&page=2`

- 장점: 새로고침·공유·뒤로가기에서 상태 유지, analytics에 조건 함께 기록 가능.
- 사이드바 클릭 → `nav`(+`job`), 필터 탭 → `task`/`model`/`type`(=결과물타입), 검색바 입력(디바운스) → `q`, Pagination → `page`.
- **필터/검색 변경 시 `page`는 1로 리셋**한다.
- **상단 필터(태스크/모델/결과물타입)는 멀티 선택** (기술명세 F-1.1). 매칭 규칙: **축 내부는 OR, 축 간은 AND**. 예: `(task ∈ {ppt,report}) AND (model ∈ {chatgpt}) AND (outputType ∈ {image})`. 아이템의 `jobCategories`/`tasks`도 복수값이라 "교집합 존재" 매칭.
- 사이드바 **직군은 단일 선택**(라우팅형), 상단 필터와 AND 결합.
- 태그 미선택 시 전체 `ACTIVE` 게시글 노출.
- `콘텐츠 타입(무료/프리미엄/마스터=tier)`은 홈 필터 축이 아니다. MVP에서 홈/탐색에 tier 필터 추가는 TBD(PRD 21). 카드에 tier 잠금/배지도 노출하지 않는다.

### 7. 갤러리 카드 — `GalleryCard.tsx` (analytics 연결)

공통 `PromptCard`를 감싸 노출/클릭 추적과 이동을 붙인다.

```tsx
const ref = useCardImpression({
  cardId: prompt.id,
  position: index + 1,
  userStatus, // 인증 상태 주입값(anonymous | authenticated)
  source: "home",
});

return (
  <PromptCard
    ref={ref}
    title={prompt.title}
    description={prompt.description}
    tags={prompt.tags}
    thumbnailSrc={prompt.thumbnailUrl}
    author={prompt.author}
    render={<Link href={`/prompts/${prompt.id}`} />} // 상세는 후속, 링크만 걸어둠
    onClick={() =>
      track("card_click", {
        card_id: prompt.id,
        position: index + 1,
        user_status: userStatus,
        source: "home",
      })
    }
  />
);
```

> `PromptCard`는 `render` prop 다형성을 지원하므로 `<Link>`로 교체해 접근성/프리페치를 얻는다. 상세 페이지는 아직 없지만 클릭 이동 경로(`/prompts/[id]`)를 확정해 링크만 연결한다. `position`은 페이지 내 렌더 순서(1-based).

### 8. 상태 처리

| 상태             | 처리                                                        |
| ---------------- | ----------------------------------------------------------- |
| 최초 로딩        | 카드 스켈레톤 그리드(또는 `Spinner`)                        |
| 페이지 이동 로딩 | `keepPreviousData`로 이전 페이지 유지 + 상단/버튼 로딩 표시 |
| 빈 결과          | "조건에 맞는 프롬프트가 없어요" 안내 + 필터 초기화 버튼     |
| 에러             | 재시도 버튼                                                 |

### 9. 테스트 (Vitest)

| 대상                  | 케이스                                                    |
| --------------------- | --------------------------------------------------------- |
| `use-gallery-filters` | 필터/페이지 값이 쿼리 키에 반영, 필터 변경 시 page=1 리셋 |
| `GalleryGrid`         | items 렌더/빈 상태 분기                                   |
| `GalleryCard`         | 클릭 시 `track("card_click")` 호출(track mock)            |
| 목 핸들러             | job/task/type 필터·page 파라미터가 응답에 반영되는가      |

## 이외 고려 사항

### 페이지네이션 (확정)

홈은 무한 스크롤이 아니라 **페이지네이션**으로 확정. 공통 `Pagination` 컴포넌트를 사용하고 `page`를 URL 상태로 둔다. `useInfiniteQuery` 대신 `useQuery` + `keepPreviousData`.

### 홈 라우트 = `/home`, 루트 = 랜딩

루트 `/`는 랜딩 페이지 자리이므로(이번 범위 밖) 홈 갤러리는 `/home`에 둔다. 기존 `src/app/page.tsx` placeholder는 랜딩 담당이 채우도록 남겨둔다. 홈은 `(main)/home/page.tsx`로 만들어 헤더+사이드바 셸을 공유한다.

### 카테고리 상수의 단일 출처 (확정값)

직군/태스크/모델/결과물타입/등급 목록을 `features/gallery/categories.ts` 한 곳에서 관리해 사이드바·필터·목 데이터가 같은 소스를 참조하게 한다.

```ts
// value(영문) ↔ label(한글) 매핑으로 관리
export const OUTPUT_TYPES = ["text", "image"] as const; // 텍스트/이미지
export const JOB_CATEGORIES = [
  // 복수 선택
  "student",
  "worker",
  "planner",
  "designer",
  "developer",
  "self_employed",
] as const; // 학생/직장인/기획자/디자이너/개발자/자영업자
export const TASKS = [
  // 복수 선택
  "ppt",
  "report",
  "email",
  "meeting_notes",
  "document",
  "image_gen",
] as const; // PPT/레포트/이메일/회의록/보고서/이미지 생성
export const AI_MODELS = ["chatgpt", "gemini", "claude", "etc"] as const; // 기타=자유입력
export const TIERS = ["free", "premium", "master"] as const; // 무료/프리미엄/마스터
```

### 인증 상태 의존성

헤더 분기와 `user_status`는 로그인 담당 팀원의 인증 소스에 의존한다. 아직 없으므로 얇은 어댑터(`useAuthStatus()` 같은 훅)를 두고 현재는 `anonymous` 폴백. auth store가 나오면 이 어댑터 내부만 교체한다.

### 워터마크 이미지

카드 썸네일(`thumbnailUrl`)은 BE가 워터마크를 합성해 서빙하는 처리본 URL을 가정한다. 프론트는 합성하지 않고 받은 URL만 렌더한다(원본 노출 방지).

## 리스크와 대응

| 리스크                       | 영향                               | 대응                                                                 |
| ---------------------------- | ---------------------------------- | -------------------------------------------------------------------- |
| BE API 스펙 미확정           | 응답 shape 불일치 가능             | 목을 `PromptListResponse`로 고정, 어댑터로 격리                      |
| Next.js 16 App Router 변경점 | 레이아웃/라우팅 관례 상이          | `node_modules/next/dist/docs/` 확인 후 작성(AGENTS.md 지침)          |
| 인증 소스 미구현             | 헤더 분기/`user_status` 확정 불가  | `useAuthStatus` 어댑터 + `anonymous` 폴백                            |
| 상세 페이지 부재             | 카드 클릭 이동 404                 | 경로(`/prompts/[id]`) 확정 후 링크만 연결, 상세 브랜치에서 채움      |
| 태스크 상수 미확정           | 필터/카드 태그 재작업              | `categories.ts` 단일 출처로 변경 비용 최소화                         |
| 반응형 시안 미확정           | 좁은 폭 열 수/사이드바 접힘 재작업 | 1280px 컨테이너·그리드로 골격 고정, 폭 값 모아두고 breakpoint만 추가 |

## 마일스톤

| 단계 | 내용                                                        | 상태        |
| ---- | ----------------------------------------------------------- | ----------- |
| 1    | `(main)` 레이아웃 셸(헤더+사이드바) + `HeaderAuthArea` 분기 | 완료        |
| 2    | 카테고리 사이드바(홈/인기/직군별) + nuqs 필터·페이지 상태   | 완료        |
| 3    | Prompt 타입 + `categories.ts` + MSW 목 API(필터·페이지)     | 완료        |
| 4    | `use-prompt-list`(useQuery + keepPreviousData)              | 완료        |
| 5    | 갤러리 그리드 + `GalleryCard`(impression/click)             | 완료        |
| 6    | 필터 탭 + `Pagination` + 검색바 연동(디바운스 → `q`)        | 완료        |
| 7    | 로딩/빈/에러 상태                                           | 완료        |
| 8    | Vitest 테스트                                               | 완료        |
| 9    | (후속) 프롬프트 상세 페이지                                 | 별도 브랜치 |
| 10   | (후속) 프롬프트 CRUD + 업로드 로그인 게이트                 | 별도 브랜치 |

## 구현 결과

브랜치: `feat/PS-29`

추가 파일:

```txt
src/app/(main)/layout.tsx                              # 1280px 중앙정렬 셸(dynamic 렌더)
src/app/(main)/home/page.tsx                           # /home 갤러리 페이지
src/features/gallery/types.ts                          # 도메인 타입
src/features/gallery/categories.ts                     # 직군/태스크/모델/결과물타입 단일 출처
src/features/gallery/api/prompt.ts                     # toSearchParams + fetchPrompts
src/features/gallery/hooks/use-gallery-filters.ts      # nuqs 필터/페이지 상태
src/features/gallery/hooks/use-prompt-list.ts          # useQuery + keepPreviousData
src/features/gallery/components/                        # GalleryCard/Grid/Filters/CategoryNav/
                                                        #  Pagination/States/HeaderAuthArea/TopBar
src/hooks/use-auth-status.ts                            # 인증 상태 어댑터(anonymous 폴백)
src/mocks/data/prompts.ts                               # 시드 48개(status/tier 혼합)
src/mocks/prompt-query.ts                               # 필터/정렬/페이지네이션 순수 함수
src/mocks/MswProvider.tsx                               # dev MSW 워커 시작 게이트
.env.development                                        # NEXT_PUBLIC_API_MOCKING=enabled
```

테스트 파일(핵심 로직 고정, 긍정+부정 케이스):

```txt
src/mocks/prompt-query.test.ts                         # ACTIVE-only, OR/AND 필터, 정렬, 페이지네이션
src/features/gallery/api/prompt.test.ts                # toSearchParams 매핑 + MSW 연동
src/features/gallery/hooks/use-gallery-filters.test.tsx# 필터→URL, 필터 변경 시 page=1 리셋
src/features/gallery/components/gallery-card.test.tsx   # 클릭→card_click, 상세 링크, 태그 구성
src/features/gallery/components/gallery-grid.test.tsx   # 렌더/빈 상태
src/features/gallery/components/header-auth-area.test.tsx# 비회원/회원 헤더 분기
```

수정 파일: `src/app/providers.tsx`(MswProvider), `src/mocks/handlers.ts`(`/api/prompts`), `.gitignore`(`.env.development` 예외)

## 검증

실행(프로젝트 Node: `.nvmrc` 20.19.5):

```bash
source ~/.nvm/nvm.sh && nvm use
pnpm typecheck   # 통과
pnpm lint        # 통과
pnpm test        # 10 files / 52 tests 통과
pnpm build       # 통과 ( / 정적, /home 동적 )
```

| 항목                | 결과                         |
| ------------------- | ---------------------------- |
| TypeScript          | 통과                         |
| ESLint              | 통과                         |
| Vitest              | 10 files, 52 tests 통과      |
| next build          | 통과 (`/home` = ƒ 동적 렌더) |
| dev 런타임(`/home`) | 200 (MSW 목 데이터 렌더)     |

### 권한/필터 테스트 원칙 (동어반복 방지)

리뷰 논의대로, 권한·필터 판별은 진리표로 고정하고 **긍정 케이스와 부정 케이스를 함께** 넣었다.
조건을 반대로 바꾸면(예: `AND`→`OR`, page 리셋 제거, 인증 분기 반전) 반드시 깨지도록 설계했다.

- 필터 AND: "태스크는 맞지만 모델이 어긋나면 제외" 케이스 포함(OR 로 잘못 짜면 실패)
- 페이지 리셋: "3페이지에서 필터 바꾸면 1로" + "setPage 는 필터를 안 지움"(리셋 오적용 방지)
- 헤더 분기: 비회원=로그인 버튼 & 알림 없음 / 회원=알림+프로필 & 로그인 버튼 없음

> 홈 스코프의 권한 경계는 헤더 표시와 `user_status`뿐이다. tier/등급/크리에이터 판별 테스트는
> 상세·업로드·마이페이지 브랜치에서 해당 진리표를 다시 인터뷰해 작성한다.

## 확정된 사항 (2026-07-20)

- **직군/태스크/모델/결과물타입/등급 enum 확정** — 위 `categories.ts` 값 사용. 직군·태스크는 복수 선택.
- **인기 프롬프트 정렬**: BE 로직 소관으로 기준 미공개 → 프론트는 `sort=popular`만 전달, 랭킹은 목/BE 위임.
- **BE 연동**: MSW 목으로 선개발. 실제 `GET /api/prompts` 스펙은 약 **1주 뒤** 확정 예정 → 목 응답 shape을 `PromptListResponse`로 고정해 두고, 스펙 확정 시 어댑터만 교체.

### BE 회의 반영 (2026-07-21)

- **인기 정렬 = 좋아요(`like_count`) 내림차순** 확정. 조회수/복사수는 기준 아님(조회수는 추후 검토). → `queryPrompts` popular 정렬을 likes-only 로 수정하고 테스트로 고정(복사수/조회수 영향 없음까지 검증).
- **"오늘의 추천" = 홈** (기획/디자이너 확정): 실은 1.1 홈 갤러리 카드 미리보기의 자리표시 텍스트였음. 별도 화면 아님 → **명칭 "홈", 최신순 정렬**로 확정. 홈 제목을 nav 기반 동적("홈"/"인기 프롬프트"/"{직군} 프롬프트")으로 처리, "오늘의 추천" 용어 제거. 현행 디자인 그대로 유지.
- **북마크 MVP 포함 / 타인 프로필 조회 확정**: 홈 카드에 북마크 토글·작성자→프로필 링크가 추가될 수 있으나 **별도 기능/브랜치**. 이번 홈 조회 범위엔 영향 없음(후속).
- **등급 단계(Node~Origin, 게시글 수 기준 승급) / 게시글 수정 범위 / 대댓글**: 마이페이지·상세·업로드·댓글 브랜치 몫으로 **홈 범위 영향 없음**.

## 남은 오픈 질문

- 실제 `GET /api/prompts` 응답 필드가 `PromptListResponse`와 어긋날 경우를 대비해, BE 스펙 나오면 한 번 대조(특히 페이지네이션 방식: page/size vs cursor, 태그 문자열 vs enum 배열).

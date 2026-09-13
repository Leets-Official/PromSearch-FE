<div align="center">
  <img src="public/readme/banner.png" width="800px" alt="PromSearch 배너" />
</div>

<br />

<div align="center">

## [🔍 프롬써치 바로가기](https://promsearch.kr)

**아웃풋(Output)으로 검색하는 한국형 AI 프롬프트 엔진 & 직군별 커뮤니티 플랫폼**

</div>

<br />

## 📄 목차

- [✍🏻 프로젝트 개요](#-프로젝트-개요)
- [🤝 FE 팀원 소개](#-fe-팀원-소개)
- [🛠 기술 스택](#-기술-스택)
- [💻 화면 구성](#-화면-구성)
- [🚀 핵심 기능 및 FE 기술적 도전](#-핵심-기능-및-fe-기술적-도전)
- [📁 폴더 구조](#-폴더-구조)
- [⚙️ 시작하기](#️-시작하기)
- [🌿 협업 규칙](#-협업-규칙)

<br />

## ✍🏻 프로젝트 개요

> "분명 좋다는 프롬프트인데, 막상 써보면 불편하지 않았나요?"

- **해외 프롬프트는 그대로 쓰기 어색해요** — 영어권 프롬프트는 한국식 문서 톤과 미묘하게 어긋나 보고서·PPT에 바로 쓰기 애매합니다.
- **실행하기 전에는 결과를 알 수 없어요** — 프롬프트 텍스트만 보고는 결과물을 예측하기 어렵습니다.
- **좋은 프롬프트도 한 번 쓰고 끝나요** — 활용법을 공유하고 함께 발전시킬 기회가 부족합니다.

**프롬써치(PromSearch)** 는 결과물(아웃풋 이미지)을 먼저 보여주고 프롬프트를 고르게 하는 서비스입니다.
"아웃풋 우선 노출 → 신뢰 → 전환" 가설을 검증하는 프리토타입으로 시작했습니다.

| 기능             | 설명                                                                |
| ---------------- | ------------------------------------------------------------------- |
| 🖼️ 결과물 갤러리 | 프롬프트를 실행해보지 않아도 결과물로 비교하고 선택                 |
| 🎯 필터 탐색     | 직군 · 태스크 · AI 모델 · 결과물 타입으로 필요한 프롬프트만         |
| 📤 프롬프트 공유 | 써보고 좋았던 프롬프트를 결과물 이미지와 함께 업로드                |
| 🔖 추천 · 북마크 | 반응 좋은 프롬프트를 확인하고, 마음에 든 프롬프트는 저장            |
| 🏅 등급 시스템   | Node → Link → Sync → Core → Prime → Origin 으로 성장하는 크리에이터 |

<br />

## 🤝 FE 팀원 소개

| <img src="https://avatars.githubusercontent.com/u/101498350?v=4" width="130" /> | <img src="https://avatars.githubusercontent.com/u/112791488?v=4" width="130" /> |
| :-----------------------------------------------------------------------------: | :-----------------------------------------------------------------------------: |
|          **조혜원**<br />[@One-HyeWon](https://github.com/One-HyeWon)           |           **김채민**<br />[@gachaemin](https://github.com/gachaemin)            |
|                   홈 갤러리 · 프롬프트 상세 · 업로드 · 관리자                   |                     로그인 · 회원가입 · 온보딩 · 마이페이지                     |

> 2인 팀이라 화면 단위로 나눠 맡되, **디자인 토큰 · API 클라이언트 · MSW 목 서버 · 테스트 환경** 같은 공통 레이어는 먼저 합의하고 시작했습니다.

<br />

## 🛠 기술 스택

<table>
  <thead>
    <tr>
      <th>분류</th>
      <th>기술 스택</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><p>FE</p></td>
      <td>
        <img src="https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
        <img src="https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
        <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
        <img src="https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
        <img src="https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white" />
        <br />
        <img src="https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" />
        <img src="https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white" />
        <img src="https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white" />
        <img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white" />
        <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" />
      </td>
    </tr>
    <tr>
      <td><p>Test · Mock</p></td>
      <td>
        <img src="https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" />
        <img src="https://img.shields.io/badge/Testing_Library-E33332?style=for-the-badge&logo=testinglibrary&logoColor=white" />
        <img src="https://img.shields.io/badge/MSW-FF6A33?style=for-the-badge&logo=mockserviceworker&logoColor=white" />
      </td>
    </tr>
    <tr>
      <td><p>BE</p></td>
      <td>
        <img src="https://img.shields.io/badge/Java_21-007396?style=for-the-badge&logo=openjdk&logoColor=white" />
        <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" />
        <img src="https://img.shields.io/badge/Spring_Data_JPA-6DB33F?style=for-the-badge&logo=spring&logoColor=white" />
        <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
        <img src="https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonwebservices&logoColor=white" />
      </td>
    </tr>
    <tr>
      <td><p>협업 · 도구</p></td>
      <td>
        <img src="https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white" />
        <img src="https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white" />
        <img src="https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black" />
        <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" />
        <img src="https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white" />
        <img src="https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white" />
      </td>
    </tr>
  </tbody>
</table>

<details>
  <summary><b>왜 이 스택을 골랐나요?</b></summary>

| 영역       | 선택                         | 고른 이유                                                     |
| ---------- | ---------------------------- | ------------------------------------------------------------- |
| 프레임워크 | **Next.js 16 / React 19**    | App Router, 서버 컴포넌트, 이미지·폰트 최적화                 |
| 언어       | **TypeScript**               | API 계약을 타입으로 고정                                      |
| 스타일     | **Tailwind v4 + shadcn**     | `@theme` 토큰이 CSS 변수로 컴파일 → 반응형 타이포 전략의 기반 |
| 서버 상태  | **TanStack Query**           | 무한스크롤, 낙관적 갱신(좋아요·북마크), 캐시 무효화           |
| 클라 상태  | **Zustand**                  | 로그인 모달 게이트 등 가벼운 전역 상태                        |
| 폼         | **React Hook Form + Zod**    | 업로드 폼이 복잡(이미지 10장 + 태그 + 임시저장)               |
| URL 상태   | **nuqs**                     | 갤러리 필터를 URL 에 → 공유·뒤로가기 대응                     |
| 목 서버    | **MSW**                      | 목을 네트워크 계층에 두고 화면 단위로 실 API 교체             |
| 테스트     | **Vitest + Testing Library** | MSW 핸들러를 테스트에서 그대로 재사용                         |
| 패키지     | **pnpm**                     | 빠른 설치, 유령 의존성 차단                                   |

</details>

<br />

## 💻 화면 구성

### 랜딩

<p align="center">
  <img src="public/readme/landing.png" width="80%" />
</p>

### 홈 갤러리

<p align="center">
  <img src="public/readme/home.png" width="49%" />
  <img src="public/readme/home-filter.png" width="49%" />
</p>
<p align="center">결과물 갤러리 | 직군 · 태스크 · AI 모델 필터</p>

### 프롬프트 상세

<p align="center">
  <img src="public/readme/detail.png" width="49%" />
  <img src="public/readme/detail-zoom.png" width="49%" />
</p>
<p align="center">프롬프트 상세 | 결과물 확대 보기</p>

### 프롬프트 업로드

<p align="center">
  <img src="public/readme/upload.png" width="49%" />
  <img src="public/readme/upload-draft.png" width="49%" />
</p>
<p align="center">업로드 폼 | 임시저장 불러오기</p>

### 로그인 · 온보딩

<p align="center">
  <img src="public/readme/login.png" width="49%" />
  <img src="public/readme/onboarding.png" width="49%" />
</p>
<p align="center">소셜 로그인(Google · Kakao) | 온보딩 · 프로필 설정</p>

### 마이페이지

<p align="center">
  <img src="public/readme/mypage.png" width="49%" />
  <img src="public/readme/mypage-revenue.png" width="49%" />
</p>
<p align="center">프로필 · 내 게시글 · 북마크 | 수익 · 등급</p>

### 모바일

<p align="center">
  <img src="public/readme/mobile-home.png" width="30%" />
  <img src="public/readme/mobile-detail.png" width="30%" />
  <img src="public/readme/mobile-mypage.png" width="30%" />
</p>
<p align="center">홈 | 프롬프트 상세 | 마이페이지</p>

<details>
  <summary><b>관리자 페이지</b></summary>
  <br />
  <img src="public/readme/admin-users.png" width="100%" />
  <img src="public/readme/admin-reports.png" width="100%" />
</details>

<br />

## 🚀 핵심 기능 및 FE 기술적 도전

### 1. 목(Mock)을 네트워크 계층에 — 화면 단위 점진 교체

> BE 개발과 병렬로 진행하기 위해 API 계약을 먼저 고정하고, 목을 컴포넌트가 아니라 Service Worker 에 두었습니다.

```mermaid
flowchart LR
    A["브라우저<br/>fetch('/api/v1/...')"] --> M{"MSW<br/>Service Worker"}
    M -->|"핸들러 있음"| K["목 응답"]
    M -->|"핸들러 없음<br/>(bypass)"| R["Next rewrites<br/>/api/v1/* → BE"]
    R --> S["실서버"]
    M -.->|"같은 핸들러 재사용"| T["Vitest<br/>(msw/node)"]
```

- 컴포넌트는 처음부터 진짜 `fetch` 를 하므로 `if (isMock)` 분기가 없고, **걷어낼 목 코드가 없음**
- 목이 처리하지 않은 요청은 실서버로 흘러가 **"홈만 실 API, 나머지는 목"** 같은 중간 상태가 가능
- 브라우저와 Vitest 가 **같은 핸들러**를 사용 → 목을 두 벌 관리하지 않음
- `next.config.ts` rewrites 로 동일 출처 프록시 → **CORS 이슈 자체를 제거**

### 2. 결과물 이미지 업로드 파이프라인

> 결과물 이미지가 필수인 서비스라, 업로드가 곧 핵심 플로우입니다.

```mermaid
sequenceDiagram
    participant U as 사용자
    participant FE as 프론트엔드
    participant BE as 백엔드
    participant S3 as S3

    U->>FE: 이미지 최대 10장 선택
    FE->>FE: createObjectURL 로 즉시 미리보기
    FE->>BE: ① Presigned URL 발급
    par 병렬 업로드
        FE->>S3: ② PUT (파일 직접 전송)
        FE->>BE: ③ 업로드 완료 알림
    end
    loop 최종 상태까지
        FE->>BE: ④ 상태 폴링 (워터마크 처리)
    end
```

- **폼은 파일이 아니라 `imageId` 를 들고 있음** — base64 로 폼에 넣으면 메인 스레드 블로킹 + 임시저장 요청이 수십 MB 로 부풂
- 선택 즉시 `createObjectURL` 로 타일을 띄우고, 교체·삭제 시점에 `revokeObjectURL` 로 메모리 누수 방지
- `uploading → processing → ready / failed` 4단계 상태를 타일에 노출, 실패한 이미지도 조용히 사라지지 않게 유지
- 여러 틱에 걸친 비동기 콜백이 낡은 폼 값을 덮어쓰지 않도록 최신 목록을 `ref` 로 관리
- S3 요청은 공통 axios 인스턴스(`baseURL`, `Authorization`)가 서명 검증을 깨므로 순수 `fetch` 로 분리
- React Hook Form + Zod 로 폼 검증, **임시저장** 지원

### 3. 폰트 병목 발견 — LCP −67%

> `next/image` 효과를 측정하려다, 진짜 병목이 폰트라는 걸 찾아냈습니다.

- 이미지 최적화를 적용했는데 **LCP 가 전혀 줄지 않음** → 네트워크 탭 분석
- 통짜 `PretendardVariable.woff2` 하나가 **2,010 KB, 전체 전송량의 80%** 를 차지
- 폰트만 제거한 대조군에서 LCP 14.7초 → 4.6초 → **원인 분리 증명**
- `unicode-range` 기반 **dynamic subset + self-host** 로 필요한 글자 조각만 요청

**Lighthouse 모바일 · 프로덕션 빌드 · 3회 중앙값**

|                 |    before |        after |     변화 |
| --------------- | --------: | -----------: | -------: |
| **홈 LCP**      | 14,721 ms | **4,888 ms** | **−67%** |
| **홈 전송량**   |  2,497 KB |   **501 KB** | **−80%** |
| **랜딩 LCP**    | 14,000 ms | **4,204 ms** | **−70%** |
| **폰트 전송량** |  2,009 KB |   **224 KB** | **−88%** |
| CLS             |     0.000 |        0.000 |     유지 |

그 밖에 확대 모달(`react-zoom-pan-pinch`)을 `next/dynamic` 으로 지연 로딩해 **상세 TBT 78 → 57 ms (−27%)**, 폴링의 선(先) 대기를 제거해 최대 **1.5초** 단축했습니다.

### 4. 낙관적 갱신의 함정 세 가지

> 좋아요·북마크는 클릭 즉시 반영하고, 실패하면 롤백합니다.

- **요청 방향이 뒤집힘** — 서버가 등록(`POST`)/취소(`DELETE`)를 분리했는데, 낙관적 갱신이 먼저 캐시를 뒤집어 항상 반대 요청이 나감 → **클릭 시점의 상태를 mutation 인자로 전달**
- **리렌더보다 빠른 연타** — 같은 값이 두 번 전송되어 409 → `isPending` 동안 핸들러 차단 + 버튼 비활성
- **같은 글의 캐시가 여러 개** — 뷰어 상태별 쿼리 키로 캐시가 나뉨 → `["prompt", id]` **접두 매칭**으로 갱신·롤백을 한 번에

### 5. 반응형 타이포그래피 토큰화

> 컴포넌트가 아니라 CSS 변수 한 겹에서 반응형을 처리했습니다.

- 시안 구조가 "스타일 이름은 하나, 폰트 사이즈만 PC/모바일 두 벌"
- Tailwind v4 유틸이 `var(--text-*)` 로 컴파일되는 점을 이용해, **모바일 미디어쿼리에서 변수만 덮어씀**
- 컴포넌트는 `text-heading-1` 하나만 쓰고 뷰포트를 모름 → 토큰이 바뀌어도 `globals.css` 한 파일만 수정
- **토큰 유틸 사용처 277곳, 모바일 대응을 위해 수정한 컴포넌트 0개 (CSS 25줄)**

### 6. 전환 측정 이벤트 레이어

> "아웃풋 우선 노출 → 전환" 가설을 검증하기 위한 분석 레이어를 분리했습니다.

- `card_impression`, `card_click`, `signup_complete` 등 이벤트를 **discriminated union 타입**으로 강제해 오타·누락을 컴파일 단계에서 차단
- `IntersectionObserver` 기반 카드 노출 추적 훅(`useCardImpression`)
- `NEXT_PUBLIC_APP_ENV` 로 local(console) / dev / prod 전송 분리

<br />

## 📁 폴더 구조

```
src/
├── app/            # App Router 라우트 (랜딩, (main)/home·prompts·upload, mypage, admin, auth)
├── features/       # 도메인별 기능 (gallery, prompt-detail, upload, auth, mypage, admin, landing ...)
├── components/     # 공통 UI (ui · layout · modals)
├── hooks/          # 공통 훅 (무한스크롤, 카드 노출 추적, 인증 상태 ...)
├── lib/            # API 클라이언트, query client, 유틸
├── analytics/      # 전환 측정 이벤트 레이어
├── mocks/          # MSW 핸들러 · 목 데이터
└── types/          # 공통 타입
```

<br />

## ⚙️ 시작하기

```bash
nvm use            # Node 20.19.5 (.nvmrc)
corepack enable    # pnpm 활성화
pnpm install       # 의존성 설치 (+ git 훅 자동 설치)
pnpm dev           # 개발 서버 → http://localhost:3000
```

```bash
pnpm dev / build / start    # 개발 · 빌드 · 실행
pnpm lint / lint:fix        # 린트 검사 · 자동 수정
pnpm format / format:check  # 포맷 · 검사
pnpm typecheck              # 타입 검사
pnpm test / test:watch      # 테스트
```

환경 변수와 상세 설정은 [docs/development-environment.md](./docs/development-environment.md) 를 참고하세요.

<br />

## 🌿 협업 규칙

> 규칙은 사람이 지키는 게 아니라 **훅과 CI 가 강제**하도록 만들었습니다.

```mermaid
flowchart LR
    B["브랜치<br/><b>feat/PS-69</b>"] --> C["커밋<br/>[feat/PS-69] 제목"]
    C --> H{"husky<br/>commitlint"}
    H -->|규칙 위반| X["커밋 실패"]
    H -->|통과| G["GitHub PR"]
    G --> L["라벨 자동 동기화"]
    G --> N["Notion 카드 상태 전환<br/>열림→진행 중 / 머지→완료"]
```

- **브랜치** — `main`(배포) · `develop`(통합, 기본) 보호 / 작업은 `type/PS-<티켓번호>` → `develop` 으로 PR
- **커밋 · PR 제목** — `[<type>/PS-<티켓번호>] <작업 내용>` 형식, commitlint 로 자동 검사
- **코드 스타일** — 저장 시 Prettier/ESLint 자동 적용, 커밋 시 lint-staged 로 정리
- **Notion 연동** — PR 을 올리면 연결된 Notion 카드가 "진행 중" → 머지되면 "완료" 로 자동 갱신

자세한 컨벤션은 [CONTRIBUTING.md](./CONTRIBUTING.md) 를 참고하세요.

<br />

<div align="center">

© 2026 PromSearch Team · Leets 7th

</div>

# 프롬써치 (PromSearch) — Frontend

> 아웃풋(Output)으로 검색하는 한국형 AI 프롬프트 엔진 & 직군별 커뮤니티 플랫폼

결과물(아웃풋 이미지)을 먼저 보여주고 프롬프트를 선택하게 하는 구조로, "아웃풋 우선 노출 → 신뢰 → 전환" 가설을 검증하는 프리토타입입니다.

## 기술 스택

| 영역         | 선택                      | 이유                                                               |
| ------------ | ------------------------- | ------------------------------------------------------------------ |
| 프레임워크   | **Next.js (App Router)**  | 서버 컴포넌트로 유료 콘텐츠 비회원 차단, 이미지 갤러리 최적화, SEO |
| 언어         | **TypeScript**            | tier × 사용자 상태 분기·이벤트 스키마가 많아 타입으로 실수 차단    |
| 서버 상태    | **TanStack Query**        | 무한스크롤·낙관적 업데이트(like)·검색 갱신                         |
| 클라 상태    | **Zustand**               | 로그인 모달 게이트·필터 등 가벼운 전역 상태                        |
| 스타일       | **Tailwind CSS**          | 빌드타임이라 RSC 친화, 컴포넌트 양산 속도                          |
| 폼/검증      | **React Hook Form + Zod** | 업로드 폼 검증 + 응답 검증 재사용                                  |
| 패키지매니저 | **pnpm**                  | 빠름·유령 의존성 차단·모노레포 확장                                |

## 시작하기

```bash
nvm use            # Node 20.19.5 (.nvmrc)
corepack enable    # pnpm 활성화
pnpm install       # 의존성 설치 (+ git 훅 자동 설치)
pnpm dev           # 개발 서버 → http://localhost:3000
```

## 스크립트

```bash
pnpm dev / build / start    # 개발·빌드·실행
pnpm lint / lint:fix        # 린트 검사·자동 수정
pnpm format / format:check  # 포맷·검사
pnpm typecheck              # 타입 검사
```

## 브랜치 전략

- `main` — 배포 가능한 안정 브랜치 (보호됨)
- `develop` — 통합 브랜치, 기본 브랜치 (보호됨)
- `feat/PS-<티켓번호>`, `fix/PS-<티켓번호>` 등 — 작업 브랜치 → `develop` 으로 PR

## 협업 규칙

커밋·PR·코드 스타일 컨벤션은 [CONTRIBUTING.md](./CONTRIBUTING.md) 를 참고하세요.

- 커밋은 Conventional Commits 형식으로 자동 검사됩니다 (`feat: ...`).
- 저장 시 Prettier/ESLint 자동 적용, 커밋 시 lint-staged 로 정리.
- PR을 올리면 연결된 Notion 카드가 자동으로 "진행 중" → 닫히면 "완료"로 갱신됩니다.

## 개발 환경

Node/pnpm 버전, analytics 환경 변수, 브랜치 컨벤션은 [개발 환경 설정](./docs/development-environment.md)을 참고하세요.

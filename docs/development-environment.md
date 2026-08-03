# 개발 환경 설정

이 프로젝트는 전역 Node 버전을 바꾸지 않고, repo의 `.nvmrc` 기준으로 프로젝트별 Node 버전을 맞춘다.

## Node / pnpm

필수 버전:

```txt
Node.js 20.19.5
pnpm 9.15.4
```

프로젝트 루트에서 아래 순서로 실행한다.

```bash
nvm install 20.19.5
nvm use
corepack enable
corepack prepare pnpm@9.15.4 --activate
pnpm install
```

정상 설정 확인:

```bash
node -v
pnpm -v
```

기대값:

```txt
v20.19.5
9.15.4
```

## 왜 전역 Node를 바꾸지 않나

다른 프로젝트가 Node 18 또는 다른 버전에 묶여 있을 수 있으므로, 전역 기본 Node를 바꾸면 충돌이 생길 수 있다. 이 repo에서는 `.nvmrc`를 기준으로 `nvm use`를 실행해 현재 터미널 세션에서만 Node 20.19.5를 사용한다.

새 터미널을 열었거나 다른 프로젝트에서 돌아온 경우, 이 프로젝트 루트에서 다시 실행한다.

```bash
nvm use
```

## 자주 쓰는 명령

```bash
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm format:check
```

## Analytics 환경 변수

analytics 이벤트는 `NEXT_PUBLIC_APP_ENV` 값으로 local / dev / prod 동작을 분리한다.

```txt
NEXT_PUBLIC_APP_ENV=local | dev | prod
NEXT_PUBLIC_ANALYTICS_ENABLED=true | false
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://...
```

권장 설정:

```bash
# .env.local
NEXT_PUBLIC_APP_ENV=local
NEXT_PUBLIC_ANALYTICS_ENABLED=false
```

```bash
# dev 또는 staging 환경
NEXT_PUBLIC_APP_ENV=dev
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_ANALYTICS_ENDPOINT=<dev analytics endpoint>
```

```bash
# production 환경
NEXT_PUBLIC_APP_ENV=prod
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_ANALYTICS_ENDPOINT=<prod analytics endpoint>
```

동작 기준:

- `local`: 실제 전송하지 않고 console로 payload를 확인한다.
- `dev`: endpoint가 있으면 dev analytics로 전송하고, 없으면 console로 확인한다.
- `prod`: endpoint가 있으면 production analytics로 전송한다.

`.env*` 파일은 `.gitignore`에 포함되어 있으므로 실제 값은 커밋하지 않는다.

## 파일 네이밍 컨벤션

파일명은 기본적으로 `kebab-case`를 사용한다.

```txt
query-client.ts
use-card-impression.ts
use-card-impression.test.tsx
development-environment.md
```

코드 안에서 export하는 식별자는 JavaScript / TypeScript 컨벤션을 따른다.

```txt
함수, 변수, hook: camelCase
React 컴포넌트: PascalCase
타입, 인터페이스: PascalCase
상수: UPPER_SNAKE_CASE 또는 camelCase
```

예시:

```txt
파일명: src/hooks/use-card-impression.ts
export: useCardImpression

파일명: src/lib/query-client.ts
export: getQueryClient

파일명: src/components/ui/button.tsx
export: Button, buttonVariants
```

파일명과 export 이름의 컨벤션을 다르게 가져가는 이유:

- 파일명은 파일 시스템, Git, import path에서 사용되므로 대소문자 차이로 인한 OS/CI 환경 차이를 줄이는 것이 중요하다.
- `kebab-case`는 모두 소문자라 macOS와 Linux 간 case sensitivity 문제를 줄일 수 있다.
- 긴 파일명도 단어 경계가 명확하다.
- 함수와 변수는 코드 안의 식별자이므로 JS/TS 언어 컨벤션에 맞춰 `camelCase`를 사용한다.
- React 컴포넌트와 타입은 생태계 관례에 맞춰 `PascalCase`를 사용한다.

따라서 hook 파일도 파일명은 `kebab-case`, export되는 hook 함수명은 `camelCase`를 사용한다.

```txt
권장: use-card-impression.ts / useCardImpression
비권장: useCardImpression.ts / useCardImpression
```

단일 컴포넌트 파일도 현재 repo의 `src/components/ui/button.tsx` 패턴에 맞춰 소문자 또는 `kebab-case`를 우선한다. 팀에서 특정 도메인 컴포넌트에 PascalCase 파일명을 쓰기로 별도 합의하기 전까지는 파일명 컨벤션을 섞지 않는다.

## 브랜치 컨벤션

작업 브랜치는 티켓 번호 기준으로 만든다.

```txt
feat/PS-<번호>
fix/PS-<번호>
chore/PS-<번호>
```

예시:

```txt
feat/PS-17  # analytics / impression
feat/PS-6   # 공통 컴포넌트
```

## 커밋 컨벤션

커밋 메시지는 PR/이슈 제목과 같은 ticket prefix를 사용한다.

```txt
[<type>/PS-<번호>] <작업 내용>
```

예시:

```txt
[docs/PS-1] 프로젝트 README 작성
[feat/PS-17] 전환 측정 이벤트 레이어와 카드 노출 추적 훅 추가
[fix/PS-34] 카드 impression 중복 카운트 수정
```

규칙:

- 대괄호 안은 브랜치명과 같은 `type/PS-번호` 형식을 사용한다.
- 대괄호 뒤에는 공백 한 칸을 둔다.
- 작업 내용은 한국어로 작성한다.
- 제목 끝에는 마침표를 붙이지 않는다.
- `type`은 `feat`, `fix`, `refactor`, `design`, `docs`, `test`, `chore`, `setup`, `style`, `perf`, `ci`, `revert` 중 하나를 사용한다.

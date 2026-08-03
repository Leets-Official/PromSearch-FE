# [PS-17] Analytics 이벤트 레이어와 Vitest 기반 노출 추적 테스트

참고: [뱅크샐러드의 특별한 스펙, '테크 스펙'](https://blog.banksalad.com/tech/we-work-by-tech-spec/)

## 요약

PromSearch의 핵심 가설인 "아웃풋 우선 노출이 전환을 높이는가"를 검증하기 위해, 사용자 행동 이벤트를 타입 안전하게 기록하는 analytics 레이어를 추가한다.

카드가 실제로 사용자 화면에 노출되었는지 측정하기 위해 `useCardImpression` 훅을 구현하고, IntersectionObserver와 timer가 얽힌 핵심 조건을 Vitest로 검증한다.

이번 작업은 이후 카드 클릭, 프롬프트 복사, 가입 완료 등 전환 퍼널 이벤트를 일관된 방식으로 붙이기 위한 기반 작업이다.

## 배경

PromSearch는 결과물 이미지를 먼저 보여주고 프롬프트 선택과 가입 전환을 유도하는 프리토타입이다. 이 제품에서 중요한 질문은 UI가 예쁜지가 아니라, 사용자가 실제로 어떤 행동을 했고 그 행동이 전환으로 이어졌는지를 숫자로 증명할 수 있는지다.

기획상 필요한 대표 이벤트는 다음과 같다.

| 이벤트              | 의미                             | 활용                    |
| ------------------- | -------------------------------- | ----------------------- |
| `card_impression`   | 카드가 사용자 화면에 유효 노출됨 | 클릭률/전환율의 분모    |
| `card_click`        | 사용자가 카드를 클릭함           | 카드 관심도 측정        |
| `prompt_copy_click` | 사용자가 프롬프트 복사를 클릭함  | 프롬프트 사용 의도 측정 |
| `signup_complete`   | 가입 완료                        | 최종 전환 측정          |

특히 `card_impression`은 클릭률 계산의 분모다.

```txt
카드 클릭률 = card_click / card_impression
가입 전환율 = signup_complete / card_impression
```

따라서 노출 수가 부정확하면 이후 전환 분석 전체가 흔들린다. 단순 렌더링 여부가 아니라 "뷰포트에 50% 이상, 1초 이상 머물렀는지"를 기준으로 유효 노출을 측정해야 한다.

## 목표

- analytics 이벤트를 한 곳에서 타입 안전하게 발송한다.
- 이벤트명 오타와 필수 property 누락을 TypeScript 단계에서 차단한다.
- local/dev/prod 환경별 analytics 동작을 분리한다.
- local에서는 실제 전송 없이 console로 payload를 확인한다.
- dev/prod에서는 endpoint 설정에 따라 analytics payload를 전송할 수 있게 한다.
- anonymous/session id를 payload context에 포함한다.
- 카드가 50% 이상 1초 이상 노출되면 `card_impression`을 1회 발송한다.
- 같은 세션에서 같은 카드의 impression은 중복 발송하지 않는다.
- IntersectionObserver/timer/중복 제거 조건을 Vitest로 검증한다.

## 목표가 아닌 것

- PostHog, GA, Amplitude 등 특정 analytics SDK를 직접 연동하지 않는다.
- 실제 backend analytics 수집 API를 구현하지 않는다.
- 모든 제품 이벤트를 한 번에 완성하지 않는다.
- 로그인 이후 anonymous id와 user id를 병합하는 identify/alias 로직은 이번 범위에 포함하지 않는다.
- 카드 UI나 공통 컴포넌트 구현은 이번 범위에 포함하지 않는다.
- E2E 테스트나 실제 브라우저 기반 analytics 수집 검증은 이번 범위에 포함하지 않는다.

## 계획

### 1. Analytics 이벤트 타입 정의

파일:

```txt
src/analytics/events.ts
```

이벤트별 property schema를 TypeScript 타입으로 정의한다.

```ts
type AnalyticsEventPropertiesMap = {
  card_impression: {
    card_id: string;
    position: number;
    user_status: "anonymous" | "authenticated";
    source?: string;
  };
  card_click: {
    card_id: string;
    position: number;
    user_status: "anonymous" | "authenticated";
    source?: string;
  };
  prompt_copy_click: {
    prompt_id: string;
    user_status: "anonymous" | "authenticated";
    card_id?: string;
    source?: string;
  };
  signup_complete: {
    user_id: string;
    method?: "email" | "google" | "github" | "kakao";
  };
};
```

기대 효과:

- `track("card_clik", ...)` 같은 이벤트명 오타 방지
- `card_click`에 `card_id`가 빠지는 실수 방지
- 컴포넌트에서 analytics SDK 세부 구현을 몰라도 되도록 분리

### 2. Analytics client 구현

파일:

```txt
src/analytics/client.ts
```

역할:

- `NEXT_PUBLIC_APP_ENV` 기준으로 `local`, `dev`, `prod` 분기
- `localStorage` 기반 anonymous id 생성
- `localStorage` 기반 session id 생성
- page url, referrer, timestamp 등 공통 context 추가
- endpoint가 있으면 `fetch`로 payload 전송
- local 또는 disabled 상태에서는 console로 확인

환경 변수:

```txt
NEXT_PUBLIC_APP_ENV=local | dev | prod
NEXT_PUBLIC_ANALYTICS_ENABLED=true | false
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://...
```

환경별 동작:

| 환경    | 동작                                        |
| ------- | ------------------------------------------- |
| `local` | 실제 전송하지 않고 console 출력             |
| `dev`   | endpoint가 있으면 전송, 없으면 console 출력 |
| `prod`  | endpoint가 있으면 전송                      |

### 3. 공통 track 함수 구현

파일:

```txt
src/analytics/track.ts
```

앱 코드에서는 analytics client를 직접 호출하지 않고 `track()`만 사용한다.

```ts
track("card_click", {
  card_id: "card-1",
  position: 1,
  user_status: "anonymous",
});
```

이 구조를 사용하면 나중에 PostHog, GA, 자체 API 등으로 교체하더라도 컴포넌트 코드를 크게 바꾸지 않고 `client.ts`만 수정할 수 있다.

### 4. 카드 impression 훅 구현

파일:

```txt
src/hooks/use-card-impression.ts
```

API:

```ts
const ref = useCardImpression({
  cardId: card.id,
  position: index + 1,
  userStatus: "anonymous",
  source: "home",
});
```

사용:

```tsx
return <article ref={ref}>...</article>;
```

동작:

1. `IntersectionObserver`로 대상 카드 관찰
2. `intersectionRatio >= 0.5`이고 `isIntersecting === true`이면 timer 시작
3. 1초 동안 조건이 유지되면 `track("card_impression", ...)` 호출
4. 1초 전에 뷰포트에서 벗어나면 timer 취소
5. module-level `Set`으로 같은 세션 내 동일 `cardId` 중복 발송 방지

### 5. Vitest 테스트 작성

파일:

```txt
src/hooks/use-card-impression.test.tsx
```

테스트 전략:

- `IntersectionObserver`를 mock class로 대체한다.
- `vi.useFakeTimers()`로 1초 조건을 빠르게 검증한다.
- `track()`은 mock 처리해 analytics 전송 여부만 검증한다.
- 테스트 간 중복 제거 Set은 `resetCardImpressionSessionForTest()`로 초기화한다.

테스트 케이스:

| 케이스                    | 기대 결과                  |
| ------------------------- | -------------------------- |
| 0.9초만 보임              | 이벤트 미발송              |
| 50% 이상 1초 노출         | `card_impression` 1회 발송 |
| 1초 전에 화면 밖으로 이탈 | timer 취소, 이벤트 미발송  |
| 같은 카드 재노출          | 세션 내 1회만 발송         |

## 구현 결과

추가 파일:

```txt
src/analytics/events.ts
src/analytics/client.ts
src/analytics/track.ts
src/hooks/use-card-impression.ts
src/hooks/use-card-impression.test.tsx
docs/development-environment.md
```

수정 파일:

```txt
README.md
```

커밋:

```txt
53edfdc feat: 전환 측정 이벤트 레이어와 카드 노출 추적 훅 추가
```

브랜치:

```txt
feat/PS-17
```

## 검증

실행 명령:

```bash
source ~/.nvm/nvm.sh
nvm use
pnpm typecheck
pnpm test src/hooks/use-card-impression.test.tsx
pnpm lint
./node_modules/.bin/prettier --check README.md docs/development-environment.md src/analytics/events.ts src/analytics/client.ts src/analytics/track.ts src/hooks/use-card-impression.ts src/hooks/use-card-impression.test.tsx
```

결과:

| 항목                     | 결과                 |
| ------------------------ | -------------------- |
| TypeScript typecheck     | 통과                 |
| Vitest targeted test     | 1 file, 4 tests 통과 |
| ESLint                   | 통과                 |
| 변경 파일 Prettier check | 통과                 |

참고:

- `pnpm format:check`는 repo 전체를 검사한다.
- 현재 `.github/scripts/notion-sync.mjs`에 기존 포맷 이슈가 있어 전체 format check는 실패할 수 있다.
- 이번 작업에서 변경한 파일들은 Prettier check를 통과했다.

## 이외 고려 사항

### 특정 analytics SDK를 바로 붙이지 않은 이유

현재 단계에서는 이벤트 schema와 호출 지점을 안정화하는 것이 우선이다. PostHog, GA, Amplitude 등 SDK 선택은 제품 분석 도구 결정과 함께 바뀔 수 있으므로, `client.ts` 뒤에 숨겨 교체 가능하게 둔다.

### `NEXT_PUBLIC_` 환경 변수를 사용한 이유

analytics 이벤트는 client component와 hook에서 발생한다. 브라우저에서 접근해야 하는 값이므로 Next.js 규칙에 맞춰 public env prefix를 사용한다.

단, `NEXT_PUBLIC_` 값은 클라이언트 번들에 노출되므로 secret을 넣지 않는다. endpoint나 public project key만 넣는다.

### session id를 localStorage에 둔 이유

이번 구현에서는 "브라우저 세션"을 엄밀히 정의하기보다, 같은 브라우저에서 이벤트 context를 이어볼 수 있는 최소 단위가 필요했다. 추후 backend session, cookie, auth store 정책이 정해지면 교체할 수 있다.

### 테스트 전용 reset 함수를 export한 이유

중복 제거 Set은 module-level 상태이므로 테스트 간 격리가 필요하다. production 코드에서 호출할 필요는 없지만, 테스트 안정성을 위해 명시적으로 `resetCardImpressionSessionForTest()`를 제공한다.

## 리스크와 대응

| 리스크                           | 영향                             | 대응                                       |
| -------------------------------- | -------------------------------- | ------------------------------------------ |
| localStorage 사용 불가 환경      | anonymous/session id가 null 가능 | try/catch 처리, 이벤트 발송 자체는 유지    |
| IntersectionObserver 미지원 환경 | impression 미측정                | 현재는 no-op, 필요 시 polyfill 검토        |
| endpoint 미설정                  | dev/prod 이벤트 누락 가능        | dev는 console fallback, prod env 검증 필요 |
| 이벤트 schema 변경               | 기존 호출부 타입 오류            | TypeScript 오류를 통해 수정 지점 확인      |
| 세션 중복 기준 불명확            | impression 집계 정책 혼선        | 추후 제품 분석 기준 확정 시 Set scope 조정 |

## 마일스톤

| 단계 | 내용                                                             | 상태      |
| ---- | ---------------------------------------------------------------- | --------- |
| 1    | analytics 이벤트 schema 정의                                     | 완료      |
| 2    | 환경별 analytics client 구현                                     | 완료      |
| 3    | 공통 `track()` 함수 구현                                         | 완료      |
| 4    | `useCardImpression` 훅 구현                                      | 완료      |
| 5    | Vitest 기반 impression 테스트 작성                               | 완료      |
| 6    | 개발 환경 문서화                                                 | 완료      |
| 7    | 실제 카드 UI에 impression 훅 연결                                | 추후 작업 |
| 8    | `card_click`, `prompt_copy_click`, `signup_complete` 호출부 연결 | 추후 작업 |
| 9    | PostHog/GA/자체 endpoint 중 실제 수집 도구 결정 및 연동          | 추후 작업 |

## 이후 작업 가이드

새 기능을 만들 때는 다음 순서로 진행한다.

1. 이벤트가 필요한 사용자 행동인지 확인한다.
2. `src/analytics/events.ts`에 이벤트 schema가 있는지 확인한다.
3. 컴포넌트나 훅에서 `track()`을 호출한다.
4. 해당 interaction의 핵심 조건을 테스트로 고정한다.

예시:

```ts
track("prompt_copy_click", {
  prompt_id: prompt.id,
  card_id: card.id,
  user_status: "authenticated",
  source: "card_detail",
});
```

## 오픈 질문

- 실제 analytics 도구는 PostHog, GA, Amplitude, 자체 API 중 무엇을 사용할 것인가?
- `anonymous_id`와 `user_id` 병합은 어느 시점에 처리할 것인가?
- impression 중복 제거 기준은 브라우저 세션, 페이지 세션, 서버 세션 중 무엇으로 볼 것인가?
- 카드 position은 현재 렌더 순서 기준으로 충분한가, 검색/필터 조건도 함께 payload에 포함해야 하는가?
- production 배포 전 analytics endpoint 미설정을 CI나 runtime에서 감지할 필요가 있는가?

# mocks/

MSW(Mock Service Worker) 기반 API 목. **개발(브라우저)과 테스트(Node)에서 핸들러를 공유**한다.

```
mocks/
  handlers.ts       # 공유 핸들러 (요청 → 목 응답). GET /api/prompts 등
  browser.ts        # 개발용 워커 (setupWorker)
  server.ts         # 테스트용 서버 (setupServer) — Vitest setup 에서 사용
  MswProvider.tsx   # dev 브라우저 워커 시작 게이트 (NEXT_PUBLIC_API_MOCKING=enabled)
  prompt-query.ts   # 갤러리 목록 질의(필터/정렬/페이지네이션) 순수 함수 — 핸들러·테스트 공유
  data/
    prompts.ts      # 홈 갤러리 시드 데이터(48개, status/tier 혼합)
```

- BE 스펙 확정 전 `handlers.ts` 에 응답을 정의해 화면을 병렬 개발한다.
- 테스트는 `vitest.setup.ts` 에서 `server` 를 켜고, 각 테스트에서 핸들러를 오버라이드할 수 있다.
- 브라우저(개발)에서는 `MswProvider`(=`app/providers.tsx` 에 연결)가 `NEXT_PUBLIC_API_MOCKING=enabled`
  일 때 `browser.ts` 워커를 시작한다. `.env.development` 에 기본 enabled. BE 실서버 준비 시 끄면 된다.
- `GET /api/prompts` 의 필터/정렬/페이지네이션 로직은 `prompt-query.ts` 순수 함수에 있고,
  계약을 `prompt-query.test.ts` 로 고정한다(실제 BE 가 이 규칙을 서버에서 수행할 예정).

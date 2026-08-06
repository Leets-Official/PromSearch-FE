# mocks/

MSW(Mock Service Worker) 기반 API 목. **개발(브라우저)과 테스트(Node)에서 핸들러를 공유**한다.

```
mocks/
  handlers.ts       # 공유 핸들러 — 지금은 비어 있다(상시 목 없음)
  browser.ts        # 개발용 워커 (setupWorker)
  server.ts         # 테스트용 서버 (setupServer) — Vitest setup 에서 사용
  msw-provider.tsx  # dev 브라우저 워커 시작 게이트 (NEXT_PUBLIC_API_MOCKING=enabled)
  data/
    prompts.ts      # 홈 갤러리 시드 데이터(48개, status/tier 혼합)
    mypage.ts       # 마이페이지 시드 — 아직 화면이 직접 import 해서 쓴다
                    #   (수익·알림은 MVP 범위 밖, 내 게시글은 PROMPT-010 미구현)
```

## 상시 목은 하나도 없다 (2026-08-06)

홈·상세·업로드에 이어 **어드민 목까지 제거**했다. 어드민 5개(`ADMIN-REPORT-001/002`,
`ADMIN-GRADE-001/002/003`)도 BE 구현이 끝나 모든 화면이 실서버로 직접 나간다.
그래서 `.env.development` 의 `NEXT_PUBLIC_API_MOCKING` 은 `disabled` 다.

`handlers.ts` 의 빈 배열은 **지우면 안 된다.** 테스트가 `server.use(...)` 로 케이스마다
핸들러를 얹어 쓰는 기반이다(`src/features/admin/api/admin.test.ts` 등).

- 테스트는 `vitest.setup.ts` 에서 `server` 를 켜고, 각 테스트에서 핸들러를 오버라이드한다.
- 브라우저(개발)에서는 `MswProvider`(=`app/providers.tsx` 에 연결)가
  `NEXT_PUBLIC_API_MOCKING=enabled` 일 때만 `browser.ts` 워커를 시작한다.
- 새 화면을 목으로 먼저 개발할 일이 생기면 `handlers.ts` 에 핸들러를 추가하고 플래그를 켠다.
  목 핸들러가 없는 요청은 그대로 통과해 실서버(`NEXT_PUBLIC_API_ORIGIN`)로 나간다.
- `data/` 의 시드는 **네트워크 목이 아니라** 화면이 직접 import 하는 더미다.
  해당 API 가 구현되면 화면과 함께 지운다.

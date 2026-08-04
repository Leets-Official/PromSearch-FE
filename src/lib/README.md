# lib/

프레임워크/외부 라이브러리 설정과 범용 유틸리티.

- `api/` — BE 연동 공통 레이어(axios 인스턴스·인터셉터·에러·토큰). 사용법은 [api/README.md](./api/README.md)
- `auth-routes.ts` — 보호/guest-only 라우트 목록. `src/proxy.ts` 와 로그인 UI 가 함께 본다
- `query-client.ts` — TanStack Query 클라이언트 생성/관리(전역 retry 정책 포함)
- `dev-preview.ts` — dev 프리뷰 툴바 상태(쿠키/헤더 직렬화)
- `utils.ts` — cn() 등 헬퍼

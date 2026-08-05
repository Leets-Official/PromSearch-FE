/**
 * API 목 핸들러. 브라우저(개발)와 Node(테스트)에서 공유한다.
 *
 * **상시 목은 하나도 없다**(2026-08-06). 홈·상세·업로드에 이어 어드민 목까지 제거했다 —
 * 어드민 5개(`ADMIN-REPORT-001/002`, `ADMIN-GRADE-001/002/003`)도 BE 구현이 끝나
 * 모든 화면이 실서버로 직접 나간다.
 *
 * 이 배열은 비어 있어도 지우면 안 된다. 테스트가 `server.use(...)` 로 케이스마다
 * 핸들러를 얹어 쓰는 기반이다(`src/features/admin/api/admin.test.ts` 등).
 */

export const handlers = [];

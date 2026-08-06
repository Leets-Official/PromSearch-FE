# features/admin/

어드민(관리자) 화면 모듈. (PS-49)

시안: Figma `관리자 - 신고 게시글 관리`(551:3669) · `신고 댓글 관리`(1434:6473) · `유저 등급 관리`(1434:5839).
목록은 실 엔드포인트(`/api/v1/admin/*`)에 붙어 있다.

## 연동 상태 (2026-08-06 Swagger 기준)

**다섯 API 모두 구현 완료다.** 요청서 A-1(신고 대상 요약)·A-2(등급 승인 지표)·A-3(검색 `q`)이
전부 반영돼서, FE 가 메꾸던 임시 경로(100건 받아 클라이언트 필터)는 걷어냈다. 목도 전부 제거했다.

| 엔드포인트                         | 코드                                   |
| ---------------------------------- | -------------------------------------- |
| `GET   /admin/reports`             | ADMIN-REPORT-001 (targetType·status·q) |
| `PATCH /admin/reports/{id}`        | ADMIN-REPORT-002 (**targetType 필수**) |
| `GET   /admin/grade-requests`      | ADMIN-GRADE-001 (status·q)             |
| `PATCH /admin/grade-requests/{id}` | ADMIN-GRADE-002 (decision)             |
| `GET   /admin/origin-users`        | ADMIN-GRADE-003 (page·size 만)         |

> ⚠️ `PATCH /admin/reports/{id}` 는 본문에 `targetType` 이 **필수**다. 게시글 신고와 댓글 신고가
> 별도 테이블에 저장돼 reportId 만으로는 대상을 못 찾는다. 빠뜨리면 400 이 온다.

남은 간극

- **반려(REJECTED)**: 서버는 `decision=REJECTED` 를 받지만 시안에 반려 UI 가 없어 승인만 붙였다.
  탭도 심사 대기중/승인 완료 둘뿐이라 반려된 신청은 어느 탭에도 안 보인다(기획 확인 대기).
- **Origin 유저 관리**(`/admin/accounts`): 사이드바 시안 문구는 "어드민 계정 관리"지만 어드민 계정
  CRUD 엔드포인트가 없어 ADMIN-GRADE-003(Origin 등급 유저 목록)을 붙였다. 조회 전용.

## 구조

```
admin/
  types.ts                        # 도메인 타입 (ReportedItem, GradeApplication, AdminListQuery …)
  constants.ts                    # 사이드바 메뉴 · 탭 · 행 액션 · 페이지 크기 — 단일 출처
  format.ts                       # 표 표시 포맷(1,200 / 2026.07.23)
  api/
    dto.ts                        # BE 응답 타입(ADMIN-REPORT/GRADE 의 result 그대로)
    map.ts                        # 서버 enum·페이지 → 도메인 변환(순수)
    admin.ts                      # 목록 조회 + 처리(숨김·유지·승인) + Origin 유저 목록
  hooks/
    use-admin-filters.ts          # nuqs 기반 탭/검색/페이지 URL 상태
    use-reports.ts                # 신고 목록 조회 + 처리 mutation
    use-grade-applications.ts     # 등급 신청 목록 조회 + 승인 mutation
    use-origin-users.ts           # Origin 등급 유저 목록 조회
  components/
    admin-guard.tsx               # isAdmin 이 아니면 안내 화면
    admin-header.tsx              # 로고 + 인증영역 (검색·업로드 없음)
    admin-nav.tsx                 # 사이드바(lg+) / 가로 메뉴(lg 미만)
    admin-tabs.tsx                # 목록 상단 탭 (controlled)
    admin-search.tsx              # 목록 검색바(디바운스 → URL q → 서버 검색)
    admin-table.tsx               # ui/table 을 어드민 시안에 맞춘 공통 파트
    admin-states.tsx              # 로딩(스켈레톤)/빈/에러
    reported-content-view.tsx     # 신고 게시글·댓글 화면(target 으로 분기)
    grade-application-view.tsx    # 유저 등급 관리 화면
    origin-user-view.tsx          # Origin 등급 유저 목록 화면
```

라우트/셸은 `src/app/admin/{layout,page}.tsx` + `reports/{posts,comments}` · `users` · `accounts`.

## 규칙

- **권한**: `useAuthStatus().isAdmin`(access token 의 `role` 클레임) 만 접근. 클라이언트 가드는 UX 용이고
  **최종 권한 검증은 BE 몫**이다 — 토큰을 위조해 화면을 열어도 `/admin/*` 은 403 이 온다.
  `GET /users/me` 응답에는 권한 필드가 없어 프로필로는 판정할 수 없다.
- **탭·검색·페이지는 URL(nuqs)** — 공유·뒤로가기·새로고침에서 유지. 탭/검색이 바뀌면 `page` 는 1로 리셋.
- **행 액션**: 신고는 [숨김][유지], 등급은 [승인]. 현재 상태와 같은 쪽은 버튼이 아니라 상태 라벨로 표시해
  별도 상태 컬럼 없이 처리 결과가 읽히게 한다. 처리 성공 시 목록 쿼리를 무효화한다.
- **반응형**(모바일/태블릿 시안 없음): 표는 가로 스크롤로만 넘치고 **셀 텍스트는 줄바꿈하지 않는다**
  (`whitespace-nowrap` + 긴 텍스트는 말줄임). 좁은 폭에서는 셀 패딩/타이포가 한 단계 줄고,
  사이드바는 상단 가로 메뉴로 대체된다.
- **검색은 서버가 한다**(`q`). 입력은 300ms 디바운스 후 URL(`?q=`)에 실린다 — 신고는 대상 내용/작성자,
  등급은 아이디(이메일)/닉네임 부분일치.
- **신고 사유**는 서버 코드(`SPAM` …)로 오고 표에는 `REPORT_REASON_LABELS` 로 한글을 그린다.

## 테스트

```bash
source ~/.nvm/nvm.sh && nvm use
pnpm test src/features/admin
```

- 상태 매핑·페이지 변환·요청 파라미터(`targetType`·`q`·0-based page)는 `api/admin.test.ts` 에서 고정한다
  (MSW 로 `/api/v1/admin/*` 만 세우고 실제 함수를 호출).

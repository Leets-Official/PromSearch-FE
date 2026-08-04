# features/admin/

어드민(관리자) 화면 모듈. (PS-49)

시안: Figma `관리자 - 신고 게시글 관리`(551:3669) · `신고 댓글 관리`(1434:6473) · `유저 등급 관리`(1434:5839).
BE 스펙 확정 전에는 `src/mocks` 의 MSW 목(`/api/admin/*`)으로 동작한다.

## 구조

```
admin/
  types.ts                        # 도메인 타입 (ReportedItem, GradeApplication, AdminListQuery …)
  constants.ts                    # 사이드바 메뉴 · 탭 · 행 액션 · 페이지 크기 — 단일 출처
  format.ts                       # 표 표시 포맷(1,200 / 2026.07.23)
  api/admin.ts                    # 목록 조회 + 처리(숨김·유지·승인) fetch
  hooks/
    use-admin-filters.ts          # nuqs 기반 탭/검색/페이지 URL 상태
    use-reports.ts                # 신고 목록 조회 + 처리 mutation
    use-grade-applications.ts     # 등급 신청 목록 조회 + 승인 mutation
  components/
    admin-guard.tsx               # isAdmin 이 아니면 안내 화면
    admin-header.tsx              # 로고 + 인증영역 (검색·업로드 없음)
    admin-nav.tsx                 # 사이드바(lg+) / 가로 메뉴(lg 미만)
    admin-tabs.tsx                # 목록 상단 탭 (controlled)
    admin-table.tsx               # ui/table 을 어드민 시안에 맞춘 공통 파트
    admin-states.tsx              # 로딩(스켈레톤)/빈/에러
    reported-content-view.tsx     # 신고 게시글·댓글 화면(target 으로 분기)
    grade-application-view.tsx    # 유저 등급 관리 화면
```

라우트/셸은 `src/app/admin/{layout,page}.tsx` + `reports/{posts,comments}` · `users` · `accounts`.

## 규칙

- **권한**: `useAuthStatus().isAdmin` 만 접근. 클라이언트 가드는 UX 용이고 **최종 권한 검증은 BE 몫**
  (실제 인증이 붙으면 서버/미들웨어에서도 `/admin/*` 을 막아야 한다).
  개발 중에는 Dev 툴바 인증 축 `어드민` 또는 `NEXT_PUBLIC_MOCK_AUTH=admin` 으로 연다.
- **탭·검색·페이지는 URL(nuqs)** — 공유·뒤로가기·새로고침에서 유지. 탭/검색이 바뀌면 `page` 는 1로 리셋.
- **행 액션**: 신고는 [숨김][유지], 등급은 [승인]. 현재 상태와 같은 쪽은 버튼이 아니라 상태 라벨로 표시해
  별도 상태 컬럼 없이 처리 결과가 읽히게 한다. 처리 성공 시 목록 쿼리를 무효화한다.
- **반응형**(모바일/태블릿 시안 없음): 표는 가로 스크롤로만 넘치고 **셀 텍스트는 줄바꿈하지 않는다**
  (`whitespace-nowrap` + 긴 텍스트는 말줄임). 좁은 폭에서는 셀 패딩/타이포가 한 단계 줄고,
  사이드바는 상단 가로 메뉴로 대체된다.
- **어드민 계정 관리**는 시안이 없어 자리표시 페이지만 둔다(메뉴에서 404 가 나지 않도록).

## 테스트

```bash
source ~/.nvm/nvm.sh && nvm use
pnpm test src/mocks/admin-query.test.ts
```

목록 질의 계약(탭 필터·검색·정렬·페이지네이션)은 `src/mocks/admin-query.ts` 순수 함수로 고정한다.

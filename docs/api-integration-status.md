# API 연동 현황 — 담당자별 정리

> **기준: 2026-08-05 배포된 Swagger 실물 확인** (엔드포인트 39개)
> 요청 배경·협의 과정은 [`api-requests-be.md`](./api-requests-be.md) 참고
>
> **Swagger 보는 법** — Basic 인증이 걸려 있습니다.
> <https://api.promsearch.kr/swagger-ui/index.html> · 계정 `promsearch` / `promsearch*`
> 원본 JSON은 <https://api.promsearch.kr/docs-json>
>
> **읽는 법**
>
> - ✅ **사용 가능** — Swagger에 있고 구현 완료
> - ⏳ **계약만 있음** — Swagger에 있지만 **구현 상태: 미구현** (호출하면 501)
> - 🟡 **약속했지만 아직 스펙에 없음**
> - ⚠️ **확인 필요**

---

## 0. 한눈에 보기

| 영역              | 담당   | 상태                                              |
| ----------------- | ------ | ------------------------------------------------- |
| 홈 갤러리         | 조혜원 | ✅ 통합 API 나옴 → **FE 재작업 중**               |
| 프롬프트 상세     | 조혜원 | ✅ 전부 사용 가능 (필드명 2건만 대기)             |
| 프롬프트 업로드   | 조혜원 | ✅ 전부 사용 가능                                 |
| 관리자            | 조혜원 | ✅ **5개 전부 구현 + 요청 필드 반영** (연동 완료) |
| 로그인 · 회원가입 | 팀원   | ✅ 전부 사용 가능                                 |
| 마이페이지        | 팀원   | ✅ 전부 사용 가능 (게시글 목록·인사이트도 구현됨) |

### 🎉 이번에 새로 들어온 것

`GET /tags` · `GET /home/prompts`(통합) · 북마크 등록/취소 · 북마크 목록 · `unlock` ·
복사 수 · 신고 접수 · 로그아웃 · 프로필 이미지 3종 · 이미지 `imageUrl` · `isNewUser`

### ❌ MVP 범위 밖으로 확정된 것 (2026-08-05)

| 기능                      | 처리                                                  |
| ------------------------- | ----------------------------------------------------- |
| 수익 · 포인트 정책        | 목데이터 유지 (마이페이지 수익 화면)                  |
| 알림 목록 · 읽음 · 설정   | 목 또는 숨김. **알림 기능 전체가 범위 밖**            |
| 등급업 신청 **생성 화면** | 불필요 — PRIME 등급이면 자동으로 대기 명단에 들어간다 |
| 프롬프트 수정             | 불필요 (앞서 결정)                                    |
| 비공개 게시물 생성 경로   | 불필요 (앞서 결정)                                    |

### ⚠️ 아직 안 들어온 것 (회신은 받았음)

| 항목                              | 현재 스펙                             | 담당   |
| --------------------------------- | ------------------------------------- | ------ |
| 상세 응답 좋아요 네이밍           | 여전히 `recommendCount`/`recommended` | 조혜원 |
| 상세 응답 `customAiModel`         | 없음                                  | 조혜원 |
| `aiModelTagId` 단수화             | 여전히 `aiModelTagIds` 배열           | 조혜원 |
| `GET /users/me` 의 `authProvider` | 없음                                  | 팀원   |

→ FE는 **옛 이름·새 이름을 모두 받도록** 방어해 놨습니다. 나중에 배포돼도 안 깨집니다.

---

# 1. 🔴 공통 — 두 사람 다 쓰는 것

## 공통-1. 관심 직군 · 태스크 ✅ **해결 (더 안 물어봐도 됩니다)**

회신마다 이름이 달랐는데(`jobTagIds` / `interestJobTagIds` / `jobTags:["개발자"]`),
**Swagger 실물에서 확정됐습니다.**

```
SignupRequest.interestJobTagIds        : [integer]
SignupRequest.interestTaskTagIds       : [integer]
UpdateUserProfileRequest.interestJobTagIds  : [integer]
UpdateUserProfileRequest.interestTaskTagIds : [integer]
UserProfileResponse.interestJobTags    : [{ tagId, name }]
UserProfileResponse.interestTaskTags   : [{ tagId, name }]
```

- **요청은 숫자 ID 배열**, **응답은 `{tagId, name}` 객체 배열**
- 약관 페이지에 있던 `jobTags: ["개발자"]`(문자열)는 **오기입니다** — 실제 스펙이 아닙니다

## 공통-2. 태그 목록 ✅ `GET /api/v1/tags`

```
GET /api/v1/tags
GET /api/v1/tags?tagType=JOB      // JOB | TASK | AI_MODEL
→ { tags: [{ tagId, tagType, name }] }
```

`sortOrder`는 없습니다 → **`tagId` 순으로 정렬**해서 쓰면 됩니다.

**현재 태그 ID** (`src/features/gallery/tag-ids.ts` 에 하드코딩 중 — 이 API로 교체 예정)

| tagType    | ID       | name                                                  |
| ---------- | -------- | ----------------------------------------------------- |
| `JOB`      | 1~6      | 학생 / 직장인 / 자영업자 / 기획자 / 디자이너 / 개발자 |
| `TASK`     | 7~12     | PPT / 레포트 / 이메일 / 보고서 / 회의록 / 이미지 생성 |
| `AI_MODEL` | 13~15    | ChatGPT / Gemini / Claude                             |
| `AI_MODEL` | **없음** | 기타 → `customAiModel` 문자열로 저장                  |

**쓰는 곳**: 홈 필터·업로드 태그(조혜원) / 회원가입·온보딩·프로필 수정 관심사(팀원)

## 공통-3. 이름 필드 ⚠️ **아직 `username` 이 남아 있습니다**

`name`(실명)은 제거하기로 했고 `SignupRequest`에는 실제로 없습니다. 그런데:

| API                       | 필드                                         |
| ------------------------- | -------------------------------------------- |
| `POST /auth/signup`       | `nickname` ✅ (`name` 없음)                  |
| `LoginResponse`           | `nickname` ✅                                |
| `PATCH /users/me`         | `nickname` + ⚠️ **`name` 이 아직 남아 있음** |
| `GET /users/me`           | ⚠️ **`username`**                            |
| `GET /users/{id}/profile` | `nickname`                                   |
| `ADMIN-GRADE-001`         | ⚠️ **`username`**                            |

→ FE는 `nickname ?? username` 으로 받으면 안전합니다.

## 공통-4. 약관 ✅ **확정** — FE 화면과 정확히 일치

| 요청 키                     | 화면 문구                         | FE `TERMS` id       | 비고                  |
| --------------------------- | --------------------------------- | ------------------- | --------------------- |
| `agreements.serviceTerms`   | 프롬써치 이용약관                 | `service`           | 필수 (`true` 필요)    |
| `agreements.communityTerms` | 커뮤니티 이용규칙 동의            | `community`         | 필수                  |
| `agreements.contentPolicy`  | 콘텐츠 업로드 및 저작권 정책 동의 | `content-copyright` | 필수                  |
| `agreements.age14OrOver`    | 만 14세 이상입니다                | `age-over-14`       | 필수                  |
| `agreements.marketing`      | 마케팅 정보 수신 동의             | `marketing`         | 선택 (값은 필수 전송) |

> ⚠️ 스키마상 **다섯 개 모두 `required`** 입니다. `marketing` 도 **키는 반드시 보내야** 하고 값만 `false` 가능합니다.

---

# 2. 🅰 조혜원 — 홈 / 상세 / 업로드 / 관리자

## 2-1. 홈 ✅ 통합 API 나옴

```
GET /api/v1/home/prompts
  ?sort=LATEST|POPULAR &jobTagId=4 &taskTagIds=7,8
  &aiModelTagIds=13,14 &outputTypes=IMAGE,TEXT &q=대시보드 &page=0 &size=12
```

응답은 기존 홈 카드와 동일(`{ prompts, page }`) → FE 매핑 재사용.
`/home/prompts/popular`(HOME-002) · `/jobs/{id}`(HOME-003)는 호환용으로 남습니다.

**FE 할 일** — 임시 조치 걷어내기 (인기순 대체 / 50개 받아 클라 필터 / 제목만 검색)

## 2-2. 상세 ✅ 전부 사용 가능

| API                                  | 상태                                         |
| ------------------------------------ | -------------------------------------------- |
| 상세 조회 · 좋아요 · 댓글 CRUD       | ✅ 연동 완료                                 |
| **북마크** `/prompts/{id}/bookmarks` | ✅ **나옴** → 목 제거 예정                   |
| **잠금 해제** `/prompts/{id}/unlock` | ✅ **나옴** (응답 `Void` → 상세 재조회 필요) |
| **복사 수** `/prompts/{id}/copies`   | ✅ **나옴** → `{ promptId, copyCount }`      |
| **신고 접수**                        | ✅ **나옴** — 단, 경로가 예상과 다름 ↓       |

### 신고 경로가 예상과 다릅니다

```
POST /api/v1/reports/posts/{postId}        [MODERATION-001]
POST /api/v1/reports/comments/{commentId}  [MODERATION-002]
body: { reason, description }   // 둘 다 required
```

**신고 사유 enum** ✅ `SPAM` · `INAPPROPRIATE` · `COPYRIGHT` · `LOW_QUALITY` · `ETC`
→ 신고 모달에 사유 라디오를 붙일 수 있습니다.

## 2-3. 업로드 ✅ 전부 사용 가능

| 항목                     | 상태                                                              |
| ------------------------ | ----------------------------------------------------------------- |
| 게시 · 임시저장 · 이미지 | ✅ 연동 완료                                                      |
| **`imageUrl`**           | ✅ `PromptImageStatusResponse` 에 추가됨 → 임시저장 미리보기 해결 |
| 이미지 status            | ✅ `UPLOADING`/`UPLOADED`/`PROCESSING`/`READY`/`FAILED`           |
| `aiModelTagIds`          | ⚠️ 아직 **배열** — FE는 단수·복수 둘 다 보내는 중                 |
| `visibility`             | 요청에 `PUBLIC`/`PRIVATE` 있음. FE는 **항상 `PUBLIC`** 전송       |

**수정 기능은 만들지 않습니다**(2026-08-05 결정). Swagger에도 `PUT /prompts/{id}` · `/edit` 둘 다 없어서 BE와 일치합니다.

## 2-4. 관리자 ✅ **전부 구현 완료 + 요청 필드 반영됨** (2026-08-06 재확인)

```
GET   /admin/reports              ✅ (targetType, status, q, page, size)
PATCH /admin/reports/{id}         ✅ body: { targetType, status }   ← targetType 필수
GET   /admin/grade-requests       ✅ (status, q, page, size)
PATCH /admin/grade-requests/{id}  ✅ body: { decision }
GET   /admin/origin-users         ✅ 새로 생김 [ADMIN-GRADE-003] (page, size)
```

### 요청서 A-1 · A-2 · A-3 전부 반영됐습니다

| 요청                | 반영된 스펙                                                    |
| ------------------- | -------------------------------------------------------------- |
| A-1 신고 대상 요약  | `targetSummary { content, authorId, authorNickname, deleted }` |
| A-2 등급 신청 지표  | `nickname` · `postCount` · `totalLikeCount`                    |
| A-3 검색 파라미터   | 두 목록 모두 `q` (부분일치)                                    |
| A-1b 신고 상태 해석 | 확정 — `RESOLVED` 로 바꾸면 대상이 실제로 블라인드된다         |

→ FE 도 전부 맞췄습니다. 100건 받아 클라이언트에서 거르던 임시 검색 경로는 제거했고,
MSW 어드민 목도 지웠습니다(`.env.development` 의 `NEXT_PUBLIC_API_MOCKING=disabled`).

### ⚠️ 놓치기 쉬운 것 — `PATCH /admin/reports/{id}` 의 `targetType`

게시글 신고와 댓글 신고가 **별도 테이블**이라 `reportId` 만으로는 대상을 못 찾습니다.
`UpdateReportStatusRequest.required = ["status", "targetType"]` — 빠뜨리면 400 입니다.

### 남은 항목

| 항목                  | 상태                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------- |
| 어드민 권한 계정      | access token `role` 클레임(`USER`/`ADMIN`)으로 판정. `GET /users/me` 엔 권한 필드 없음 |
| 반려(REJECTED)        | 서버는 받지만 시안에 반려 UI·탭이 없어 승인만 붙임 (기획 확인 필요)                    |
| 어드민 계정 관리 화면 | 계정 CRUD 엔드포인트가 없어 `/admin/accounts` 에 ADMIN-GRADE-003 을 붙임               |
| 등급 enum             | `NODE                                                                                  | LINK          | SYNC      | CORE        | PRIME                        | ORIGIN`(예전`NORMAL` 아님) |
| 신고 사유 enum        | `SPAM                                                                                  | INAPPROPRIATE | COPYRIGHT | LOW_QUALITY | ETC` → 표에 한글 라벨로 표시 |

---

# 3. 🅱 팀원 — 로그인 · 회원가입 / 마이페이지

## 3-1. 회원가입 ✅ `POST /api/v1/auth/signup`

```json
{
  "nickname": "prompt-master", // required
  "email": "gildong@example.com", // required
  "password": "password123!", // required
  "profileImageUrl": "https://...", // optional
  "interestJobTagIds": [1, 2], // optional
  "interestTaskTagIds": [7, 8], // optional
  "agreements": {
    // required (5개 키 모두 전송)
    "serviceTerms": true,
    "communityTerms": true,
    "contentPolicy": true,
    "age14OrOver": true,
    "marketing": false
  }
}
```

- **`name`(실명) 없음** — 폼 그대로 두시면 됩니다
- 관심사는 **태그 ID 배열** → `src/features/gallery/tag-ids.ts` 재사용
- 닉네임 중복 확인 `GET /users/nicknames/availability?nickname=` 은 이미 연동돼 있습니다
  (`src/features/auth/api/nickname.ts`)

## 3-2. 소셜 로그인 ✅ `POST /api/v1/auth/oauth/{provider}`

`LoginResponse` 로 이런 게 옵니다:

```
accessToken, refreshToken, tokenType, expiresIn,
userId, nickname, profileImageUrl, email, isNewUser
```

- ✅ **`isNewUser`** 있음 → `true` 면 온보딩 모달
- ⚠️ 지원 provider 목록(`kakao`/`google`)은 Swagger에 안 적혀 있음 → BE 확인 필요

## 3-3. 로그아웃 ✅ `POST /api/v1/auth/logout`

Access Token만 있으면 됩니다(**body 없음**). 성공 후 `clearTokens()` 하세요 —
쿠키만 지우면 서버 Refresh 세션이 남습니다.

## 3-4. 프로필 이미지 ✅ **3개 세트**

```
POST   /api/v1/users/me/profile-image/upload-url   [USER-007] URL 발급
PUT    /api/v1/users/me/profile-image              [USER-008] 업로드 완료
DELETE /api/v1/users/me/profile-image              [USER-009] 제거
```

프롬프트 이미지와 같은 **Presigned 방식**입니다(워터마크 폴링만 없음).
흐름은 `src/features/upload/api/image.ts` 를 참고하시면 됩니다.

> ⚠️ **S3 PUT은 공통 axios(`api.put`)를 쓰면 안 됩니다.** baseURL(`/api/v1`)과 `Authorization` 헤더가
> 붙어서 S3 서명 검증이 깨집니다. 순수 `fetch` 로 보내세요.

## 3-5. 마이페이지

| API                                | 상태                               |
| ---------------------------------- | ---------------------------------- |
| `GET /users/me` 내 프로필          | ✅ 구현 완료                       |
| `PATCH /users/me` 프로필 수정      | ✅                                 |
| `PATCH /users/me/password`         | ✅                                 |
| `DELETE /users/me` 탈퇴            | ✅                                 |
| **`GET /users/me/bookmarks`**      | ✅ **새로 나옴**                   |
| `GET /prompts/me` 내 게시글        | ✅ **구현 완료** (2026-08-06 확인) |
| `GET /prompts/me/insights`         | ✅ **구현 완료** (2026-08-06 확인) |
| `DELETE /prompts/{id}` 게시물 삭제 | ✅ **구현 완료** (2026-08-05 회신) |
| 수익 / 포인트 정책                 | ❌ **MVP 범위 밖** → 목데이터 유지 |
| 알림 목록 / 읽음 처리 / 알림 설정  | ❌ **MVP 범위 밖** → 목 또는 숨김  |

### 내 프로필 응답

```json
{
  "username": "prompt-master",
  "profileImageUrl": "https://...",
  "email": "gildong@example.com",
  "point": 1200,
  "gradeName": "NORMAL",
  "interestJobTags": [{ "tagId": 2, "name": "직장인" }],
  "interestTaskTags": [{ "tagId": 7, "name": "PPT" }]
}
```

- 관심사가 `{tagId, name}` 으로 오니 **뱃지에 `name` 그대로** 쓰시면 됩니다
- ⚠️ `authProvider` 없음 → **소셜 계정일 때 비밀번호 변경 메뉴를 숨길 근거가 없습니다.** BE 추가 요청 필요

### 북마크 목록 필터 ✅ **멀티로 바뀌었습니다**

```
GET /api/v1/users/me/bookmarks
  ?taskTagIds=7,8 &aiModelTagIds=13,14 &outputTypes=IMAGE,TEXT &page=0 &size=12
```

단수(`taskTagId`)였던 게 **복수 + 콤마 구분**으로 바뀌어 홈 통합 API와 일관됩니다.
FE 북마크 화면의 멀티 선택 필터를 그대로 쓰면 되고, `use-bookmarks.ts` 는 이미 맞춰져 있습니다.

응답(`BookmarkPromptResponse`)은 홈 카드와 필드가 조금 다릅니다 —
`thumbnailImage`(홈은 `thumbnailImageUrl`), `viewCount`/`likeCount`가 평평하게 옴, `bookmarkedAt` 추가.

### 게시글 탭

```
PromptStatus     : DRAFT | ACTIVE | HIDDEN | DELETED
PromptVisibility : PUBLIC | PRIVATE
```

| 탭       | 조회 조건                              |
| -------- | -------------------------------------- |
| 게시완료 | `status=ACTIVE` + `visibility=PUBLIC`  |
| 임시저장 | `status=DRAFT`                         |
| 비공개   | `status=ACTIVE` + `visibility=PRIVATE` |

✅ **`visibility` 파라미터가 추가됐습니다**(`status` 는 여전히 required). 세 탭을 그대로 구분할 수 있고,
FE 도 이미 위 표대로 보내고 있습니다.

⚠️ **응답 필드가 전부 nullable 입니다**(`MyPromptSummaryResponse` 에 required 가 하나도 없음).
특히 `publishedAt` 은 "게시 완료 시각"이라 **임시저장 행에서는 null** 로 옵니다.
그대로 문자열로 받아 쓰면 화면이 죽습니다(실측: `Cannot read properties of null (reading 'slice')`).
`title` 도 null 일 수 있습니다.

- 여전히 **비공개 게시물을 만들 경로는 없습니다.** 업로드 폼에 공개범위 선택을 만들지 않기로 했습니다(2026-08-05 결정).
  → 비공개 탭은 당분간 항상 비어 있습니다.

또 **임시저장은 계정당 1개**라 임시저장 탭은 항상 0~1행입니다(7-6 확정). 탭 유지 여부는 기획 확인이 필요합니다.

### 게시글 수정/삭제 버튼

- **수정** — ❌ **기능 자체를 안 하기로 확정.** 버튼을 제거해 주세요.
  - `src/features/mypage/components/my-posts-table.tsx` — `showActions` 의 수정 버튼 · `onEdit`
  - `src/app/mypage/posts/page.tsx` — `TODO: 게시글 수정 화면으로 이동`
- **삭제** — ✅ `DELETE /prompts/{id}` 구현 완료

### 내 게시글 응답 필드

```
MyPromptSummaryResponse: { promptId, title, publishedAt, viewCount, recommendCount }
```

⚠️ 여기도 `recommendCount` 입니다(like 통일 미반영). 나중에 `likeCount` 로 바뀔 수 있으니
`likeCount ?? recommendCount` 로 받아두시길 권합니다.

---

# 4. BE에 물어볼 것

| #   | 질문                                                   | 담당   |
| --- | ------------------------------------------------------ | ------ |
| 1   | 어드민 권한 계정 발급 (또는 테스트 계정에 ADMIN role)  | 조혜원 |
| 2   | `GET /users/me` 에 **`authProvider`** 추가             | 팀원   |
| 3   | `GET /users/me` 의 `username` → `nickname` 통일 여부   | 팀원   |
| 4   | `PATCH /users/me` 에 남아 있는 **`name` 제거**         | 팀원   |
| 5   | 소셜 로그인 지원 provider 목록 (`kakao`/`google`?)     | 팀원   |
| 6   | 상세 응답 `likeCount`/`customAiModel` 배포 시점        | 조혜원 |
| 7   | 이미지 `failureCode` 값 목록 · 워터마크 처리 소요 시간 | 조혜원 |
| 8   | 어드민 신고 **반려** 상태를 목록에서 어떻게 보여줄지   | 조혜원 |

# 5. 기획에 확인할 것

| #   | 질문                                                                    | 담당   |
| --- | ----------------------------------------------------------------------- | ------ |
| 1   | 임시저장이 1개인데 마이페이지 "임시저장" 탭을 유지할지                  | 팀원   |
| 2   | 북마크 필터를 단일 선택으로 바꿀지 (BE가 단수라서)                      | 팀원   |
| 4   | 헤더 알림 벨을 **숨길지** — 알림이 MVP 밖이라 눌러도 아무 일이 없습니다 | 양쪽   |
| 3   | 등급 신청 "반려" 상태를 어드민 화면 어디에 노출할지                     | 조혜원 |

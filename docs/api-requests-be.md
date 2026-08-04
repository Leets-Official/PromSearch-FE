# BE API 추가 요청서

> 작성: FE | 기준: `develop` (2026-08-04) · PromSearch API v1 Swagger (2026-08-04 시점)
>
> FE에 **화면이 이미 구현되어 있는데 붙일 API가 없거나, 응답에 필요한 필드가 없는 항목**만 정리했습니다.
> Swagger에 그대로 옮기실 수 있도록 `path` / `parameters` / `requestBody` / `result` 형태로 적었습니다.
>
> **읽는 법**
>
> - 🆕 **신규** — 엔드포인트 자체가 없음
> - ➕ **확장** — 엔드포인트는 있는데 파라미터/필드가 부족함
> - ❓ **확인** — 기능 추가가 아니라 합의/답변만 필요함
> - 🔨 **구현 요청** — Swagger에 계약은 있으나 "미구현" 상태

---

## 0. 전체 요약

### P0 — 이게 없으면 해당 화면을 못 붙입니다

| ID          | 요청                                     | 종류 | 영향 화면                       |
| ----------- | ---------------------------------------- | ---- | ------------------------------- |
| [C-1](#c-1) | 태그 목록 조회                           | 🆕   | 홈 · 업로드 · 회원가입 · 온보딩 |
| [C-2](#c-2) | 관심 직군/태스크 저장·조회               | 🆕   | 회원가입 · 온보딩 · 마이페이지  |
| [H-1](#h-1) | 홈 목록 조회 (최신순 정렬 · 검색 · 필터) | 🆕➕ | 홈 갤러리                       |
| [D-1](#d-1) | 북마크 등록 / 취소                       | 🆕   | 홈 카드 · 상세 · 마이페이지     |
| [D-2](#d-2) | 프리미엄 포인트 열람(잠금 해제)          | 🆕   | 상세 (레시피 탭)                |
| [D-3](#d-3) | 신고 접수 (게시글 / 댓글)                | 🆕   | 상세 · 어드민 신고함            |
| [U-1](#u-1) | 업로드 이미지 조회용 URL                 | ➕   | 업로드 (임시저장 불러오기)      |
| [M-1](#m-1) | 내 프로필 조회 `USER-004`                | 🔨➕ | 마이페이지 전체 · 포인트 모달   |
| [A-1](#a-1) | 신고 목록에 대상 내용/작성자 포함        | 🔨➕ | 어드민 신고함                   |

### P1 — 있으면 이번 스프린트에 붙이고, 없으면 다음으로 미룹니다

| ID          | 요청                                      | 종류 | 영향 화면              |
| ----------- | ----------------------------------------- | ---- | ---------------------- |
| [C-3](#c-3) | 로그아웃                                  | 🆕   | 헤더 · 설정            |
| [C-4](#c-4) | 약관 동의 이력 저장                       | ➕   | 회원가입               |
| [C-5](#c-5) | 프로필 이미지 업로드 URL 발급             | 🆕   | 회원가입 · 프로필 수정 |
| [D-4](#d-4) | 프롬프트 복사 수 증가                     | 🆕   | 상세 (복사 버튼)       |
| [U-2](#u-2) | 프롬프트 수정                             | 🆕   | 마이페이지 → 수정      |
| [M-2](#m-2) | 내 게시글 목록에 DRAFT/PRIVATE 상태 지원  | ➕   | 마이페이지 게시글 탭   |
| [M-3](#m-3) | 내 북마크 목록                            | 🆕   | 마이페이지 북마크      |
| [M-4](#m-4) | 게시물 삭제 `PROMPT-009`                  | 🔨   | 마이페이지 게시글      |
| [A-2](#a-2) | 등급 신청 목록에 게시글 수/누적 추천 포함 | 🔨➕ | 어드민 등급 관리       |

### P2 — 화면은 있으나 목데이터로 두고 나중에 붙여도 됩니다

| ID          | 요청                      | 종류 | 영향 화면              |
| ----------- | ------------------------- | ---- | ---------------------- |
| [M-5](#m-5) | 수익 요약                 | 🆕   | 마이페이지 수익        |
| [M-6](#m-6) | 알림 설정 조회/변경       | 🆕   | 마이페이지 설정        |
| [M-7](#m-7) | 알림 목록 / 읽음 처리     | 🆕   | 헤더 알림 벨           |
| [M-8](#m-8) | 등급업 신청 생성          | 🆕   | 마이페이지 (정책 미정) |
| [A-3](#a-3) | 어드민 목록 검색 파라미터 | ➕   | 어드민 전체            |

### ❓ 확인만 필요 — [7. 확인 사항](#7-확인-사항) (11건)

---

## 1. 공통 · 인증

### <a id="c-1"></a>C-1. 태그 목록 조회 🆕 **P0**

**문제.** 직군별 목록(`HOME-002`), 프롬프트 생성(`PROMPT-008`의 `jobTagIds`/`taskTagIds`/`aiModelTagIds`),
회원가입 관심사 선택 — 전부 **태그 ID**를 요구하는데 태그 ID를 알아낼 방법이 명세에 전혀 없습니다.
현재 FE는 ID를 하드코딩(`src/features/gallery/tag-ids.ts`)하고 있어 BE에서 태그를 추가/변경하면 즉시 깨집니다.

```
GET /api/v1/tags
```

**[TAG-001] 태그 목록 조회** — 직군/태스크/AI모델 태그 목록을 조회합니다. 인증 불필요.

| name      | in    | type         | required | 설명                                        |
| --------- | ----- | ------------ | -------- | ------------------------------------------- |
| `tagType` | query | string(enum) | N        | `JOB` \| `TASK` \| `AI_MODEL`. 생략 시 전체 |

```json
{
  "success": true,
  "code": "COMMON-200",
  "message": "성공했습니다.",
  "result": {
    "tags": [
      { "tagId": 1, "tagType": "JOB", "name": "학생", "sortOrder": 0 },
      { "tagId": 10, "tagType": "TASK", "name": "PPT", "sortOrder": 0 },
      { "tagId": 20, "tagType": "AI_MODEL", "name": "ChatGPT", "sortOrder": 0 }
    ]
  }
}
```

- `name` 은 **화면에 그대로 노출**되는 표기명 (FE에서 별도 라벨 매핑 안 함)
- `sortOrder` 는 사이드바/드롭다운 노출 순서용. 없으면 `tagId` 순으로 쓰겠습니다 (선택)

#### C-1b. 현재 태그 ID 표 — ✅ **회신 완료 (2026-08-05)**

`src/features/gallery/tag-ids.ts` 에 반영했습니다.

| tagType    | tagId    | name        | 비고                                 |
| ---------- | -------- | ----------- | ------------------------------------ |
| `JOB`      | 1        | 학생        |                                      |
| `JOB`      | 2        | 직장인      |                                      |
| `JOB`      | 3        | 자영업자    |                                      |
| `JOB`      | 4        | 기획자      |                                      |
| `JOB`      | 5        | 디자이너    |                                      |
| `JOB`      | 6        | 개발자      |                                      |
| `TASK`     | 7        | PPT         |                                      |
| `TASK`     | 8        | 레포트      |                                      |
| `TASK`     | 9        | 이메일      |                                      |
| `TASK`     | 10       | 보고서      |                                      |
| `TASK`     | 11       | 회의록      |                                      |
| `TASK`     | 12       | 이미지 생성 |                                      |
| `AI_MODEL` | 13       | ChatGPT     |                                      |
| `AI_MODEL` | 14       | Gemini      |                                      |
| `AI_MODEL` | 15       | Claude      |                                      |
| `AI_MODEL` | **없음** | 기타        | 태그가 아니라 `customAiModel` 텍스트 |

> "기타"에 태그 ID가 없어 응답에 모델명을 실을 수단이 없던 문제는
> **[7-4](#7-4) 에서 `customAiModel` 필드 추가로 합의 완료**되었습니다 (2026-08-05).

---

### <a id="c-2"></a>C-2. 관심 직군 / 태스크 저장 · 조회 🆕 **P0**

**문제.** 회원가입 폼과 온보딩 모달에서 **관심 직군(최대 3개) + 태스크(최대 3개)를 필수로 받고 있는데**
이를 저장할 곳이 없습니다. `AUTH-001`(회원가입) 요청 본문에도, `USER-001`(프로필 수정)에도 없습니다.
마이페이지 프로필 카드에도 관심사가 뱃지로 노출됩니다.

**요청 A (권장) — 기존 API 확장**

`AUTH-001 POST /auth/signup` 요청 본문에 추가:

```json
{
  "name": "홍길동",
  "nickname": "prompt-master",
  "email": "gildong@example.com",
  "password": "password123!",
  "interestJobTagIds": [1, 2],
  "interestTaskTagIds": [10, 11]
}
```

`USER-001 PATCH /users/me` 요청 본문에 추가 (온보딩 · 프로필 수정에서 사용):

```json
{
  "nickname": "prompt-master",
  "profileImageUrl": "https://...",
  "interestJobTagIds": [1, 2],
  "interestTaskTagIds": [10, 11]
}
```

`USER-004 GET /users/me` 응답에 추가 ([M-1](#m-1) 참고):

```json
{
  "interestJobTags": [{ "tagId": 1, "name": "직장인" }],
  "interestTaskTags": [{ "tagId": 10, "name": "PPT" }]
}
```

**요청 B — 별도 엔드포인트** (`GET`/`PUT /users/me/interests`) 로 빼셔도 무방합니다. BE 편하신 쪽으로.

> 소셜 로그인(`AUTH-004`)으로 **자동 회원가입된 유저**는 관심사가 비어 있으므로,
> FE는 로그인 직후 관심사가 비어 있으면 온보딩 모달을 띄울 계획입니다.
> 이를 판단할 수 있게 `AUTH-004` 응답에 `isNewUser`(신규 가입 여부) 또는
> `onboardingCompleted` 플래그가 있으면 좋겠습니다. ([확인 7-8](#7-8))

---

### <a id="c-3"></a>C-3. 로그아웃 🆕 P1

Refresh Token 무효화 엔드포인트가 없습니다. FE에서 쿠키만 지우면 탈취된 Refresh Token이 만료까지 살아 있습니다.

```
POST /api/v1/auth/logout
```

**[AUTH-005] 로그아웃** — 인증 필요. 서버에 저장된 Refresh Token을 폐기합니다.

```json
// Request body (Refresh Token을 서버가 별도 보관하지 않는 구조면 body 없이 Access Token만으로도 OK)
{ "refreshToken": "eyJhbGciOiJIUzI1NiJ9..." }
```

| code | 상황      |
| ---- | --------- |
| 200  | 성공      |
| 401  | 인증 필요 |

---

### <a id="c-4"></a>C-4. 약관 동의 이력 저장 ➕ P1

회원가입 폼에서 약관(이용약관 / 개인정보 처리방침 / 마케팅 수신)에 동의를 받고 있는데,
`AUTH-001` 요청 본문에 이를 담을 필드가 없습니다. 개인정보 관련이라 이력이 남아야 할 것 같습니다.

`AUTH-001 POST /auth/signup` 요청 본문에 추가:

```json
{
  "agreements": {
    "termsOfService": true,
    "privacyPolicy": true,
    "marketing": false
  }
}
```

> 필수/선택 약관 구분과 항목 키 이름은 BE에서 정해주시면 FE가 맞추겠습니다.

---

### <a id="c-5"></a>C-5. 프로필 이미지 업로드 URL 발급 🆕 P1

`USER-001 PATCH /users/me` 는 `profileImageUrl`(문자열)을 받는데,
**프로필 이미지를 S3에 올릴 방법이 없습니다.** `PROMPT-002`(이미지 업로드 URL 발급)는
프롬프트 결과물 전용(워터마크 파이프라인 포함)이라 프로필에 쓰기 부적절합니다.

```
POST /api/v1/users/me/profile-image/upload-url
```

**[USER-007] 프로필 이미지 업로드 URL 발급** — 인증 필요.

```json
// Request
{ "fileName": "avatar.jpg", "contentType": "image/jpeg", "fileSize": 204800 }
```

```json
// Response result
{
  "uploadUrl": "https://example-bucket.s3.amazonaws.com/profile/...?signature=...",
  "imageUrl": "https://cdn.promsearch.com/profiles/12.jpg",
  "expiresAt": "2026-07-23T21:10:00+09:00"
}
```

- `imageUrl` 은 업로드 완료 후 `PATCH /users/me` 의 `profileImageUrl` 로 그대로 보낼 값입니다.
- 워터마크가 필요 없으므로 `complete` 검증 API는 없어도 됩니다 (있으면 그에 맞추겠습니다).

> **대안**: `multipart/form-data` 로 파일을 직접 받는 `POST /users/me/profile-image` 도 좋습니다.
> 프로필 이미지는 작아서 Presigned 플로우가 과할 수 있습니다. **BE 편하신 쪽으로 정해주세요.**

---

## 2. 홈 갤러리

### <a id="h-1"></a>H-1. 홈 프롬프트 목록 조회 (정렬 · 필터 · 검색) 🆕➕ **P0**

**문제.** 홈 화면은 아래 축이 **동시에** 걸립니다.

```
[사이드바] 홈(최신순) | 인기(좋아요순) | 직군별(6종)
[상단 필터] 태스크(멀티) · AI모델(멀티) · 결과물타입(멀티)
[헤더]     검색어
[하단]     페이지네이션
```

현재 명세에는 `popular` 와 `jobs/{jobTagId}` 두 개뿐이라
**최신순 전체 목록 · 검색 · 태스크/모델/결과물 필터**를 구현할 수 없습니다.
필터를 클라이언트에서 처리하면 페이지네이션이 깨집니다
(6장 받아서 2장만 남는데 "3페이지"가 그대로 표시되는 식).

#### 요청안 A — 통합 목록 API 신규 추가 (**권장**)

```
GET /api/v1/home/prompts
```

**[HOME-003] 홈 프롬프트 목록 조회**

| name            | in    | type            | required | default  | 설명                                                  |
| --------------- | ----- | --------------- | -------- | -------- | ----------------------------------------------------- |
| `sort`          | query | string(enum)    | N        | `LATEST` | `LATEST`(createdAt DESC) \| `POPULAR`(likeCount DESC) |
| `jobTagId`      | query | integer(int64)  | N        | –        | JOB 태그 1개 (사이드바 직군, 단일 선택)               |
| `taskTagIds`    | query | array\<int64\>  | N        | –        | TASK 태그 멀티. **콤마 구분** (`10,11`)               |
| `aiModelTagIds` | query | array\<int64\>  | N        | –        | AI_MODEL 태그 멀티. **콤마 구분**                     |
| `outputTypes`   | query | array\<string\> | N        | –        | `IMAGE` \| `TEXT` 멀티. **콤마 구분**                 |
| `q`             | query | string          | N        | –        | 검색어. **제목 + 설명** 부분일치(대소문자 무시, trim) |
| `page`          | query | integer(int32)  | N        | `0`      | 0부터 시작                                            |
| `size`          | query | integer(int32)  | N        | `12`     | 최대 50                                               |

**필터 결합 규칙 (중요)**

- **축 내부 OR, 축 간 AND**
  - `taskTagIds=10,11` → 태스크 10 **또는** 11
  - `taskTagIds=10&outputTypes=IMAGE` → 태스크 10 **이면서** 결과물이 이미지
- `status = ACTIVE` 이고 `visibility = PUBLIC` 인 것만 노출 (DRAFT/HIDDEN/논리삭제 제외)
- 결과 0건은 `prompts: []` + `totalElements: 0` (에러 아님)
- 인증 **선택**. 비로그인은 `viewerInteraction` 전부 `false`

**Response 200** — `result` 스키마는 **기존 HOME-001/002 와 동일하게** 유지 부탁드립니다 (FE 매핑 재사용).

```json
{
  "result": {
    "prompts": [
      {
        "promptId": 10,
        "title": "금융 대시보드 UI 프롬프트",
        "thumbnailImageUrl": "https://cdn.promsearch.com/prompts/10/thumb.webp",
        "outputType": "IMAGE",
        "contentType": "PREMIUM",
        "pricePoint": 500,
        "author": { "userId": 12, "nickname": "prompt-maker", "profileImageUrl": "https://..." },
        "statistics": { "viewCount": 120, "likeCount": 32, "commentCount": 7, "copyCount": 15 },
        "viewerInteraction": { "liked": true, "bookmarked": false },
        "tags": [{ "tagId": 4, "tagType": "JOB", "name": "디자이너" }],
        "createdAt": "2026-07-23T12:00:00Z"
      }
    ],
    "page": { "page": 0, "size": 12, "totalElements": 128, "hasNext": true }
  }
}
```

#### 요청안 B — 기존 API 최소 변경

1. `GET /api/v1/home/prompts/latest` 신규 추가 (파라미터·응답은 `HOME-001` 과 동일, 정렬만 `createdAt DESC`)
2. `popular` / `jobs/{jobTagId}` / `latest` **세 API 모두**에 `taskTagIds`, `aiModelTagIds`, `outputTypes`, `q` 추가

> FE 입장에서는 A가 훨씬 단순합니다. B로 가도 동작에는 문제 없습니다. **BE 편하신 쪽으로 정해주세요.**

**현재 FE 임시 조치** — 홈 기본 탭은 `popular` 를 임시 호출하고, 검색·필터는 받아온 페이지 안에서만
클라이언트 필터링 중입니다 (페이지네이션 부정확). API 나오면 즉시 되돌립니다.

---

## 3. 프롬프트 상세

### <a id="d-1"></a>D-1. 북마크 등록 / 취소 🆕 **P0**

**문제.** 홈 카드(`HOME-001/002`)와 상세(`PROMPT-001`) 응답이 모두 `viewerInteraction.bookmarked` 를
내려주는데, **이를 변경할 API가 명세에 없습니다.** 좋아요는 `COMMUNITY-001/002` 로 있습니다.
상세 화면에 북마크 버튼이 이미 구현되어 있고, 마이페이지에 북마크 목록 화면도 있습니다.

좋아요와 대칭으로 부탁드립니다.

```
POST   /api/v1/prompts/{promptId}/bookmarks
DELETE /api/v1/prompts/{promptId}/bookmarks
```

**[COMMUNITY-003] 북마크 등록** / **[COMMUNITY-004] 북마크 취소**

| name       | in   | type           | required | 설명            |
| ---------- | ---- | -------------- | -------- | --------------- |
| `promptId` | path | integer(int64) | Y        | 프롬프트 식별자 |

```json
{ "result": { "promptId": 10, "bookmarked": true, "bookmarkCount": 5 } }
```

> `bookmarkCount` 는 화면에 노출하지 않으므로 **없어도 됩니다.**
> 다만 좋아요 응답(`likeCount`)과 형태를 맞추시려면 넣어주셔도 좋습니다.

| code                      | 상황                                        |
| ------------------------- | ------------------------------------------- |
| 201 (POST) / 200 (DELETE) | 성공                                        |
| 400                       | 유효하지 않은 프롬프트 ID                   |
| 401                       | 인증 필요                                   |
| 404                       | 프롬프트 없음 / (DELETE) 등록된 북마크 없음 |
| 409                       | (POST) 이미 북마크한 프롬프트               |

---

### <a id="d-2"></a>D-2. 프리미엄 포인트 열람 (잠금 해제) 🆕 **P0**

**문제.** `PROMPT-001` 응답의 `access.reason` 에 **`UNLOCKED`** 값이 정의되어 있습니다.
즉 "포인트를 내고 열람한 상태"가 서버 모델에 존재하는데, **잠금을 해제하는 API가 없습니다.**

상세 화면에는 이미 "포인트로 전문 보기" CTA → 포인트 결제 확인 모달(보유/필요/차감 후 잔액)이
구현되어 있고, 확인 버튼에 붙일 API만 없는 상태입니다.

```
POST /api/v1/prompts/{promptId}/unlock
```

**[PROMPT-012] 프롬프트 포인트 열람** — 인증 필요. 프롬프트 `pricePoint` 만큼 포인트를 차감하고
본문 열람 권한을 부여합니다. **동일 프롬프트 재요청은 멱등**(이미 열람 권한이 있으면 차감 없이 200).

```json
{
  "result": {
    "promptId": 10,
    "unlocked": true,
    "spentPoint": 500,
    "remainingPoint": 700,
    "promptBody": "cinematic food photography of pasta..."
  }
}
```

- `promptBody` 를 함께 주시면 FE가 상세를 재조회하지 않아도 됩니다. **없으면 재조회하겠습니다** (선택).
- `remainingPoint` 는 결제 후 헤더/모달의 보유 포인트를 갱신하는 데 씁니다.

| code         | 상황                                           |
| ------------ | ---------------------------------------------- |
| 200          | 성공 (이미 열람 권한이 있는 경우 포함)         |
| 400          | 유효하지 않은 프롬프트 ID                      |
| 401          | 인증 필요                                      |
| 402 또는 409 | **포인트 부족** — 코드 정해주시면 맞추겠습니다 |
| 404          | 프롬프트 없음                                  |
| 409          | FREE 프롬프트라 결제 대상이 아님               |

> 포인트 부족을 어떤 상태 코드/에러 코드로 주실지 알려주세요. FE에서 "포인트가 N P 부족해요" 안내를 띄웁니다.

---

### <a id="d-3"></a>D-3. 신고 접수 (게시글 / 댓글) 🆕 **P0**

**문제.** Swagger에 "신고 생성 API는 이번 범위에서 미구현"이라고 명시되어 있는데,
FE 상세 화면에는 **게시글 신고 · 댓글 신고 메뉴가 이미 구현**되어 있습니다.
또 어드민 신고함(`ADMIN-REPORT-001`)은 신고 데이터가 있어야 의미가 있는데,
생성 경로가 없으면 신고함이 영원히 비어 있습니다.

```
POST /api/v1/reports
```

**[REPORT-001] 신고 접수** — 인증 필요.

```json
// Request
{
  "targetType": "POST",
  "targetId": 10,
  "reason": "SPAM",
  "description": "동일 게시물이 반복 도배되고 있습니다."
}
```

| field         | type         | required | 설명                                      |
| ------------- | ------------ | -------- | ----------------------------------------- |
| `targetType`  | string(enum) | Y        | `POST` \| `COMMENT` (ADMIN-REPORT와 동일) |
| `targetId`    | integer      | Y        | 프롬프트 ID 또는 댓글 ID                  |
| `reason`      | string(enum) | Y        | **enum 값 목록을 알려주세요** (아래 참고) |
| `description` | string       | N        | 상세 사유 (최대 500자)                    |

```json
// Response result
{ "reportId": 1, "targetType": "POST", "targetId": 10, "status": "PENDING", "createdAt": "..." }
```

| code | 상황              |
| ---- | ----------------- |
| 201  | 신고 접수 성공    |
| 400  | 요청 값 검증 실패 |
| 401  | 인증 필요         |
| 404  | 신고 대상 없음    |
| 409  | 이미 신고한 대상  |

> **`reason` enum 값 목록을 회신해 주세요.** (`ADMIN-REPORT-001` 예시에 `SPAM` 만 보입니다)
> FE는 신고 모달에서 사유를 라디오로 고르게 할 예정입니다. 예: 스팸 / 욕설·혐오 / 음란물 / 저작권 침해 / 기타.
> 현재는 사유 선택 없이 확인 모달만 있어서, enum이 정해지면 UI를 맞추겠습니다.

---

### <a id="d-4"></a>D-4. 프롬프트 복사 수 증가 🆕 P1

`statistics.copyCount` 가 목록·상세 응답과 마이페이지 인사이트(`PROMPT-011`)에 모두 있는데,
**이 값을 올리는 API가 없습니다.** 상세 화면에 프롬프트 본문 복사 버튼이 구현되어 있습니다.

```
POST /api/v1/prompts/{promptId}/copies
```

**[PROMPT-013] 프롬프트 복사 기록** — 인증 선택(비회원 복사도 카운트할지는 BE 정책에 따름).

```json
{ "result": { "promptId": 10, "copyCount": 16 } }
```

> 어뷰징 방지를 위해 동일 유저의 짧은 시간 내 반복 요청은 서버에서 무시하셔도 됩니다
> (FE는 응답 `copyCount` 를 그대로 반영만 합니다).

---

## 4. 프롬프트 업로드

### <a id="u-1"></a>U-1. 업로드한 이미지의 조회용 URL ➕ **P0**

**문제.** 업로드 플로우는 다음과 같습니다.

```
PROMPT-002(URL 발급) → S3 PUT → PROMPT-003(완료) → PROMPT-004(상태 폴링) → PROMPT-008(게시)
```

이 중 **어느 응답에도 "그 이미지를 화면에 보여줄 URL"이 없습니다.**

- `PROMPT-002` → `uploadUrl` (PUT 전용 Presigned)
- `PROMPT-003` → `imageId`, `status`, `uploadedAt`
- `PROMPT-004` → `imageId`, `status`, `failureCode`
- `PROMPT-006`(임시저장 조회) → `images: [{ imageId, sortOrder, thumbnail }]`

업로드 **직후**에는 FE가 로컬 파일로 미리보기를 만들 수 있지만,
**임시저장을 불러올 때는 `imageId` 만 있고 보여줄 이미지가 없습니다.**
(업로드 페이지에 "이어서 작성하기" 모달이 이미 구현되어 있습니다)

**요청** — 아래 중 **하나**면 됩니다.

- (권장) `PROMPT-004 GET /prompt-images/statuses` 응답에 `imageUrl` 추가

  ```json
  {
    "result": {
      "images": [
        {
          "imageId": "123e4567-...",
          "status": "READY",
          "failureCode": null,
          "imageUrl": "https://storage.example.com/final/...?X-Amz-Signature=..."
        }
      ]
    }
  }
  ```

- 또는 `PROMPT-006 GET /prompts/draft` 응답의 `images[]` 에 `imageUrl` 추가

`status` 가 `READY` 가 아닐 때는 `null` 이어도 됩니다 (FE가 로딩/실패 상태로 렌더).

#### 참고 — `PROMPT-004` 의 `status` enum 값 목록도 알려주세요

예시에 `PROCESSING` 만 보입니다. FE는 상태에 따라 스피너/실패/완료를 렌더해야 하므로
전체 값(`UPLOADED` / `PROCESSING` / `READY` / `FAILED` 등)과 폴링 종료 조건이 필요합니다. ([확인 7-9](#7-9))

---

### <a id="u-2"></a>U-2. 프롬프트 수정 🆕 P1

생성(`PROMPT-008`)과 삭제(`PROMPT-009`)는 있는데 **수정이 없습니다.**
마이페이지 게시글 표에 "수정" 버튼이 구현되어 있습니다.

```
PUT /api/v1/prompts/{promptId}
```

**[PROMPT-014] 프롬프트 수정** — 작성자 본인만. 요청 본문은 `PROMPT-008`(생성)과 **동일**하게,
응답도 생성과 동일하게(`promptId`/`status`/`visibility`/`pricePoint`/`updatedAt`) 주시면 됩니다.

| code | 상황                                  |
| ---- | ------------------------------------- |
| 200  | 수정 성공                             |
| 400  | 요청 값 검증 실패                     |
| 401  | 인증 필요                             |
| 403  | 작성자 권한 없음 / 이미지 소유권 없음 |
| 404  | 프롬프트, 태그 또는 이미지 없음       |

> 수정 화면을 채우려면 **작성자 본인이 자기 게시물 원본을 읽는 경로**도 필요합니다.
> `PROMPT-001`(상세 조회)이 `access.reason = AUTHOR` 로 본문 전문을 주는 것으로 이해했는데,
> 태그 ID 배열(`jobTagIds` 등)과 `visibility` 는 상세 응답에 없습니다. ([확인 7-10](#7-10))

---

## 5. 마이페이지

### <a id="m-1"></a>M-1. 내 프로필 조회 `USER-004` 🔨➕ **P0**

Swagger에 **"구현 상태: 미구현"** 으로 되어 있습니다. 마이페이지 전 화면 + 포인트 결제 모달(보유 포인트)이
이 API에 걸려 있어 **가장 먼저 구현이 필요합니다.**

현재 응답 스키마:

```json
{
  "username": "hanharam",
  "profileImageUrl": "...",
  "email": "...",
  "point": 1200,
  "gradeName": "ORIGIN"
}
```

**추가 요청 필드:**

| field                                  | 필요한 이유                                                                          |
| -------------------------------------- | ------------------------------------------------------------------------------------ |
| `userId`                               | 내 댓글/게시물 판정, 프로필 링크                                                     |
| `nickname`                             | `username` 과 별개인지 불명확 ([확인 7-11](#7-11))                                   |
| `interestJobTags` / `interestTaskTags` | 프로필 카드 관심사 뱃지 ([C-2](#c-2))                                                |
| `authProvider`                         | 설정 화면에서 **소셜 계정이면 비밀번호 변경 메뉴를 숨김** (`EMAIL`/`GOOGLE`/`KAKAO`) |
| `passwordUpdatedAt`                    | 설정 화면 "최근 비밀번호 변경일" 표기 (선택)                                         |

---

### <a id="m-2"></a>M-2. 내 게시글 목록에 DRAFT / PRIVATE 지원 ➕ P1

`PROMPT-010 GET /prompts/me` 는 `status` 파라미터가 **`ACTIVE` 만 지원**한다고 명시되어 있습니다.
그런데 마이페이지 게시글 탭은 **게시완료 / 임시저장 / 비공개 3개**입니다.

**요청**

- `status` enum에 `DRAFT`, `PRIVATE`(또는 비공개에 해당하는 값) 추가
- `PROMPT-010` 자체가 **미구현** 상태이므로 구현도 함께 부탁드립니다 🔨

> 참고: 임시저장은 `PROMPT-005~007` 기준 **계정당 단 1개**인데, 마이페이지 "임시저장" 탭은
> 목록(여러 개)을 전제로 만들어져 있습니다. 임시저장이 1개면 탭에 항상 1행만 나오는데,
> 이게 의도한 정책이 맞는지 확인 부탁드립니다. ([확인 7-6](#7-6))

또 "비공개"는 `PROMPT-008` 의 `visibility` 필드(`PUBLIC`/`PRIVATE`)로 이해했는데,
`status`(ACTIVE/DRAFT)와 `visibility`(PUBLIC/PRIVATE)를 하나의 탭 축으로 합쳐도 되는지 확인 부탁드립니다.

---

### <a id="m-3"></a>M-3. 내 북마크 목록 🆕 P1

마이페이지에 북마크 화면(그리드 + 태스크/모델/결과물 필터 + 페이지네이션)이 구현되어 있는데 API가 없습니다.

```
GET /api/v1/users/me/bookmarks
```

**[USER-008] 내 북마크 목록 조회** — 인증 필요. 최근 북마크순.

| name            | in    | type            | required | default | 설명      |
| --------------- | ----- | --------------- | -------- | ------- | --------- |
| `taskTagIds`    | query | array\<int64\>  | N        | –       | 콤마 구분 |
| `aiModelTagIds` | query | array\<int64\>  | N        | –       | 콤마 구분 |
| `outputTypes`   | query | array\<string\> | N        | –       | 콤마 구분 |
| `page`          | query | integer         | N        | `0`     |           |
| `size`          | query | integer         | N        | `12`    | 최대 50   |

**응답은 `HOME-001` 과 동일한 `{ prompts, page }` 형태**로 주시면 FE 매핑을 그대로 재사용합니다.

> 필터 파라미터가 부담되시면 **`page`/`size` 만이라도** 먼저 주세요. 필터는 나중에 붙이겠습니다.

---

### <a id="m-4"></a>M-4. 게시물 삭제 `PROMPT-009` 🔨 P1

Swagger에 계약은 있으나 **"미구현"** 입니다. 마이페이지 게시글 표에 삭제 버튼이 있습니다. 구현 부탁드립니다.

---

### <a id="m-5"></a>M-5. 수익 요약 🆕 P2

마이페이지에 수익 화면(이번 달 수익 / 누적 수익 / 판매 수 / 조회수 / 추천수 / 복사수)이 구현되어 있습니다.
조회/추천/복사는 `PROMPT-011`(인사이트)로 커버되지만 **수익·판매 관련 값이 없습니다.**

```
GET /api/v1/users/me/revenue
```

```json
{
  "result": {
    "monthlyRevenue": 1000,
    "totalRevenue": 12000,
    "salesCount": 24,
    "settlementAvailable": 8000
  }
}
```

> 포인트 → 현금 정산 정책이 아직 없다면 **이 항목은 보류해도 됩니다.**
> 화면은 목데이터로 두겠습니다. 정책이 정해지면 알려주세요.

---

### <a id="m-6"></a>M-6. 알림 설정 조회 / 변경 🆕 P2

마이페이지 설정에 알림 토글 5종(새 추천 / 새 북마크 / 새 댓글 / 프롬프트 구매 / 마케팅)이 구현되어 있습니다.

```
GET   /api/v1/users/me/notification-settings
PATCH /api/v1/users/me/notification-settings
```

```json
// GET result / PATCH request
{
  "recommend": true,
  "bookmark": true,
  "comment": true,
  "purchase": true,
  "marketing": false
}
```

---

### <a id="m-7"></a>M-7. 알림 목록 / 읽음 처리 🆕 P2

헤더에 알림 벨 아이콘이 구현되어 있으나 클릭 시 동작이 없습니다. M-6(알림 설정)이 있는데
정작 **알림 자체를 받아올 API가 없습니다.**

```
GET   /api/v1/notifications?page=0&size=20
PATCH /api/v1/notifications/{notificationId}/read
PATCH /api/v1/notifications/read-all
GET   /api/v1/notifications/unread-count
```

> 알림은 기획상 후순위로 보이므로 **P2로 두었습니다.** 스코프에서 빼실 거면 알려주세요 —
> FE에서 벨 아이콘을 감추겠습니다.

---

### <a id="m-8"></a>M-8. 등급업 신청 생성 🆕 P2

Swagger에 "신청 생성 방식은 정책 미정으로 이번 범위에서 미구현"으로 되어 있습니다.
`ADMIN-GRADE-001/002`(승인/반려)는 신청 데이터가 있어야 동작하므로, 생성 경로가 결국 필요합니다.

```
POST /api/v1/users/me/grade-requests
```

> 정책이 정해지면 알려주세요. FE 화면도 아직 없습니다.

---

## 6. 어드민

> `ADMIN-REPORT-001/002`, `ADMIN-GRADE-001/002` 는 **네 개 모두 "미구현"** 상태입니다.
> 어드민 화면(신고 게시글 / 신고 댓글 / 유저 등급 관리)은 FE에 이미 다 구현되어 있습니다. 🔨

### <a id="a-1"></a>A-1. 신고 목록에 대상 내용 / 작성자 포함 ➕ **P0**

**문제.** 어드민 신고함 표는 아래 컬럼입니다.

```
[ 내용 (게시글 제목 or 댓글 본문) | 작성자 | 신고 사유 | 상태 | (숨김)(유지) ]
```

그런데 `ADMIN-REPORT-001` 응답에는 **`targetId`(숫자)만 있고 내용도 작성자도 없습니다.**
지금 구조로는 신고 100건을 표시하려면 FE가 상세 조회를 100번 해야 합니다.

`ADMIN-REPORT-001` 응답 `content[]` 에 아래 필드 추가 요청:

```json
{
  "reportId": 1,
  "targetType": "POST",
  "targetId": 10,
  "reason": "SPAM",
  "description": "동일 게시물이 반복 도배되고 있습니다.",
  "status": "PENDING",
  "reporterId": 5,
  "createdAt": "2026-07-23T12:00:00Z",

  "targetSummary": {
    "content": "금융 대시보드 UI 프롬프트",
    "authorId": 12,
    "authorNickname": "prompt-maker",
    "deleted": false
  }
}
```

- `content` — `targetType=POST` 면 **제목**, `COMMENT` 면 **댓글 본문**(길면 서버에서 잘라 주셔도 됩니다)
- `deleted` — 이미 삭제/블라인드된 대상이면 표에서 회색 처리

### A-1b. 신고 처리 상태 매핑 확인 ❓

FE 표의 액션은 **[숨김] / [유지]** 두 개이고, 탭은 **전체 / 숨김 / 유지** 입니다.
`ADMIN-REPORT-002` 는 `RESOLVED` / `REJECTED` 를 받습니다. 아래 매핑이 맞나요?

| FE 액션  | BE status  | 기대 동작                                          |
| -------- | ---------- | -------------------------------------------------- |
| 숨김     | `RESOLVED` | 신고 인용 → **대상 게시글/댓글이 실제로 블라인드** |
| 유지     | `REJECTED` | 신고 기각 → 대상은 그대로                          |
| (미처리) | `PENDING`  | 초기 상태                                          |

**특히 "숨김 처리 시 대상 콘텐츠가 실제로 블라인드되는지"** 확인이 필요합니다.
상태만 바뀌고 콘텐츠는 그대로라면, 콘텐츠를 숨기는 별도 API가 추가로 필요합니다.

> 관련: 상세 댓글 목록(`COMMENT-001`)의 `status` 에 블라인드를 나타내는 값이 있나요?
> FE 댓글 UI는 블라인드 댓글을 "블라인드 처리된 댓글입니다"로 렌더합니다. ([확인 7-7](#7-7))

---

### <a id="a-2"></a>A-2. 등급 신청 목록에 게시글 수 / 누적 추천 포함 ➕ P1

어드민 등급 관리 표 컬럼은 다음과 같습니다.

```
[ 아이디 | 게시글 수 | 누적 추천 | 신청일자 | (승인) ]
```

`ADMIN-GRADE-001` 응답에는 `postCount` / `likeCount` 가 **없습니다.** 승인 판단의 핵심 지표라 필요합니다.

```json
{
  "gradeRequestId": 1,
  "userId": 5,
  "username": "hanharam",
  "nickname": "prompt-master",
  "currentGrade": "PRIME",
  "requestedGrade": "ORIGIN",
  "status": "PENDING",
  "requestedAt": "2026-07-23T12:00:00Z",
  "processedAt": null,

  "postCount": 8,
  "totalLikeCount": 124
}
```

- `nickname` 도 추가 요청 — 표에서 아이디 또는 닉네임으로 검색하게 되어 있습니다
- `USER-006`(상대 프로필)에 이미 `promptCount` / `totalLikeCount` 가 있으니 같은 계산을 재사용하시면 됩니다

---

### <a id="a-3"></a>A-3. 어드민 목록 검색 파라미터 ➕ P2

`ADMIN-REPORT-001` / `ADMIN-GRADE-001` 에 검색어 파라미터가 없습니다.
FE에는 검색 입력이 구현되어 있습니다 (등급 관리 = 아이디/닉네임 검색).

```
GET /api/v1/admin/grade-requests?q=hanharam&status=PENDING&page=0&size=20
GET /api/v1/admin/reports?q=도배&targetType=POST&status=PENDING&page=0&size=20
```

| name | in    | type   | 설명                                                           |
| ---- | ----- | ------ | -------------------------------------------------------------- |
| `q`  | query | string | 등급: 아이디/닉네임 부분일치 · 신고: 대상 내용/작성자 부분일치 |

> 급하지 않습니다. 당장은 FE에서 검색 입력을 감추거나 현재 페이지 내 필터로 두겠습니다.

---

## 7. 확인 사항

기능 추가가 아니라 **답변/합의**만 필요한 항목입니다.

<a id="7-1"></a>

### 7-1. "좋아요" vs "추천" — 네이밍이 API 안에서 갈립니다

같은 개념으로 보이는데 응답마다 이름이 다릅니다.

| 위치                         | 필드                                                         |
| ---------------------------- | ------------------------------------------------------------ |
| `HOME-001/002` (목록 카드)   | `statistics.likeCount`, `viewerInteraction.liked`            |
| `PROMPT-001` (상세)          | `statistics.recommendCount`, `viewerInteraction.recommended` |
| `PROMPT-010/011` (내 게시글) | `recommendCount`, `totalRecommends`                          |
| `COMMUNITY-001/002` (토글)   | `/likes`, `liked`, `likeCount`                               |

**같은 값이 맞나요?** 맞다면 한쪽으로 통일 부탁드립니다 (FE는 어느 쪽이든 맞추겠습니다).
다르다면 각각 무엇인지 알려주세요.

<a id="7-2"></a>

### 7-2. `contentType` 에 `MASTER` 가 있나요?

FE 기획에는 등급이 **무료 / 프리미엄 / 마스터** 3종인데 Swagger 예시에는 `FREE`, `PREMIUM` 만 보입니다.
있으면 enum 값 이름을, 없으면 알려주세요 (FE 타입에서 제거하겠습니다).

<a id="7-3"></a>

### 7-3. `tags[].name` 을 화면에 그대로 써도 되나요?

카드/상세 태그 칩에 `name` 을 그대로 렌더할 계획입니다 (`ChatGPT · 디자이너 · PPT · 이미지`).
내부 코드값(`DESIGNER` 같은)이 올 가능성이 있다면 알려주세요.

<a id="7-4"></a>

### 7-4. AI모델 "기타"(자유 입력) 표시 — ✅ **합의 완료 (2026-08-05)**

배경: [C-1b](#c-1) 회신으로 **"기타"는 태그 행이 없고 `customAiModel` 텍스트로만 저장**되는 것이 확정됐습니다.
따라서 기타 모델 프롬프트는 응답 `tags` 에 `AI_MODEL` 항목이 아예 없어 모델명을 표시할 수단이 없었습니다.

**BE 회신** — 응답에 `customAiModel: string | null` 을 추가하기로 확정.

```json
{
  "promptId": 10,
  "tags": [{ "tagId": 4, "tagType": "JOB", "name": "기획자" }],
  "customAiModel": "GPT 4.1 Mini"
}
```

FE 반영 완료(`api/dto.ts`, `api/map.ts`). 표시 우선순위는 다음과 같습니다.

1. `AI_MODEL` 태그가 있고 아는 모델(ChatGPT/Gemini/Claude) → 그 이름
2. 태그가 없음(= 기타) → **`customAiModel`**
3. 둘 다 없음(BE 배포 전 응답) → "기타"

적용 범위는 요청·수락 모두 **홈 목록(`HOME-001/002/003`) + 상세(`PROMPT-001`)** 기준입니다.

> FE 타입은 배포 전 응답도 안전하게 다루려고 당분간 **옵셔널**(`customAiModel?: string | null`)로 두었습니다.
> 배포 완료되면 `string | null` 로 좁히겠습니다. **배포 시점만 알려주세요.**

<a id="7-5"></a>

### 7-5. 비로그인 응답의 `viewerInteraction`

`null` 인가요, `{ liked: false, bookmarked: false }` 인가요? FE는 둘 다 안전하게 처리하겠지만
스키마에 명시해 주시면 좋겠습니다.

<a id="7-6"></a>

### 7-6. 임시저장은 계정당 1개가 확정인가요?

`PROMPT-005~007` 은 **계정당 1개 슬롯**(생성 또는 교체) 전제입니다.
마이페이지 "임시저장" 탭은 목록 UI라 항상 1행만 나오게 됩니다. 의도한 정책이 맞나요?

<a id="7-7"></a>

### 7-7. 댓글 `status` enum 값 목록

`COMMENT-001` 예시에 `ACTIVE` 만 보입니다. 블라인드/삭제 상태를 나타내는 값이 있나요?
FE는 블라인드 댓글을 "블라인드 처리된 댓글입니다"로, 삭제 댓글을 "삭제된 댓글입니다"로 렌더합니다.

<a id="7-8"></a>

### 7-8. 소셜 로그인 관련

- `AUTH-004 POST /auth/oauth/{provider}` 의 **지원 provider 목록**은? FE에는 `kakao`, `google` 버튼이 있습니다.
- `redirectUri` 는 FE가 보내는 값 그대로 쓰면 되나요? BE에 등록된 화이트리스트가 있나요?
- 응답에 **신규 가입 여부**(`isNewUser` 등)를 넣어주실 수 있나요? 신규면 온보딩 모달을 띄웁니다. ([C-2](#c-2))

<a id="7-9"></a>

### 7-9. `PROMPT-004` 이미지 `status` enum 값 목록과 폴링 종료 조건

예시에 `PROCESSING` 만 보입니다. 전체 값과 "언제 폴링을 멈춰도 되는지"(최종 상태)를 알려주세요.
`failureCode` 값 목록도 함께 주시면 실패 안내 문구를 맞추겠습니다.

<a id="7-10"></a>

### 7-10. 작성자가 자기 게시물을 **수정 화면에 불러올** 경로

`PROMPT-001`(상세)은 `access.reason = AUTHOR` 로 본문을 주지만,
수정 폼을 채우려면 **`jobTagIds` / `taskTagIds` / `aiModelTagIds` / `visibility` / `customAiModel`** 이 필요한데
상세 응답에는 태그가 `{tagId, tagType, name}` 형태로만 오고 `visibility` 는 없습니다.

- 상세 응답에 `visibility` 를 추가해 주시면 FE가 `tags` 에서 ID를 뽑아 쓰겠습니다. (가장 간단)
- 또는 작성자 전용 조회 API(`GET /prompts/{promptId}/edit`)를 주셔도 됩니다.

<a id="7-11"></a>

### 7-11. `username` / `nickname` / `name` 세 가지가 혼재합니다

| API                      | 필드                   |
| ------------------------ | ---------------------- |
| `AUTH-001` (회원가입)    | `name`, `nickname`     |
| `USER-001` (프로필 수정) | `name`, `nickname`     |
| `USER-004` (내 프로필)   | `username` ← 다른 이름 |
| `USER-006` (상대 프로필) | `nickname`             |
| `ADMIN-GRADE-001`        | `username`             |

**세 개가 각각 무엇인가요?** 그리고 FE 화면에 노출되는 이름은 어느 것인가요?

> 관련: **회원가입 폼에 `name`(실명) 입력란이 없습니다.** 시안에는 이메일·비밀번호·닉네임·프로필사진·관심사·약관만 있습니다.
> `AUTH-001` 의 `name` 을 **선택 필드로 완화**해 주시거나, 닉네임과 동일하게 채워 보내도 되는지 알려주세요.

---

## 8. 회신 체크리스트

**P0 — 회신 없으면 진행이 막힙니다**

- [x] ~~[C-1b](#c-1) 현재 태그 ID 표 회신~~ ✅ **완료 (2026-08-05)** → FE 반영 완료.
      단, "기타" 모델에 태그가 없어 [7-4](#7-4)(응답에 `customAiModel` 추가)가 새로 필요해졌습니다.
- [ ] [C-1](#c-1) 태그 목록 API 추가 가능 여부 / 일정
- [ ] [C-2](#c-2) 관심 직군·태스크 저장 — 요청안 A(기존 확장) vs B(별도 엔드포인트)
- [ ] [H-1](#h-1) 홈 목록 — 요청안 A(통합 API) vs B(기존 확장)
- [ ] [D-1](#d-1) 북마크 등록/취소
- [ ] [D-2](#d-2) 포인트 열람 + **포인트 부족 시 상태/에러 코드**
- [ ] [D-3](#d-3) 신고 접수 + **`reason` enum 값 목록**
- [ ] [U-1](#u-1) 업로드 이미지 조회용 URL (`statuses` 또는 `draft` 응답에 `imageUrl`)
- [ ] [M-1](#m-1) `USER-004` 구현 + 필드 추가
- [ ] [A-1](#a-1) 신고 목록에 `targetSummary` 추가 + [A-1b](#a-1b) 상태 매핑 확인

**P1**

- [ ] [C-3](#c-3) 로그아웃 · [C-4](#c-4) 약관 동의 · [C-5](#c-5) 프로필 이미지 업로드
- [ ] [D-4](#d-4) 복사 수 증가
- [ ] [U-2](#u-2) 프롬프트 수정
- [ ] [M-2](#m-2) 내 게시글 DRAFT/PRIVATE · [M-3](#m-3) 북마크 목록 · [M-4](#m-4) `PROMPT-009` 구현
- [ ] [A-2](#a-2) 등급 신청 목록 필드 추가

**P2 — 스코프에서 뺄지만 알려주세요**

- [ ] [M-5](#m-5) 수익 · [M-6](#m-6) 알림 설정 · [M-7](#m-7) 알림 목록 · [M-8](#m-8) 등급업 신청 · [A-3](#a-3) 어드민 검색

**확인 사항 (11건)**

- [ ] [7-1](#7-1) 좋아요/추천 네이밍 · [7-2](#7-2) MASTER 등급 · [7-3](#7-3) 태그 name 표기
- [x] ~~[7-4](#7-4) 응답에 `customAiModel` 추가~~ ✅ **합의 완료 (2026-08-05)** → FE 반영 완료.
      홈 목록 + 상세 모두 포함. 남은 것: **배포 시점 공유**(FE 타입을 옵셔널 → 필수로 좁히는 시점)
- [ ] [7-5](#7-5) 비로그인 viewerInteraction · [7-6](#7-6) 임시저장 1개 정책 · [7-7](#7-7) 댓글 status
- [ ] [7-8](#7-8) 소셜 로그인 (provider / redirectUri / 신규 가입 여부)
- [ ] [7-9](#7-9) 이미지 status enum · [7-10](#7-10) 게시물 수정 조회 경로 · [7-11](#7-11) username/nickname/name

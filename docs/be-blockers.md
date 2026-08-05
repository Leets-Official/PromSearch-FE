# BE 전달 사항 — 실서버 점검 결과 (2026-08-05)

> FE에서 배포된 실서버(`https://api.promsearch.kr`)에 **직접 호출해 확인**한 내용입니다.
> 테스트 계정을 만들어 인증이 필요한 API까지 전부 돌려봤습니다.
>
> 점검에 쓴 계정: `fe-seed@promsearch.kr` / `promsearch1!` (닉네임 `프롬써치테스터`, userId 1)
> — FE 연동 점검용으로 만든 계정입니다. 지우셔도 되고, 두셔도 무방합니다.

---

## 🔴 1. S3 업로드가 **전부 403** — 이미지 기능 전체가 막혀 있습니다

`POST /prompt-images/upload-urls` 로 받은 Presigned URL에 `PUT` 하면 **모든 요청이 403**입니다.

```xml
<Error>
  <Code>AccessDenied</Code>
  <Message>User: arn:aws:sts::835665967333:assumed-role/promsearch-ec2-role/i-04fc53d33f8c62631
    is not authorized to perform: s3:PutObject
    on resource: "arn:aws:s3:::promsearch-prod-apne2-media-.../prompt-images/original/1/....png"
    because no identity-based policy allows the s3:PutObject action</Message>
</Error>
```

**원인.** Presigned URL은 **서명한 주체의 권한을 넘겨줄 수 없습니다.**
지금 URL은 EC2 인스턴스 역할(`promsearch-ec2-role`)의 임시 자격증명으로 서명되는데,
그 역할에 해당 버킷에 대한 **`s3:PutObject` 권한이 없습니다.**
그래서 URL 발급(200)은 되지만 실제 업로드는 100% 실패합니다.

**확인 방법** (그대로 재현됩니다)

```bash
# 1) URL 발급 — 200 OK
curl -X POST -H "Authorization: Bearer {token}" -H "Content-Type: application/json" \
  -d '{"images":[{"fileName":"a.png","contentType":"image/png","fileSize":241359,"width":3024,"height":1898}]}' \
  https://api.promsearch.kr/api/v1/prompt-images/upload-urls

# 2) 받은 uploadUrl 로 PUT — 403 AccessDenied
curl -X PUT -H "Content-Type: image/png" --data-binary @a.png "{uploadUrl}"
```

**필요한 조치.** `promsearch-ec2-role` 에 해당 버킷 prefix 에 대한 `s3:PutObject` 허용.

```json
{
  "Effect": "Allow",
  "Action": ["s3:PutObject"],
  "Resource": "arn:aws:s3:::promsearch-prod-apne2-media-835665967333-ap-northeast-2-an/prompt-images/*"
}
```

**막히는 범위**

| 기능                   | 상태                                                 |
| ---------------------- | ---------------------------------------------------- |
| 프롬프트 이미지 업로드 | ❌ 전부 실패                                         |
| 프롬프트 **게시**      | ❌ 이미지가 필수라 게시 자체 불가                    |
| 프로필 이미지 업로드   | ❌ 같은 방식이면 동일하게 막힐 가능성 높음 (미확인)  |
| 상태 폴링              | 계속 `UPLOADING` 에 머무름 (`failureCode` 도 `null`) |

**게시까지 막히는 것을 확인했습니다.** 업로드 실패한 이미지로 게시를 시도하면:

```
POST /api/v1/prompts  →  409
{ "code": "PROMPT-032", "message": "워터마크 처리가 완료되지 않은 이미지입니다." }
```

이미지가 `READY` 가 되어야 게시가 되는데, S3 업로드 자체가 막혀 있어 `READY` 에 도달할 수 없습니다.
**즉 지금은 Swagger 로도 프롬프트를 만들 수 없습니다.**

> 참고: 업로드가 실패해도 `GET /prompt-images/statuses` 는 `UPLOADING` 만 돌려주고
> **실패를 알려주지 않습니다.** S3 업로드가 안 된 이미지는 일정 시간 뒤 `FAILED` 로 바꿔주시면
> 프론트가 사용자에게 "업로드에 실패했어요"를 띄울 수 있습니다.

### `/api/v1/auth/swagger-token` 은 배포 서버에 없습니다

문서에 "local 환경에서는 Swagger 테스트용 토큰을 발급할 수 있다"고 되어 있는데,
**배포 서버에서는 404** 이고 Swagger 스펙에도 등록돼 있지 않습니다(로컬 프로필 전용으로 보입니다).
배포 서버에서 토큰이 필요하면 `POST /auth/login` 으로 받으면 됩니다.

---

## 🔴 2. 모든 숫자가 **문자열**로 내려옵니다

```json
{ "tagId": "1", "page": "0", "size": "2", "totalElements": "0", "hasNext": false }
```

`hasNext`(boolean)는 정상인데 **숫자 타입만 전부 문자열**입니다.

### 전수 조사 결과

| 엔드포인트                  | 문자열로 오는 숫자 필드                                        |
| --------------------------- | -------------------------------------------------------------- |
| `GET /tags`                 | `tags[].tagId`                                                 |
| `GET /home/prompts`         | `page.page`, `page.size`, `page.totalElements`                 |
| `GET /home/prompts/popular` | 〃                                                             |
| `GET /users/me`             | `point`, `interestJobTags[].tagId`, `interestTaskTags[].tagId` |
| `GET /users/me/bookmarks`   | `page`, `size`, `totalElements`                                |
| `PUT /prompts/draft`        | `promptId`, `pricePoint`                                       |
| `GET /prompts/draft`        | `promptId`, `pricePoint`                                       |
| `POST /auth/login`          | `userId`, `expiresIn`                                          |

(`GET /users/nicknames/availability` 는 숫자 필드가 없어 해당 없음)

### 왜 문제인가

자바스크립트는 `+` 가 숫자 덧셈이자 문자열 연결이라, **조용히 잘못된 값**이 됩니다.

```js
"0" + 1; // "01"   ← 페이지 번호가 깨짐
"32" + 1; // "321"  ← 좋아요 수가 321이 됨
"128" / 6; // 21.33  ← 나눗셈은 우연히 동작 (더 헷갈립니다)
```

에러가 안 나고 **화면에만 이상한 값이 뜨기 때문에** 발견이 늦어집니다.
실제로 프론트에서 페이지 계산·좋아요 낙관적 갱신에 이 버그가 잠재해 있었습니다.

### 요청

**숫자는 숫자로 내려주세요.** Jackson 설정에 아래 중 하나가 켜져 있을 것 같습니다.

- `JsonGenerator.Feature.WRITE_NUMBERS_AS_STRINGS`
- 또는 전역 `Long` → `ToStringSerializer` 등록

> `Long` ID를 문자열로 주는 관행은 **JS 정수 정밀도(2^53)** 때문인데,
> 지금 값들은 `1`, `0`, `3600` 수준이라 해당되지 않습니다.
> 정밀도가 걱정되시면 **ID 계열만** 문자열로 두시고,
> `page` / `size` / `totalElements` / `point` / `pricePoint` / `expiresIn` 같은
> **집계·설정 값은 숫자로** 주시는 게 안전합니다.

프론트는 당장 깨지지 않도록 **응답 숫자를 명시적으로 변환**해 방어하겠습니다.
서버가 숫자로 바꿔주셔도 그대로 동작합니다.

---

## 🟡 3. 아직 "미구현"(501)인 API — 4개

실제로 호출해 확인했습니다. 전부 `501` + `"아직 구현되지 않은 기능입니다."`

| API                               | 영향 화면            |
| --------------------------------- | -------------------- |
| `GET /prompts/me`                 | 마이페이지 게시글 탭 |
| `GET /prompts/me/insights`        | 마이페이지 인사이트  |
| `GET /admin/reports`              | 어드민 신고함        |
| `GET /admin/grade-requests`       | 어드민 등급 관리     |
| (+ `PATCH` 처리 API 2개도 미구현) |                      |

**구현 일정 공유 부탁드립니다.** 프론트는 계약대로 붙여 두고 임시 목으로 동작 중입니다.

---

## 🟡 4. 회신은 주셨는데 스펙에 아직 없는 것 — 5건

| 항목                             | 약속                                   | 현재 스펙                   |
| -------------------------------- | -------------------------------------- | --------------------------- |
| 상세 응답 좋아요 네이밍          | `recommendCount` → `likeCount` 로 통일 | 여전히 `recommendCount`     |
| 상세 응답 `customAiModel`        | 추가하기로 함                          | 없음                        |
| `aiModelTagIds` → `aiModelTagId` | 단수로 변경하기로 함                   | 여전히 배열                 |
| 어드민 신고 대상 요약 (A-1)      | —                                      | 없음 (표에 `#12`·`-` 로 뜸) |
| 어드민 등급 신청 지표 (A-2)      | —                                      | 없음 (`0` 으로 뜸)          |

프론트는 **옛 이름·새 이름을 모두 받도록** 방어해 뒀으니 배포 시점은 자유롭게 잡으셔도 됩니다.
다만 **어드민 A-1/A-2** 는 값 자체가 없어서 관리자가 판단할 근거가 없습니다. 우선 부탁드립니다.

---

## 🟡 5. 그 밖에 확인이 필요한 것

| #   | 내용                                                                                               |
| --- | -------------------------------------------------------------------------------------------------- |
| 1   | `GET /prompts/me` 에 **`visibility` 파라미터**가 없어 게시완료/비공개를 구분할 수 없습니다         |
| 2   | `GET /users/me/bookmarks` 필터가 **단수**(`taskTagId`)입니다. 홈은 콤마 멀티라 일관성이 어긋납니다 |
| 3   | `GET /users/me` 에 **`authProvider`** 가 없습니다 (소셜 계정이면 비밀번호 변경 메뉴를 숨겨야 함)   |
| 4   | `PATCH /users/me` 에 **`name`** 이 아직 남아 있습니다 (제거하기로 한 필드)                         |
| 5   | `GET /users/me` 의 `username` 을 `nickname` 으로 통일하실 계획인가요                               |
| 6   | 소셜 로그인 지원 provider 목록(`kakao`/`google`?)이 스펙에 없습니다                                |
| 7   | 이미지 `failureCode` 값 목록과 워터마크 처리 소요 시간(폴링 주기 권장값)                           |
| 8   | **DB에 프롬프트가 0건**입니다. 시드 데이터를 넣어주시면 프론트가 실제 화면을 확인할 수 있습니다    |

---

## 우선순위 요약

| 순위 | 항목                       | 이유                                   |
| ---- | -------------------------- | -------------------------------------- |
| 1    | **S3 `s3:PutObject` 권한** | 이미지·게시 기능 전체가 막혀 있음      |
| 2    | **숫자 직렬화**            | 조용히 잘못된 값이 화면에 뜸           |
| 3    | 어드민 4개 구현 + A-1/A-2  | 관리자 화면이 판단 근거 없이 비어 있음 |
| 4    | 시드 데이터                | 프론트가 실 데이터로 검증 불가         |

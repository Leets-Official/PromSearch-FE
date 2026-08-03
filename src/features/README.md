# features/

도메인(기능) 단위 모듈. 한 기능에 필요한 컴포넌트·훅·API·타입을 한 폴더에 모은다.

```
features/
  gallery/     # 홈: 사이드바 + 프롬프트 갤러리 (검색·필터·페이지네이션) — 구현됨
  auth/        # 로그인 게이트
  upload/      # 업로드 폼
  ...
```

> `gallery/` 는 홈 화면(PS-29) 구현체다. 자세한 구조·규칙은 `gallery/README.md` 참고.
> 카드·검색·필터는 홈에서 한 축으로 묶여 `gallery/` 안에 있다.

각 feature 내부 예시:

```
features/card/
  components/   # 이 기능 전용 컴포넌트
  hooks/        # 이 기능 전용 훅
  api/          # 이 기능 API 호출
  types.ts
```

> 여러 기능에서 공유하는 건 `features/` 가 아니라 `components/`, `hooks/`, `lib/` 로.

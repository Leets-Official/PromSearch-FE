# hooks/

여러 기능에서 공유하는 **공통 커스텀 훅**.

```
hooks/
  use-card-impression.ts  # 카드 유효 노출(50%·1초) 추적 → card_impression
  use-auth-status.ts      # 인증 상태 어댑터 (anonymous | authenticated)
```

- `use-auth-status.ts` 는 로그인 팀원 연동 전 **임시 어댑터**로, 현재는 항상 `anonymous` 를 반환한다.
  auth store/세션이 준비되면 이 훅 내부만 교체하면 헤더 분기와 analytics `user_status` 가 따라간다.

> 특정 기능 전용 훅은 `features/<기능>/hooks/` 에 (예: `features/gallery/hooks/use-gallery-filters.ts`).

# components/

여러 기능에서 공유하는 **공통 컴포넌트**.

```
components/
  ui/        # 디자인 시스템 단위 (Button, Modal, Badge ...) — shadcn/ui 설치 대상
    icons.tsx        # 디자인 시스템 아이콘 세트 (Figma Icon 309:1900 의 SVG 인라인)
    brand-icons.tsx  # Google/Kakao 브랜드 로고 (규정색 — icons.tsx 에서 재수출)
  ...        # 공통 복합 컴포넌트 (Header, Layout ...)
```

> 특정 기능에서만 쓰는 컴포넌트는 여기 말고 해당 `features/<기능>/components/` 에.

## 아이콘 규칙

**아이콘은 디자인 시스템 SVG(`@/components/ui/icons`)로만 관리한다.** 외부 아이콘 라이브러리에서
"비슷하게 생긴" 아이콘을 끌어다 쓰지 않는다 — 시안 아이콘은 채움(fill) 기반이라 선(stroke) 기반
라이브러리와 형태가 다르고, 시안이 바뀌어도 추적되지 않는다.

```tsx
import { SearchIcon } from "@/components/ui/icons";

<SearchIcon className="size-5 text-text-disabled" />;
```

- 색은 `currentColor` → 부모의 `text-*` 토큰으로 지정한다.
- 크기 기본값은 24px(width/height 속성)이고 `size-*` 로 덮어쓴다. 컴포넌트가 className 에
  크기 클래스를 기본으로 넣지 않으므로 Button 등의 `[&_svg:not([class*='size-'])]:size-5` 규칙이
  그대로 동작한다.
- `bookmark`/`heart` 는 outline·fill 이 서로 다른 벡터다 → `BookmarkIcon`/`BookmarkFilledIcon`,
  `HeartIcon`/`HeartFilledIcon` 로 나뉘어 있다(`fill-current` 로 채우지 않는다).
- 전체 목록은 `/dev/components` 의 Icon 스펙 시트에서 확인한다.

### 시안에 아직 없는 아이콘

디자인 시스템 세트(33종)에 없는 것만 예외적으로 `lucide-react` 를 쓰고, 사용처에 이유를 주석으로 남긴다.
**시안에 추가되면 이 표를 지우고 `icons.tsx` 로 옮긴다.**

| 아이콘          | 사용처                                        | 용도                     |
| --------------- | --------------------------------------------- | ------------------------ |
| `Minus`         | `ui/checkbox.tsx`                             | 부분 선택(indeterminate) |
| `Plus`/`Trash2` | `features/upload/…/output-image-uploader.tsx` | 이미지 추가·삭제         |
| `Sparkles`      | `features/prompt-detail/…/recipe-panel.tsx`   | 포인트로 잠금 해제       |

`components/dev-toolbar/` 는 제품 UI 가 아닌 개발 도구라 의도적으로 디자인 시스템과 분리해 둔다(lucide 유지).

## 로딩 애니메이션

로딩은 아이콘이 아니라 **디자이너가 준 Lottie**(`ui/loading-animation.json`)를 재생한다 —
`ui/spinner.tsx` 의 `Spinner` 를 그대로 쓰면 된다.

- 원본 `lottie.host/…/G4g7pw51oM.json` 에서 **포인트 컬러만 브랜드(#E63946)로 교체**하고
  나머지 키프레임은 그대로 뒀다. 색이 JSON 에 박혀 있어 `text-*` 로는 색이 바뀌지 않는다.
- 점 4개가 가로로 배열된 형태라 **정사각(`size-*`)이 아니라 `h-*`/`w-*` 로** 크기를 준다(기본 `h-4 w-13`).
- 재생기(`lottie-web` light 빌드)는 동적 import 라 첫 번들에 들어가지 않는다.
- `prefers-reduced-motion` 에서는 반복 재생 대신 한 프레임만 정지 표시한다.

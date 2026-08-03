import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * 디자인 시스템 타이포 유틸(`text-title-1`, `text-body-1` 등)은 **폰트 크기** 유틸이다.
 * 기본 tailwind-merge 는 이 커스텀 클래스를 `text-color` 로 오분류해서,
 * `text-title-2`(크기) 와 `text-text-brand`(색) 를 같은 충돌 그룹으로 보고 **뒤에 온 하나만 남긴다.**
 * → 색이 사라지거나(ghost 버튼 텍스트), 크기·굵기가 사라지는(사이드바 title 위계) 버그가 난다.
 *
 * 커스텀 타이포를 `font-size` 그룹으로 등록해 색/크기가 서로를 덮어쓰지 않게 한다.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-1",
            "display-2",
            "heading-1",
            "heading-2",
            "title-1",
            "title-2",
            "title-3",
            "body-1",
            "body-2",
            "body-3",
            "caption-1",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

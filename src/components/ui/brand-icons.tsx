/**
 * 브랜드 로고 아이콘 — Figma Icon 섹션의 icon=Google(499:2214) / icon=Kakao(499:2213).
 *
 * lucide 에 없는 고정 브랜드 자산이라 SVG 를 직접 들고 있습니다(외부 요청 없이 self-contained).
 * 색은 각 플랫폼 규정색이므로 디자인 토큰을 적용하지 않습니다.
 * 크기는 호출측에서 className(size-*) 으로 지정합니다.
 */

/** Google 멀티컬러 로고 */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" className={className} aria-hidden="true" focusable="false">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.583-5.036-3.71H.957v2.332A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A9 9 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A9 9 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58Z"
      />
    </svg>
  );
}

/** Kakao 말풍선 로고 (단색 — 배경색과의 대비는 호출측 책임) */
function KakaoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M9 1.5C4.858 1.5 1.5 4.099 1.5 7.305c0 2.075 1.406 3.895 3.522 4.927-.155.556-.562 2.018-.643 2.331-.1.388.143.383.3.279.124-.082 1.964-1.334 2.76-1.876.343.05.697.076 1.061.076 4.142 0 7.5-2.599 7.5-5.804C16 4.099 13.142 1.5 9 1.5Z"
      />
    </svg>
  );
}

export { GoogleIcon, KakaoIcon };

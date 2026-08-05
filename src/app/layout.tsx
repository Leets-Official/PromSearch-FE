import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

/**
 * Pretendard 는 `next/font/local` 로 싣지 않는다.
 *
 * 그 방식은 통짜 woff2 **한 개**(2,010 KB)를 무조건 받게 하는데, 실측상 이게 전체 전송량의
 * 80% 이자 LCP 10.1초의 원인이었다. 대신 유니코드 범위로 쪼갠 92개 서브셋을
 * `globals.css` → `fonts/pretendard-dynamic.css` 에서 `@font-face` 로 걸어,
 * 브라우저가 **실제 쓰인 글자 범위만** 받게 한다.
 *
 * 그래서 `--font-pretendard` 변수도 사라졌다 — 폰트 패밀리는 CSS 의 `--font-sans` 가 직접 가리킨다.
 */
/**
 * 고정폭 폰트는 **`/dev/components`(내부 컴포넌트 갤러리)에서만** 쓴다.
 * `preload` 기본값(true)이면 next/font 가 모든 페이지 <head> 에 preload 를 심어,
 * 정작 쓰지 않는 랜딩·홈에서도 23KB 를 임계 경로에서 받는다. 실제 쓰는 페이지에서만
 * 받도록 끈다(@font-face 선언 자체는 남으므로 font-mono 를 쓰면 그때 내려온다).
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: "프롬써치 (PromSearch)",
  description: "아웃풋으로 검색하는 한국형 AI 프롬프트 엔진 & 직군별 커뮤니티 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // scroll-smooth: 페이지 안 앵커 이동(랜딩 "이용 방법" → #solution 등)이 뚝 끊기지 않게 한다.
    // motion-safe: 로 감싸 "동작 줄이기"를 켠 사용자에게는 즉시 이동한다(멀미·전정기관 이슈).
    //
    // data-scroll-behavior="smooth" 는 **Next 16 에서 필수**다. 15 까지는 라우트 전환 때
    // Next 가 scroll-behavior 를 auto 로 잠깐 바꿔 즉시 최상단으로 보냈는데, 16 부터는
    // 기본적으로 건드리지 않는다. 이 속성이 없으면 페이지를 옮길 때마다 위로 스르륵
    // 스크롤되는 게 보여 굼떠 보인다. (참고: docs 01-app/02-guides/upgrading/version-16.md)
    <html
      lang="ko"
      data-scroll-behavior="smooth"
      className={`${geistMono.variable} h-full antialiased motion-safe:scroll-smooth`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

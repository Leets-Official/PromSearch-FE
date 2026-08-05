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
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang="ko" className={`${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

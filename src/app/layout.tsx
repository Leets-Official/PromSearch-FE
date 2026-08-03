import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./providers";
import {
  DEV_PREVIEW_COOKIE,
  DEV_PREVIEW_DEFAULT,
  DEV_TOOLBAR_ENABLED,
  parseDevPreview,
} from "@/lib/dev-preview";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "프롬써치 (PromSearch)",
  description: "아웃풋으로 검색하는 한국형 AI 프롬프트 엔진 & 직군별 커뮤니티 플랫폼",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Dev 툴바가 켜진 환경에서만 쿠키를 읽어 프리뷰 상태를 시드한다(프로덕션은 cookies() 미호출 → 정적 유지).
  const initialDevPreview = DEV_TOOLBAR_ENABLED
    ? parseDevPreview((await cookies()).get(DEV_PREVIEW_COOKIE)?.value)
    : DEV_PREVIEW_DEFAULT;

  return (
    <html lang="ko" className={`${pretendard.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers initialDevPreview={initialDevPreview}>{children}</Providers>
      </body>
    </html>
  );
}

import type { NextConfig } from "next";

// BE 오리진. 클라이언트 코드(@/lib/api/config)와 같은 값을 본다.
const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN ?? "https://api.promsearch.kr";

const nextConfig: NextConfig = {
  /**
   * 브라우저 → `/api/v1/*` → (Next 서버) → BE 프록시.
   *
   * 동일 출처로 나가므로 BE 에 CORS 설정을 요구하지 않고, MSW 목 핸들러도 같은 상대경로로
   * 가로챌 수 있다(목이 처리하지 않은 요청만 실서버로 흘러간다).
   */
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${API_ORIGIN}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;

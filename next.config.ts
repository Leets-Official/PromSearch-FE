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

  /**
   * 이미지 최적화 (`next/image`).
   *
   * 우리 제품은 **결과물 이미지가 필수**라 썸네일이 곧 LCP 요소다. 원본은 사용자가 올린
   * 사진(수천 px)인데 갤러리 카드는 288px 로만 그린다 → 리사이즈·포맷 변환 이득이 가장 큰 구간.
   *
   * - `formats`: 배열 **순서가 우선순위**다. AVIF 를 먼저 두고 WebP 를 폴백으로 둔다.
   *   (Accept 헤더로 브라우저 지원을 판별하고, 둘 다 안 되면 원본 포맷 그대로 나간다)
   * - `qualities`: **Next 16 부터 필수**. 허용치를 열거하지 않으면 최적화 URL 을 임의 품질로
   *   호출당할 수 있어 막아 둔다. 목록에 없는 값은 가장 가까운 값으로 내려간다.
   * - `remotePatterns`: 여기 없는 호스트는 400 이다. **이미지가 안 뜨면 여기부터 의심할 것.**
   */
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75],
    remotePatterns: [
      // 결과물 이미지 저장소(S3 직접 서빙 / CloudFront 배포 양쪽 대비).
      // 실제 배포 호스트가 확정되면 그 호스트만 남겨 범위를 좁힐 것.
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.cloudfront.net" },
      // MSW 목 데이터 썸네일(`src/mocks/data/prompts.ts`).
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

export default nextConfig;

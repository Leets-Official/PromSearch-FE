import { isServer, QueryClient } from "@tanstack/react-query";

import { isApiError } from "@/lib/api/error";

// TanStack Query 클라이언트 생성/관리
// - 서버: 요청마다 새 클라이언트 (요청 간 데이터 격리)
// - 브라우저: 싱글톤 재사용 (캐시 유지)
// 참고: https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 1분간은 fetch 후 stale 처리 안 함 (불필요한 재요청 방지)
        staleTime: 60 * 1000,
        // 4xx 는 다시 보내도 결과가 같으므로 재시도하지 않는다(401 은 인터셉터가 재발급으로 이미 한 번 처리).
        // 네트워크 실패·5xx 만 최대 2회 재시도.
        retry: (failureCount, error) => {
          if (isApiError(error) && error.isClientError) return false;
          return failureCount < 2;
        },
      },
      mutations: {
        // 뮤테이션은 중복 실행 위험이 있어 자동 재시도하지 않는다(사용자가 다시 누르게).
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  }
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

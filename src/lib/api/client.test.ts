import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "@/mocks/server";

import { api } from "./client";
import { ApiError, isApiError } from "./error";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  onSessionExpired,
  setTokens,
} from "./token-store";

/** BE 공통 응답 봉투 */
function envelope<T>(result: T, code = "COMMON-200") {
  return { success: true, code, message: "성공했습니다.", result };
}

function failure(code: string, message: string) {
  return { success: false, code, message };
}

beforeEach(() => {
  clearTokens();
});

afterEach(() => {
  clearTokens();
});

describe("api 헬퍼", () => {
  it("공통 응답 봉투를 벗기고 result 만 돌려준다", async () => {
    server.use(http.get("/api/v1/prompts/10", () => HttpResponse.json(envelope({ promptId: 10 }))));

    await expect(api.get<{ promptId: number }>("/prompts/10")).resolves.toEqual({ promptId: 10 });
  });

  it("params 로 넘긴 값이 쿼리스트링이 된다", async () => {
    server.use(
      http.get("/api/v1/home/prompts/popular", ({ request }) => {
        const url = new URL(request.url);
        return HttpResponse.json(
          envelope({ page: url.searchParams.get("page"), size: url.searchParams.get("size") }),
        );
      }),
    );

    await expect(
      api.get("/home/prompts/popular", { params: { page: 0, size: 12, cursor: undefined } }),
    ).resolves.toEqual({ page: "0", size: "12" });
  });

  it("로그인 상태면 Authorization 헤더가 자동으로 붙는다", async () => {
    setTokens({ accessToken: "access-1", refreshToken: "refresh-1" });
    server.use(
      http.get("/api/v1/users/me", ({ request }) =>
        HttpResponse.json(envelope({ authorization: request.headers.get("authorization") })),
      ),
    );

    await expect(api.get("/users/me")).resolves.toEqual({ authorization: "Bearer access-1" });
  });

  it("비로그인 상태면 Authorization 헤더를 붙이지 않는다", async () => {
    server.use(
      http.get("/api/v1/users/me", ({ request }) =>
        HttpResponse.json(envelope({ authorization: request.headers.get("authorization") })),
      ),
    );

    await expect(api.get("/users/me")).resolves.toEqual({ authorization: null });
  });
});

describe("에러 정규화", () => {
  it("HTTP 에러를 status·code·message 를 담은 ApiError 로 던진다", async () => {
    server.use(
      http.get("/api/v1/prompts/999", () =>
        HttpResponse.json(failure("COMMON-404", "요청한 리소스를 찾을 수 없습니다."), {
          status: 404,
        }),
      ),
    );

    const error = await api.get("/prompts/999").catch((e: unknown) => e);

    expect(isApiError(error)).toBe(true);
    expect((error as ApiError).status).toBe(404);
    expect((error as ApiError).code).toBe("COMMON-404");
    expect((error as ApiError).message).toBe("요청한 리소스를 찾을 수 없습니다.");
    expect((error as ApiError).isClientError).toBe(true);
  });

  it("HTTP 200 이라도 success:false 면 실패로 처리한다", async () => {
    server.use(
      http.get("/api/v1/prompts/1", () =>
        HttpResponse.json(failure("COMMON-400", "잘못된 요청입니다.")),
      ),
    );

    const error = await api.get("/prompts/1").catch((e: unknown) => e);

    expect(isApiError(error)).toBe(true);
    expect((error as ApiError).code).toBe("COMMON-400");
  });

  it("서버에 닿지 못하면 네트워크 에러(status 0)로 정규화한다", async () => {
    server.use(http.get("/api/v1/prompts/1", () => HttpResponse.error()));

    const error = await api.get("/prompts/1").catch((e: unknown) => e);

    expect(isApiError(error)).toBe(true);
    expect((error as ApiError).isNetworkError).toBe(true);
  });
});

describe("401 토큰 재발급", () => {
  it("만료된 accessToken 은 재발급 후 원 요청을 재시도한다", async () => {
    setTokens({ accessToken: "expired", refreshToken: "refresh-1" });
    let reissueCount = 0;

    server.use(
      http.post("/api/v1/auth/reissue", async () => {
        reissueCount += 1;
        return HttpResponse.json(
          envelope({
            accessToken: "access-2",
            refreshToken: "refresh-2",
            tokenType: "Bearer",
            expiresIn: 3600,
          }),
        );
      }),
      http.get("/api/v1/users/me", ({ request }) => {
        if (request.headers.get("authorization") !== "Bearer access-2") {
          return HttpResponse.json(failure("COMMON-401", "인증이 필요합니다."), { status: 401 });
        }
        return HttpResponse.json(envelope({ nickname: "홍길동" }));
      }),
    );

    await expect(api.get("/users/me")).resolves.toEqual({ nickname: "홍길동" });
    expect(reissueCount).toBe(1);
    expect(getAccessToken()).toBe("access-2");
    expect(getRefreshToken()).toBe("refresh-2");
  });

  it("동시에 401 이 나도 재발급은 한 번만 나간다", async () => {
    setTokens({ accessToken: "expired", refreshToken: "refresh-1" });
    let reissueCount = 0;

    server.use(
      http.post("/api/v1/auth/reissue", async () => {
        reissueCount += 1;
        return HttpResponse.json(
          envelope({
            accessToken: "access-2",
            refreshToken: "refresh-2",
            tokenType: "Bearer",
            expiresIn: 3600,
          }),
        );
      }),
      http.get("/api/v1/users/me", ({ request }) =>
        request.headers.get("authorization") === "Bearer access-2"
          ? HttpResponse.json(envelope({ ok: true }))
          : HttpResponse.json(failure("COMMON-401", "인증이 필요합니다."), { status: 401 }),
      ),
    );

    await Promise.all([api.get("/users/me"), api.get("/users/me"), api.get("/users/me")]);

    expect(reissueCount).toBe(1);
  });

  it("재발급까지 실패하면 토큰을 비우고 세션 만료를 알린다", async () => {
    setTokens({ accessToken: "expired", refreshToken: "expired-refresh" });
    const onExpired = vi.fn();
    const unsubscribe = onSessionExpired(onExpired);

    server.use(
      http.post("/api/v1/auth/reissue", () =>
        HttpResponse.json(failure("COMMON-401", "유효하지 않은 Refresh Token"), { status: 401 }),
      ),
      http.get("/api/v1/users/me", () =>
        HttpResponse.json(failure("COMMON-401", "인증이 필요합니다."), { status: 401 }),
      ),
    );

    const error = await api.get("/users/me").catch((e: unknown) => e);

    expect((error as ApiError).status).toBe(401);
    expect(onExpired).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBeNull();
    unsubscribe();
  });

  it("로그인 요청의 401 은 재발급을 시도하지 않는다", async () => {
    setTokens({ accessToken: "whatever", refreshToken: "refresh-1" });
    const reissue = vi.fn();

    server.use(
      http.post("/api/v1/auth/reissue", () => {
        reissue();
        return HttpResponse.json(envelope({ accessToken: "x", refreshToken: "y" }));
      }),
      http.post("/api/v1/auth/login", () =>
        HttpResponse.json(failure("COMMON-401", "인증 정보 불일치"), { status: 401 }),
      ),
    );

    await expect(api.post("/auth/login", { email: "a@b.c", password: "wrong" })).rejects.toThrow();
    expect(reissue).not.toHaveBeenCalled();
  });
});

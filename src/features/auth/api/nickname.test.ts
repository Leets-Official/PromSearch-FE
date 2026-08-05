import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { isApiError } from "@/lib/api";
import { server } from "@/mocks/server";

import { checkNicknameAvailable } from "./nickname";

// API 함수 테스트 패턴 — MSW 로 엔드포인트만 세워두고 함수를 그대로 호출한다.
describe("checkNicknameAvailable", () => {
  it("닉네임을 쿼리로 보내고 available 만 꺼내 돌려준다", async () => {
    server.use(
      http.get("/api/v1/users/nicknames/availability", ({ request }) => {
        const nickname = new URL(request.url).searchParams.get("nickname");
        return HttpResponse.json({
          success: true,
          code: "COMMON-200",
          message: "성공했습니다.",
          result: { available: nickname !== "중복닉네임" },
        });
      }),
    );

    await expect(checkNicknameAvailable("프롬써치")).resolves.toBe(true);
    await expect(checkNicknameAvailable("중복닉네임")).resolves.toBe(false);
  });

  it("검증 실패는 ApiError 로 전달된다", async () => {
    server.use(
      http.get("/api/v1/users/nicknames/availability", () =>
        HttpResponse.json(
          { success: false, code: "COMMON-400", message: "잘못된 요청입니다." },
          { status: 400 },
        ),
      ),
    );

    const error = await checkNicknameAvailable("").catch((e: unknown) => e);

    expect(isApiError(error)).toBe(true);
  });
});

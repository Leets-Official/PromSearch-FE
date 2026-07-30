import { describe, expect, it } from "vitest";

import { validateEmail, validatePassword } from "@/features/auth/hooks/use-signup-validation";

describe("validateEmail", () => {
  it("빈 값이면 idle (에러 아님)", () => {
    expect(validateEmail("").status).toBe("idle");
  });

  it("올바른 이메일 형식이면 valid", () => {
    expect(validateEmail("user@example.com").status).toBe("valid");
    expect(validateEmail("a.b-c@sub.domain.co.kr").status).toBe("valid");
  });

  it("@ 또는 도메인이 없으면 invalid", () => {
    expect(validateEmail("userexample.com").status).toBe("invalid");
    expect(validateEmail("user@").status).toBe("invalid");
    expect(validateEmail("user@domain").status).toBe("invalid"); // 점 없음
  });

  it("공백이 섞이면 invalid", () => {
    expect(validateEmail("user @example.com").status).toBe("invalid");
  });
});

describe("validatePassword", () => {
  it("빈 값이면 idle이고 isValid는 false", () => {
    const r = validatePassword("");
    expect(r.status).toBe("idle");
    expect(r.isValid).toBe(false);
  });

  it("영문+숫자 2종 조합에 8~20자면 valid", () => {
    const r = validatePassword("abcd1234");
    expect(r.status).toBe("valid");
    expect(r.isValid).toBe(true);
  });

  it("영문+특수문자 조합도 valid", () => {
    expect(validatePassword("abcd!@#$").isValid).toBe(true);
  });

  it("숫자+특수문자 조합도 valid", () => {
    expect(validatePassword("1234!@#$").isValid).toBe(true);
  });

  it("한 종류만 쓰면 invalid (영문만)", () => {
    const r = validatePassword("abcdefgh");
    expect(r.status).toBe("invalid");
    expect(r.isValid).toBe(false);
  });

  it("숫자만 쓰면 invalid", () => {
    expect(validatePassword("12345678").isValid).toBe(false);
  });

  it("8자 미만이면 invalid", () => {
    expect(validatePassword("ab12").isValid).toBe(false);
  });

  it("20자 초과면 invalid", () => {
    expect(validatePassword("a1" + "b".repeat(19)).isValid).toBe(false); // 21자
  });

  it("경계값 8자·20자는 valid", () => {
    expect(validatePassword("abcd1234").isValid).toBe(true); // 8자
    expect(validatePassword("abcd1234" + "x".repeat(11) + "9").isValid).toBe(true); // 20자
  });

  it("공백이 포함되면 invalid", () => {
    expect(validatePassword("abcd 123").isValid).toBe(false);
  });
});

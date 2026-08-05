import { describe, expect, it } from "vitest";

import { formatGrade, USER_GRADES } from "@/lib/grade";

/**
 * 서버는 등급을 대문자 enum 으로 준다(`gradeName: "NODE"` — 실측 2026-08-06).
 * 시안은 `Node` 표기라 화면에 그대로 찍으면 안 된다.
 */
describe("formatGrade", () => {
  it("사다리 6단계를 시안 표기로 바꾼다", () => {
    expect(USER_GRADES.map(formatGrade)).toEqual([
      "Node",
      "Link",
      "Sync",
      "Core",
      "Prime",
      "Origin",
    ]);
  });

  it("값이 없으면 null — 호출부가 등급 자리를 그리지 않게 한다", () => {
    expect(formatGrade(undefined)).toBeNull();
    expect(formatGrade(null)).toBeNull();
    expect(formatGrade("   ")).toBeNull();
  });

  it("서버가 등급을 늘려 매핑이 없어도 표기만 맞춰 내보낸다(화면이 비지 않게)", () => {
    expect(formatGrade("NEXUS")).toBe("Nexus");
  });

  it("이미 표기형으로 와도 같은 결과다", () => {
    expect(formatGrade("Node")).toBe("Node");
  });
});

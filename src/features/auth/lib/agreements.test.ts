import { describe, expect, it } from "vitest";

import { toAgreementsPayload } from "@/features/auth/lib/agreements";

describe("toAgreementsPayload", () => {
  it("동의한 약관 id만 true로, 나머지는 false로 매핑한다", () => {
    const result = toAgreementsPayload(["service", "community"]);

    expect(result).toEqual({
      serviceTerms: true,
      communityTerms: true,
      contentPolicy: false,
      age14OrOver: false,
      marketing: false,
    });
  });

  it("빈 배열이면 5개 키 모두 false로 채운다(키 자체는 항상 존재)", () => {
    const result = toAgreementsPayload([]);

    expect(result).toEqual({
      serviceTerms: false,
      communityTerms: false,
      contentPolicy: false,
      age14OrOver: false,
      marketing: false,
    });
  });

  it("5개 모두 동의하면 모든 필드가 true다", () => {
    const result = toAgreementsPayload([
      "service",
      "community",
      "content-copyright",
      "age-over-14",
      "marketing",
    ]);

    expect(result).toEqual({
      serviceTerms: true,
      communityTerms: true,
      contentPolicy: true,
      age14OrOver: true,
      marketing: true,
    });
  });

  it("알 수 없는 id는 무시하고 나머지만 반영한다", () => {
    const result = toAgreementsPayload(["service", "unknown-term"]);

    expect(result.serviceTerms).toBe(true);
    expect(result.communityTerms).toBe(false);
  });
});

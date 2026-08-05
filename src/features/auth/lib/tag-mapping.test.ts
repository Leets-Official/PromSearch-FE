import { describe, expect, it } from "vitest";

import { toJobTagIds, toTaskTagIds } from "@/features/auth/lib/tag-mapping";

describe("toJobTagIds", () => {
  it("한글 라벨을 BE 태그 ID로 변환한다", () => {
    expect(toJobTagIds(["학생", "직장인"])).toEqual([1, 2]);
  });

  it("순서를 유지한다", () => {
    expect(toJobTagIds(["개발자", "학생"])).toEqual([6, 1]);
  });

  it("빈 배열이면 빈 배열을 반환한다", () => {
    expect(toJobTagIds([])).toEqual([]);
  });

  it("매핑되지 않는 라벨은 결과에서 제외한다", () => {
    expect(toJobTagIds(["학생", "존재하지않는직군"])).toEqual([1]);
  });
});

describe("toTaskTagIds", () => {
  it("한글 라벨을 BE 태그 ID로 변환한다", () => {
    expect(toTaskTagIds(["PPT", "이메일"])).toEqual([7, 9]);
  });

  it("빈 배열이면 빈 배열을 반환한다", () => {
    expect(toTaskTagIds([])).toEqual([]);
  });

  it("매핑되지 않는 라벨은 결과에서 제외한다", () => {
    expect(toTaskTagIds(["PPT", "존재하지않는태스크"])).toEqual([7]);
  });
});

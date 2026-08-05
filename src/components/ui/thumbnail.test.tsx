import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Thumbnail } from "@/components/ui/thumbnail";

/**
 * 결과물 이미지는 S3 presigned URL 로 온다. 객체가 없거나 서명이 만료되면 403 이 오는데
 * (실제로 워터마크 결과물이 안 써진 게시글이 있었다), 브라우저 기본 동작은 아무것도 안
 * 그리는 것이라 화면에 빈칸만 남는다. 로딩 중인지 깨진 건지 구분이 안 된다.
 */
describe("Thumbnail", () => {
  it("이미지 로드에 실패하면 빈칸 대신 대체 표시를 그린다", () => {
    render(<Thumbnail src="https://example.com/gone.png" alt="결과물" />);

    // 실패 전에는 대체 표시가 없다
    expect(screen.queryByLabelText("이미지를 불러오지 못했어요")).toBeNull();

    fireEvent.error(screen.getByAltText("결과물"));

    expect(screen.getByLabelText("이미지를 불러오지 못했어요")).toBeInTheDocument();
  });

  it("src 가 바뀌면 다시 시도한다 — 이전 실패가 새 이미지에 옮겨붙지 않게", () => {
    const { rerender } = render(<Thumbnail src="https://example.com/gone.png" alt="결과물" />);
    fireEvent.error(screen.getByAltText("결과물"));
    expect(screen.getByLabelText("이미지를 불러오지 못했어요")).toBeInTheDocument();

    rerender(<Thumbnail src="https://example.com/fresh.png" alt="결과물" />);

    expect(screen.queryByLabelText("이미지를 불러오지 못했어요")).toBeNull();
    expect(screen.getByAltText("결과물")).toBeInTheDocument();
  });
});

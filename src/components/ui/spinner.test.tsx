import { render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";

import { Spinner } from "@/components/ui/spinner";

/**
 * Lottie 재생기는 동적 import 라 "마운트하면 실제로 그림이 붙는가"가 조용히 깨질 수 있다.
 * 컨테이너에 SVG 가 주입되는지, 점이 브랜드 색으로 칠해지는지를 고정한다.
 *
 * jsdom 에는 canvas 2D 컨텍스트가 없는데 lottie 는 로드 시점에 투명 캔버스를 한 번 만든다.
 * 실제 렌더(SVG)에는 canvas 가 쓰이지 않으므로 최소한의 스텁만 심어 준다.
 */
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = (() => ({
    fillStyle: "",
    fillRect: () => {},
  })) as unknown as HTMLCanvasElement["getContext"];
});

describe("Spinner", () => {
  it("마운트하면 Lottie SVG 를 컨테이너에 주입한다", async () => {
    const { container } = render(<Spinner />);

    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    await waitFor(() => expect(container.querySelector("svg")).toBeInTheDocument());
  });

  it("점 4개를 브랜드 컬러(#E63946)로 그린다", async () => {
    const { container } = render(<Spinner />);

    await waitFor(() => {
      const dots = Array.from(container.querySelectorAll("path")).filter((path) =>
        (path.getAttribute("fill") ?? "")
          .replace(/\s/g, "")
          .toLowerCase()
          .includes("rgb(230,57,70)"),
      );
      expect(dots).toHaveLength(4);
    });
  });
});

import { cn } from "@/lib/utils";

/**
 * 썸네일 이미지 컨테이너. Figma thumbnail(209:3676): 288x162 = 16:9 비율.
 * - radius 8px(=rounded-md), object-cover 로 크롭.
 * - src 미지정 시 placeholder(bg-bg-secondary) 노출.
 * 이미지는 우선 native <img> 로 안전하게 처리. (추후 next/image 검토)
 */
type ThumbnailProps = React.ComponentProps<"div"> & {
  src?: string;
  alt?: string;
  /** 이미지 fit 방식. 기본 cover. */
  fit?: "cover" | "contain";
};

function Thumbnail({ className, src, alt = "", fit = "cover", ...props }: ThumbnailProps) {
  return (
    <div
      data-slot="thumbnail"
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-md bg-bg-secondary",
        className,
      )}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- 추후 next/image 검토
        <img
          src={src}
          alt={alt}
          className={cn(
            "absolute inset-0 size-full",
            fit === "cover" ? "object-cover" : "object-contain",
          )}
        />
      ) : null}
    </div>
  );
}

export { Thumbnail };
export type { ThumbnailProps };

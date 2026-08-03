import { cn } from "@/lib/utils";
// 로딩 스피너는 디자인 시스템 아이콘 세트에 없어 lucide 를 유지한다(시안 추가 시 icons.tsx 로 이동).
import { Loader2Icon } from "lucide-react";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };

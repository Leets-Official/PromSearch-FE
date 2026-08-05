import type { ReactNode } from "react";

/**
 * 갤러리 전용 섹션 래퍼 — 미리보기 + 접을 수 있는 코드 예시.
 * 개발용 페이지에서만 사용합니다.
 */
export function DemoSection({
  id,
  title,
  description,
  code,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  code: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="text-heading-2 text-text-primary">{title}</h2>
      {description && <p className="mt-1 text-body-3 text-text-secondary">{description}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-4 rounded-xl border border-stroke-secondary bg-bg-elevated p-6 shadow-sm">
        {children}
      </div>
      <details className="mt-2">
        <summary className="cursor-pointer text-title-3 text-text-secondary select-none hover:text-text-primary">
          코드 보기
        </summary>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-gray-900 p-4 font-mono text-caption-1 leading-relaxed font-normal text-gray-100">
          <code>{code.trim()}</code>
        </pre>
      </details>
    </section>
  );
}

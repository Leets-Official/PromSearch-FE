const GRAYS = [
  ["gray-50", "bg-gray-50"],
  ["gray-100", "bg-gray-100"],
  ["gray-150", "bg-gray-150"],
  ["gray-200", "bg-gray-200"],
  ["gray-300", "bg-gray-300"],
  ["gray-400", "bg-gray-400"],
  ["gray-500", "bg-gray-500"],
  ["gray-600", "bg-gray-600"],
  ["gray-700", "bg-gray-700"],
  ["gray-800", "bg-gray-800"],
  ["gray-900", "bg-gray-900"],
] as const;

const REDS = [
  ["red-50", "bg-red-50"],
  ["red-100", "bg-red-100"],
  ["red-200", "bg-red-200"],
  ["red-300", "bg-red-300"],
  ["red-400", "bg-red-400"],
  ["red-500 (brand)", "bg-red-500"],
  ["red-600", "bg-red-600"],
  ["red-700", "bg-red-700"],
  ["red-800", "bg-red-800"],
  ["red-900", "bg-red-900"],
] as const;

const SEMANTICS = [
  ["text-text-primary", "글자 기본 (gray-900)"],
  ["text-text-secondary", "글자 보조 (gray-700)"],
  ["text-text-disabled", "글자 비활성 (gray-400)"],
  ["text-text-brand", "글자 브랜드 (red-500)"],
  ["bg-bg-primary", "배경 기본 (gray-50)"],
  ["bg-bg-secondary", "배경 보조 (gray-100)"],
  ["bg-bg-elevated", "배경 떠있는 면 (white + shadow)"],
  ["bg-bg-brand", "배경 브랜드 (red-500)"],
  ["bg-brand-tint", "브랜드 틴트 (red-500/10%)"],
  ["bg-dim", "딤 오버레이 (gray-900/50%)"],
  ["border-stroke-secondary", "테두리 보조 (gray-100)"],
  ["border-stroke-strong", "테두리 강조 (black)"],
] as const;

const TYPO = [
  ["text-display-1", "Display 1 — 32/36 Bold"],
  ["text-display-2", "Display 2 — 32/36 Medium"],
  ["text-heading-1", "Heading 1 — 24/32 Bold"],
  ["text-heading-2", "Heading 2 — 20/24 Bold"],
  ["text-title-1", "Title 1 — 16/20 SemiBold"],
  ["text-title-2", "Title 2 — 16/20 Medium"],
  ["text-title-3", "Title 3 — 14/20 SemiBold"],
  ["text-body-1", "Body 1 — 16/30 Regular"],
  ["text-body-2", "Body 2 — 16/24 Medium"],
  ["text-body-3", "Body 3 — 14/24 Regular"],
  ["text-caption-1", "Caption 1 — 12/16 SemiBold"],
] as const;

function Swatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`h-10 w-14 rounded-md border border-stroke-secondary ${className}`} />
      <span className="text-caption-1 text-text-secondary">{name}</span>
    </div>
  );
}

export function TokenSection() {
  return (
    <section id="tokens" className="scroll-mt-20">
      <h2 className="text-heading-2 text-text-primary">디자인 토큰</h2>
      <p className="mt-1 text-body-3 text-text-secondary">
        globals.css 에 정의된 primitive / semantic 토큰. 색은 되도록{" "}
        <code className="rounded bg-bg-secondary px-1 py-0.5 font-mono text-caption-1">
          text-text-*
        </code>{" "}
        같은 시맨틱 클래스를 먼저 쓰고, 없을 때만 primitive(gray-*, red-*)를 직접 쓰세요.
      </p>

      <div className="mt-3 space-y-6 rounded-xl border border-stroke-secondary bg-bg-elevated p-6 shadow-sm">
        <div>
          <h3 className="mb-2 text-title-3 text-text-secondary">Grayscale</h3>
          <div className="flex flex-wrap gap-3">
            {GRAYS.map(([name, cls]) => (
              <Swatch key={name} name={name} className={cls} />
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-title-3 text-text-secondary">Red</h3>
          <div className="flex flex-wrap gap-3">
            {REDS.map(([name, cls]) => (
              <Swatch key={name} name={name} className={cls} />
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-title-3 text-text-secondary">Semantic (자주 쓰는 것)</h3>
          <ul className="grid gap-1 sm:grid-cols-2">
            {SEMANTICS.map(([cls, desc]) => (
              <li key={cls} className="text-body-3 text-text-secondary">
                <code className="rounded bg-bg-secondary px-1 py-0.5 font-mono text-caption-1 text-text-primary">
                  {cls}
                </code>{" "}
                — {desc}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-title-3 text-text-secondary">Typography</h3>
          <div className="space-y-2">
            {TYPO.map(([cls, label]) => (
              <div key={cls} className="flex flex-wrap items-baseline gap-3">
                <p className={`${cls} text-text-primary`}>프롬써치 PromSearch</p>
                <code className="rounded bg-bg-secondary px-1 py-0.5 font-mono text-caption-1 text-text-secondary">
                  {cls}
                </code>
                <span className="text-caption-1 text-text-disabled">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

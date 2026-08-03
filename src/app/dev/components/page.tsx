import type { Metadata } from "next";

import { ButtonSection } from "./sections/button-section";
import { DataDisplaySection } from "./sections/data-display-section";
import { FeedbackSection } from "./sections/feedback-section";
import { HeaderSection } from "./sections/header-section";
import { IconSection } from "./sections/icon-section";
import { InputSection } from "./sections/input-section";
import { NavigationSection } from "./sections/navigation-section";
import { OverlaySection } from "./sections/overlay-section";
import { SelectionSection } from "./sections/selection-section";
import { TokenSection } from "./sections/token-section";
import { ModalSection } from "./sections/modal-section";

export const metadata: Metadata = {
  title: "공통 컴포넌트 갤러리 | PromSearch Dev",
  robots: { index: false },
};

const TOC = [
  ["#tokens", "디자인 토큰"],
  ["#button", "Button"],
  ["#selection", "Selection"],
  ["#input", "Input"],
  ["#data", "Data Display"],
  ["#navigation", "Navigation"],
  ["#header", "Header"],
  ["#icon", "Icon"],
  ["#overlay-dialog", "Dialog · Dropdown"],
  ["#feedback-spinner", "Spinner"],
  ["#modal", "Modal"],
] as const;

/**
 * 개발용 공통 컴포넌트 갤러리.
 * Figma 컴포넌트 시트를 상태별 스펙 시트로 재현합니다 (src/components/ui/ 실제 컴포넌트 사용).
 */
export default function ComponentsGalleryPage() {
  return (
    <div className="min-h-dvh bg-bg-primary">
      <header className="sticky top-0 z-40 border-b border-stroke-secondary bg-bg-primary/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3">
          <h1 className="text-title-1 text-text-primary">
            공통 컴포넌트 갤러리
            <span className="ml-2 rounded bg-brand-tint px-1.5 py-0.5 text-caption-1 text-text-brand">
              스펙 시트
            </span>
          </h1>
          <nav className="flex flex-wrap gap-x-4 gap-y-1">
            {TOC.map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="text-title-3 text-text-secondary hover:text-text-brand"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-10 px-6 py-10">
        <p className="rounded-lg border border-stroke-secondary bg-bg-elevated p-4 text-body-3 text-text-secondary">
          디자이너 Figma 컴포넌트 시안을{" "}
          <strong className="text-text-primary">상태별 스펙 시트</strong>로 재현한 페이지입니다.
          hover·pressed·active 같은 상호작용 상태는 문서 목적상 해당 상태의 토큰을 정적으로 적용해
          나열했습니다. 실제 컴포넌트는 <code className="font-mono">src/components/ui/</code> 에
          있습니다.
        </p>

        <TokenSection />
        <ButtonSection />
        <SelectionSection />
        <InputSection />
        <DataDisplaySection />
        <NavigationSection />
        <HeaderSection />
        <IconSection />
        <OverlaySection />
        <FeedbackSection />
        <ModalSection />
      </main>
    </div>
  );
}

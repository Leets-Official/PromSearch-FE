"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { CheckIcon, CopyIcon, RotateCcwIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";

import {
  DEV_PREVIEW_PARAM,
  isDefaultDevPreview,
  serializeDevPreview,
  type DevAuth,
  type DevContent,
  type DevEdge,
} from "@/lib/dev-preview";
import { useDevPreview } from "./dev-preview-context";

/**
 * 화면 위에 떠 있는 Dev 프리뷰 툴바.
 *
 * 디자이너/기획자가 배포 URL 에서 인증/콘텐츠 길이/엣지 상태를 직접 갈아끼우며 화면을 체험한다.
 * 제품 UI 가 아니라 개발 도구이므로 의도적으로 디자인 시스템과 분리된 중립 스타일을 쓴다.
 * `NEXT_PUBLIC_DEV_TOOLBAR=enabled` 인 프리뷰/dev 에서만 렌더된다(프로덕션 미노출).
 */
export function DevToolbar() {
  const { enabled, preview, setPreview, reset } = useDevPreview();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!enabled) return null;

  const dirty = !isDefaultDevPreview(preview);

  async function copyShareLink() {
    const url = new URL(window.location.href);
    if (isDefaultDevPreview(preview)) {
      url.searchParams.delete(DEV_PREVIEW_PARAM);
    } else {
      url.searchParams.set(DEV_PREVIEW_PARAM, serializeDevPreview(preview));
    }
    await navigator.clipboard.writeText(url.toString());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-20 z-[9999] flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg ring-1 ring-white/10 transition hover:bg-neutral-800"
        aria-label="Dev 프리뷰 툴바 열기"
      >
        <SlidersHorizontalIcon className="size-4" />
        DEV
        {dirty ? <span className="size-2 rounded-full bg-emerald-400" /> : null}
      </button>
    );
  }

  return (
    <div className="fixed right-4 bottom-20 z-[9999] w-[300px] rounded-2xl bg-neutral-900 p-4 text-white shadow-2xl ring-1 ring-white/10">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontalIcon className="size-4" />
          Dev 프리뷰
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md p-1 text-neutral-400 transition hover:bg-white/10 hover:text-white"
          aria-label="닫기"
        >
          <XIcon className="size-4" />
        </button>
      </div>

      <Field label="인증 상태">
        <Segmented<DevAuth>
          value={preview.auth}
          onChange={(auth) => setPreview({ auth })}
          options={[
            { value: "anonymous", label: "비로그인" },
            { value: "authenticated", label: "로그인" },
          ]}
        />
      </Field>

      <Field label="콘텐츠 길이" hint="설명·레시피·댓글 분량 (탭 고정 확인)">
        <Segmented<DevContent>
          value={preview.content}
          onChange={(content) => setPreview({ content })}
          options={[
            { value: "short", label: "짧게" },
            { value: "default", label: "기본" },
            { value: "long", label: "길게" },
          ]}
        />
      </Field>

      <Field label="데이터 상태">
        <Segmented<DevEdge>
          value={preview.edge}
          onChange={(edge) => setPreview({ edge })}
          options={[
            { value: "normal", label: "정상" },
            { value: "empty", label: "빈값" },
            { value: "loading", label: "로딩" },
            { value: "error", label: "에러" },
          ]}
        />
      </Field>

      <Field label="페이지 바로가기">
        <div className="grid grid-cols-2 gap-1.5">
          <JumpLink href="/home" active={pathname === "/home"}>
            홈
          </JumpLink>
          <JumpLink href="/prompts/prompt-001" active={pathname === "/prompts/prompt-001"}>
            상세 · 무료
          </JumpLink>
          <JumpLink href="/prompts/prompt-002" active={pathname === "/prompts/prompt-002"}>
            상세 · 프리미엄
          </JumpLink>
          <JumpLink href="/dev/components" active={pathname === "/dev/components"}>
            컴포넌트
          </JumpLink>
        </div>
        <p className="mt-1.5 text-[11px] leading-tight text-neutral-500">
          프리미엄 잠금은 “로그인 + 상세·프리미엄” 조합에서 보입니다.
        </p>
      </Field>

      <div className="mt-3 flex items-center gap-1.5 border-t border-white/10 pt-3">
        <button
          type="button"
          onClick={copyShareLink}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium transition hover:bg-white/20"
        >
          {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
          {copied ? "복사됨" : "공유 링크"}
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={!dirty}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcwIcon className="size-3.5" />
          초기화
        </button>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="mb-3">
      <div className="mb-1.5 text-xs font-medium text-neutral-400">{label}</div>
      {children}
      {hint ? <p className="mt-1 text-[11px] leading-tight text-neutral-500">{hint}</p> : null}
    </div>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex gap-1 rounded-lg bg-black/30 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition ${
            value === opt.value ? "bg-white text-neutral-900" : "text-neutral-300 hover:bg-white/10"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function JumpLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-2.5 py-2 text-center text-xs font-medium transition ${
        active ? "bg-white text-neutral-900" : "bg-white/10 text-neutral-200 hover:bg-white/20"
      }`}
    >
      {children}
    </Link>
  );
}

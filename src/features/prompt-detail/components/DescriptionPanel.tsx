/** 설명 탭 — 프롬프트 소개 본문(잠금 없음) */
export function DescriptionPanel({ body }: { body: string }) {
  return (
    <div className="min-h-0 w-full flex-1 overflow-auto rounded-md bg-bg-secondary px-5 py-4">
      <p className="text-body-1 whitespace-pre-wrap text-text-secondary">{body}</p>
    </div>
  );
}

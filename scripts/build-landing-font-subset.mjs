/**
 * 랜딩 전용 Pretendard 서브셋 생성기.
 *
 * 왜 필요한가
 * -----------
 * `src/app/fonts/pretendard-dynamic.css` 의 92조각 dynamic subset 은 통짜 2MB 를 대체하는
 * **범용** 분할이다(그 자체로 LCP 14.7s → 5.1s 로 줄인 큰 개선). 다만 조각 경계가 유니코드
 * 범위 기준이라, 랜딩이 쓰는 한글 몇백 자가 하필 14조각에 흩어진다 → 실제로 필요한 글자는
 * 400자 남짓인데 **359KB** 를 받는다. 실측상 이 폰트가 랜딩에서 FCP +2.4s, LCP +1.7s 를 먹었다
 * (웹폰트 제거 대조군: perf 74 → 92, FCP 3.3s → 0.9s).
 *
 * 그래서 랜딩은 **그 페이지에 실제로 찍히는 글자만** 담은 조각 하나를 따로 만들어 쓴다.
 * 범용 분할을 걷어내는 게 아니라 랜딩에만 한 겹 더 얹는 것이며, 서브셋에 없는 글자는
 * `Pretendard Variable`(=92조각) 로 자동 폴백한다 — 글리프 누락으로 깨질 일은 없다.
 *
 * 쓰는 법
 * -------
 *   # 1. 도구 (pyftsubset 이 woff2 를 다루려면 brotli 가 필요하다)
 *   pip install fonttools brotli
 *
 *   # 2. 원본 가변 폰트 — repo 에 넣기엔 커서(6.7MB) 커밋하지 않는다.
 *   curl -sLO https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/variable/PretendardVariable.ttf
 *
 *   # 3. 랜딩 HTML 을 렌더할 서버를 띄우고(서브셋에 넣을 글자를 여기서 긁는다) 실행
 *   pnpm build && pnpm start
 *   node scripts/build-landing-font-subset.mjs http://localhost:3000 ./PretendardVariable.ttf
 *
 * ⚠️ 랜딩 카피를 고치면 이 스크립트를 다시 돌려야 한다. 안 돌려도 화면은 멀쩡하지만
 *    (폴백이 받쳐 준다) 새 글자 때문에 92조각 중 일부를 추가로 받게 되어 이득이 줄어든다.
 *    기억에 의존하지 않도록 `src/features/landing/landing-font-subset.test.tsx` 가
 *    랜딩을 렌더해 글자를 대조한다 — 새 글자가 생기면 그 테스트가 실패하며 위 명령을 안내한다.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ORIGIN = process.argv[2] ?? "http://localhost:3000";
const SOURCE_FONT = process.argv[3] ?? "PretendardVariable.ttf";
const OUT = "public/fonts/pretendard/PretendardVariable.landing.woff2";

/**
 * 서브셋에 항상 포함할 글자.
 *
 * 랜딩 카피에 없더라도 넣어 두는 것들이다 — 여기 없으면 폴백이 걸리면서 92조각 중
 * 한 덩어리를 통째로 더 받게 된다. 몇 글자 더 넣는 비용이 훨씬 싸다.
 * - ASCII 전체: 영문 카피·숫자·문장부호 (`PromSearch`, `PPT`, `AI`, `2026` …)
 * - 헤더에 로그인 상태로 들어오는 닉네임까지는 예측할 수 없다 → 그건 폴백에 맡긴다.
 */
const ALWAYS = [
  ...Array.from({ length: 0x7e - 0x20 + 1 }, (_, i) => String.fromCodePoint(0x20 + i)),
  "…‘’“”·─—–₩％",
].join("");

/** 렌더된 HTML 에서 사람이 읽는 텍스트만 남긴다(스크립트/스타일/태그/속성 제외). */
function extractVisibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

const html = await fetch(ORIGIN, { headers: { "user-agent": "landing-font-subset" } }).then((r) => {
  if (!r.ok) throw new Error(`${ORIGIN} 응답이 ${r.status} 다 — 서버가 떠 있는지 확인할 것`);
  return r.text();
});

const chars = new Set([...extractVisibleText(html), ...ALWAYS]);
// 제어문자·서로게이트는 서브셋 대상이 아니다
for (const c of [...chars]) {
  const cp = c.codePointAt(0);
  if (cp < 0x20 || (cp >= 0x7f && cp <= 0x9f)) chars.delete(c);
}

const sorted = [...chars].sort();
const tmp = mkdtempSync(join(tmpdir(), "landing-subset-"));
const textFile = join(tmp, "chars.txt");
writeFileSync(textFile, sorted.join(""), "utf8");

console.log(`글자 ${sorted.length}자 수집 (출처: ${ORIGIN})`);

/**
 * 1단계 — 가변축 좁히기(partial instancing).
 *
 * 원본 축은 wght 45..930 인데 디자인 토큰이 쓰는 굵기는 400/500/600/700 뿐이다.
 * 축을 그대로 두면 쓰지도 않는 굵기의 보간 델타(gvar)가 따라와 파일이 커진다.
 * 실측: 전 축 76.6KB → 400:700 56.9KB.
 *
 * 축을 아예 고정하지 않는 이유: 고정하면 굵기마다 파일이 따로 필요해져 요청 수가 늘고,
 * 400~700 구간 하나로 네 굵기를 모두 커버하는 편이 총량이 작다.
 */
const instanced = join(tmp, "instanced.ttf");
execFileSync(
  "python3",
  ["-m", "fontTools.varLib.instancer", SOURCE_FONT, "wght=400:700", "-o", instanced],
  { stdio: ["ignore", "ignore", "inherit"] },
);

/**
 * 2단계 — 글자 서브셋 + OpenType feature 정리.
 *
 * `--layout-features` 를 기본값(전부)으로 두면 안 쓰는 기능의 룩업 테이블이 통째로 남는다.
 * 실측: 전 feature 56.9KB → 아래 4개만 42.3KB.
 *   ccmp — 한글 자모 조합(완성형만 써도 안전판으로 남긴다)
 *   kern — 커닝
 *   liga·calt — 라틴 합자/문맥 대체 (영문 카피용)
 */
execFileSync(
  "pyftsubset",
  [
    instanced,
    `--text-file=${textFile}`,
    `--output-file=${OUT}`,
    "--flavor=woff2",
    "--layout-features=ccmp,kern,liga,calt",
    "--no-hinting",
    "--desubroutinize",
    "--drop-tables+=DSIG",
  ],
  { stdio: ["ignore", "inherit", "inherit"] },
);

console.log(`${OUT} — ${(statSync(OUT).size / 1024).toFixed(1)}KB`);

// 카피를 고친 뒤 이 파일이 바뀌면 서브셋도 다시 만들어야 한다는 신호가 된다
writeFileSync("scripts/landing-font-charset.txt", sorted.join(""), "utf8");
console.log(`수집한 글자 목록: scripts/landing-font-charset.txt`);

/**
 * 构建期资产：分享卡片 PNG + 架构图 SVG。都要真实浏览器（CJK 字形、mermaid 要 DOM），
 * 所以本地生成、产物入库，`make check` 只校验产物没有落后于源文件。
 *
 *   npm run assets        重新生成
 *   npm run assets:check  校验
 *
 * 架构图靠写进 SVG 的源码哈希判断是否过期；分享卡片同理，哈希记在旁边的 og.png.sha。
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { chromium } from "playwright";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const diagramsDir = join(root, "src/diagrams");
const ogSource = join(root, "designs/og-card/og.html");
const ogOut = join(root, "public/og.png");
const ogStamp = join(root, "designs/og-card/og.png.sha");
const STAMP = "lpn-source-sha";
/** 和 tokens.css 的 --font-body 一致。 */
const BODY_FONT =
  '"Inter Variable", -apple-system, BlinkMacSystemFont, "PingFang SC", "Noto Sans SC", sans-serif';

const hashOf = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);

/** og.html 和它引用的令牌一起算哈希，改哪一个都要重新截图。 */
async function ogHash() {
  const parts = await Promise.all(
    [ogSource, join(root, "src/styles/tokens.css")].map((p) => readFile(p, "utf8")),
  );
  return hashOf(parts.join("\n"));
}

/**
 * Fraunces / Inter 直接取 node_modules 里的 woff2，和站点用同一份字体。
 * 用 data URL 内嵌：渲染架构图的页面是 about:blank，加载不了 file:// 资源。
 */
function fontFaces() {
  const font = (family, pkg, file) => {
    const b64 = readFileSync(
      join(root, "node_modules/@fontsource-variable", pkg, "files", file),
    ).toString("base64");
    return `@font-face{font-family:"${family}";src:url(data:font/woff2;base64,${b64}) format("woff2-variations");font-weight:100 900;}`;
  };
  return (
    font("Fraunces Variable", "fraunces", "fraunces-latin-wght-normal.woff2") +
    font("Inter Variable", "inter", "inter-latin-wght-normal.woff2")
  );
}

async function renderOgCard(browser, check) {
  const sha = await ogHash();
  if (check) {
    const recorded = existsSync(ogStamp) ? (await readFile(ogStamp, "utf8")).trim() : "";
    if (!existsSync(ogOut) || recorded !== sha) {
      console.error("  ✗ og.png 落后于 og.html 或 tokens.css");
      return 1;
    }
    console.log("  ✓ og.png");
    return 0;
  }
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2,
  });
  await page.goto(pathToFileURL(ogSource).href, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: fontFaces() });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: ogOut });
  await writeFile(ogStamp, sha + "\n");
  await page.close();
  console.log("  og.html        → public/og.png (1200×630 @2x)");
  return 0;
}

async function renderDiagrams(browser, check) {
  const files = (await readdir(diagramsDir)).filter((f) => f.endsWith(".mmd"));
  let stale = 0;
  let page;
  if (!check) {
    page = await browser.newPage();
    // 量字和展示必须用同一套字体，否则节点框按回退字体算宽、按 Inter 显示，文字会被截断。
    await page.setContent("<!doctype html><html><body></body></html>");
    await page.addStyleTag({ content: fontFaces() });
    await page.evaluate(async (family) => {
      await document.fonts.load(`16px ${family}`);
    }, '"Inter Variable"');
    await page.addScriptTag({ path: join(root, "node_modules/mermaid/dist/mermaid.min.js") });
  }

  for (const file of files) {
    const src = await readFile(join(diagramsDir, file), "utf8");
    const sha = hashOf(src.trim());
    const outPath = join(diagramsDir, file.replace(/\.mmd$/, ".svg"));

    if (check) {
      const ok =
        existsSync(outPath) &&
        (await readFile(outPath, "utf8")).includes(`data-${STAMP}="${sha}"`);
      console.log(ok ? `  ✓ ${file}` : `  ✗ ${file} 改过但 SVG 没重新生成`);
      if (!ok) stale++;
      continue;
    }

    const svg = await page.evaluate(async ([text, FONT]) => {
      const m = window.mermaid;
      m.initialize({ startOnLoad: false, theme: "neutral", fontFamily: FONT });
      const { svg } = await m.render("d" + Math.random().toString(36).slice(2), text);
      return svg;
    }, [src, BODY_FONT]);

    // 去掉 mermaid 写死的宽高，让 SVG 跟着容器自适应。
    const responsive = svg
      .replace(/\swidth="[^"]*"/, "")
      .replace(/\sheight="[^"]*"/, ' width="100%"')
      .replace("<svg ", `<svg data-${STAMP}="${sha}" `);
    await writeFile(outPath, responsive + "\n");
    console.log(`  ${file.padEnd(14)} → ${file.replace(/\.mmd$/, ".svg")}`);
  }
  await page?.close();
  return stale;
}

const check = process.argv.includes("--check");
console.log(check ? "校验构建期资产…" : "生成构建期资产…");
let stale = 0;
if (check) {
  stale += await renderOgCard(null, true);
  stale += await renderDiagrams(null, true);
} else {
  const browser = await chromium.launch();
  try {
    await renderOgCard(browser, false);
    await renderDiagrams(browser, false);
  } finally {
    await browser.close();
  }
}
if (stale > 0) {
  console.error(`${stale} 个产物落后于源文件——跑 npm run assets 重新生成`);
  process.exit(1);
}
console.log(check ? "资产校验通过。" : "完成。产物需要入库。");

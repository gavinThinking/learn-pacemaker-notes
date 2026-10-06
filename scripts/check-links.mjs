/**
 * 站内链接检查：dist/ 里每个 HTML 的站内 href / src 都必须指向一个真实存在的产物。
 * 站外链接不在这里查，避免检查依赖网络。
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const dist = resolve(fileURLToPath(import.meta.url), "../../dist");
if (!existsSync(dist)) {
  console.error("dist/ 不存在，先跑 npm run build");
  process.exit(1);
}

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const exists = (path) => {
  const p = join(dist, decodeURIComponent(path));
  return (
    (existsSync(p) && statSync(p).isFile()) || existsSync(join(p, "index.html"))
  );
};

let broken = 0;
let checked = 0;
for (const file of walk(dist).filter((f) => f.endsWith(".html"))) {
  const html = readFileSync(file, "utf8");
  for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (!url.startsWith("/") || url.startsWith("//")) continue;
    checked++;
    const path = url.split(/[?#]/)[0];
    if (!exists(path)) {
      console.error(`  ✗ ${relative(dist, file)} → ${url}`);
      broken++;
    }
  }
}

if (broken > 0) {
  console.error(`站内链接检查失败：${broken} 处断链。`);
  process.exit(1);
}
console.log(`站内链接检查通过：${checked} 个链接。`);

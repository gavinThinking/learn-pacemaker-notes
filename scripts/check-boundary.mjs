/**
 * 公开边界检查。这个站公开，实验平台和以前的工作环境不公开；
 * 下面的词一旦出现在仓库文件或构建产物里，就说明有私有内容漏了出来。
 *
 * 扫描范围：git 跟踪的和未被忽略的文本文件，加上 dist/。本文件自身不扫。
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(import.meta.url), "../..");
const self = relative(root, fileURLToPath(import.meta.url));

const rules = [
  { why: "以前工作环境的内部前缀", re: /\bcyc[-_]/i },
  { why: "以前雇主的公司和产品名", re: /\bpower ?store\b|\bdell\b|\bemc\b/i },
  {
    why: "实验平台的私有资源名或脚本名",
    re: /cluster-db-clone|local-db-clone|\bicm-|controlpath|ansible-service-clone|pgsql-fs-|local_cp_power|core_container|pacemaker_util|pacemaker_proxy/i,
  },
  { why: "私有仓库的名字或链接", re: /pacemaker-appliance-platform|github\.com\/gavinThinking/i },
];

const listed = execFileSync("git", ["ls-files", "-co", "--exclude-standard"], {
  cwd: root,
  encoding: "utf8",
})
  .split("\n")
  .filter(Boolean);

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [relative(root, p)];
  });
const built = existsSync(join(root, "dist")) ? walk(join(root, "dist")) : [];

const binary = /\.(png|jpe?g|gif|webp|ico|woff2?)$/i;
let hits = 0;
for (const file of [...new Set([...listed, ...built])]) {
  if (file === self || binary.test(file) || !existsSync(join(root, file))) continue;
  const lines = readFileSync(join(root, file), "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const { why, re } of rules) {
      if (re.test(line)) {
        console.error(`  ✗ ${file}:${i + 1}  ${why}`);
        hits++;
      }
    }
  });
}

if (hits > 0) {
  console.error(`公开边界检查失败：${hits} 处。`);
  process.exit(1);
}
console.log("公开边界检查通过。");

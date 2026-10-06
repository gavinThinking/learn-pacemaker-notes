# learn-pacemaker-notes — Agent 操作规范

给 Codex / Claude Code 的指令。给人看的说明在 `README.md`。

## 公开边界（硬约束）

这个站公开，实验平台仓库和作者以前的工作环境不公开。

- 不链接、不点名实验平台仓库；平台的内容只以文字摘要出现，写在手记的 `evidence` 字段或
  `src/data/roadmap.ts` 的 `evidence` 里。
- 平台页只按 Pacemaker 资源形态和功能描述资源，不写平台里的资源 ID、脚本名。
- 不出现以前雇主的公司名、产品名和内部前缀。
- 具体拦截的词在 `scripts/check-boundary.mjs`，`make check` 会跑。检查红了就改内容，不许改检查放行。

## 内容

- 上游版本钉在 Pacemaker 2.1.11（`src/data/site.ts`）。源码链接一律指向 `Pacemaker-2.1.11` tag。
- 架构图的证据等级如实标：`guess` / `docs` / `source`，不确定就标低。
- 手记正文由作者本人写；agent 负责站点工程、校对引用和事实核对，不代写手记正文，除非作者在当次请求里明确要求。

## 收尾

直接在 `main` 上工作，不建分支。改完：

1. 改了 `.mmd` 或 `designs/og-card/og.html` / `src/styles/tokens.css`，先跑 `npm run assets`。
2. `make check` 全绿。
3. 只提交本次任务的文件，push `origin main`，核对本地 `HEAD` 与远端 SHA 一致。

不使用 GitHub Actions；质量门只在本地。

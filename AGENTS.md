# learn-pacemaker-notes — Agent 操作规范

给 Codex / Claude Code 的指令。给人看的说明在 `README.md`。

## 公开边界（硬约束）

这个仓库和站点都公开；实验平台仓库和作者以前的工作环境不公开。

- 不链接、不点名实验平台仓库；平台的内容只以文字摘要出现，写在手记的 `evidence` 字段或
  `src/data/roadmap.ts` 的 `evidence` 里。
- 平台页只按 Pacemaker 资源形态和功能描述资源，不写平台里的资源 ID、脚本名。
- 不出现以前雇主的公司名、产品名和内部前缀。
- 具体拦截的词在 `scripts/check-boundary.mjs`，`make check` 会跑。检查红了就改内容，不许改检查放行。

## 内容

- 上游版本钉在 Pacemaker 2.1.11（`src/data/site.ts`）。源码链接一律指向 `Pacemaker-2.1.11` tag。
- 架构图的证据等级如实标：`guess` / `docs` / `source`，不确定就标低。
- 手记正文由 agent 写，作者跟着读、追问、学习。每条源码结论附 2.1.11 tag 的链接，没对照过源码的标明只依据文档，
  读者要能自己核对。手记不出考题、不设自测。
- 站点不依赖实验平台：一个阶段写完手记就算完成，平台验证是可选的补充。需要时可以参考平台的实现，但只以文字
  摘要写进 `evidence`，平台细节不必公开。

## 收尾

直接在 `main` 上工作，不建分支。改完：

1. 改了 `.mmd` 或 `designs/og-card/og.html` / `src/styles/tokens.css`，先跑 `npm run assets`。
2. `make check` 全绿。
3. 只提交本次任务的文件，push `origin main`，核对本地 `HEAD` 与远端 SHA 一致。

不使用 GitHub Actions；质量门只在本地。

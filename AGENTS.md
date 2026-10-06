# learn-pacemaker-notes — Agent 操作规范

给 Codex / Claude Code 的指令。给人看的说明在 `README.md`。

## 公开边界（硬约束）

这个仓库和站点都公开；实验平台仓库和作者以前的工作环境不公开。

- 不链接、不点名实验平台仓库；平台的内容只以文字摘要出现，写在讲义的 `evidence` 字段或
  `src/data/roadmap.ts` 的 `evidence` 里。
- 关于页的实验平台一节只按 Pacemaker 资源形态和功能描述资源，不写平台里的资源 ID、脚本名。
- 不出现以前雇主的公司名、产品名和内部前缀。
- 具体拦截的词在 `scripts/check-boundary.mjs`，`make check` 会跑。检查红了就改内容，不许改检查放行。

## 内容

- 上游版本钉在 Pacemaker 2.1.11（`src/data/site.ts`）。源码链接一律指向 `Pacemaker-2.1.11` tag。
- 架构图的证据等级如实标：`guess` / `docs` / `source`，不确定就标低。
- 站名「Pacemaker 讲义」，每篇是「第 N 讲」，N 就是阶段号（阶段 01 是第 1 讲）。正文由 AI 撰写，
  页面上照实标「AI 撰写 · 对照源码」，不写成作者的手笔。
- 知识要连成网。每篇讲义在 frontmatter 的 `links` 里写它连到哪些阶段：`to` 是阶段编号，`why` 用一句话
  写明两者是什么关系（例如「这篇只交出成员名单；名单里剩下的节点够不够资格做决定，由 quorum 判断」），
  不写「相关」「参见」。目标阶段没写讲义也照样连，那是待写信号。反向链接由站点算出，不手写。
- 知识网络的主线在 `src/data/storyline.ts`：一个节点断电的故障从头走到尾。写完一篇讲义，回去核对主线里
  对应那一步，和讲义对不上就改主线。
- 讲义正文由 agent 写，作者跟着读、追问、学习。每条源码结论附 2.1.11 tag 的链接，没对照过源码的标明只依据文档，
  读者要能自己核对。讲义不出考题、不设自测。
- 站点不依赖实验平台：一个阶段写完讲义就算完成，平台验证是可选的补充。需要时可以参考平台的实现，但只以文字
  摘要写进 `evidence`，平台细节不必公开。

## 画图

以后所有图都用 diagram-design skill 画，不再新写 Mermaid。

- 根目录的 `.diagram-design` 指定 profile `learn-pacemaker-notes`（在本机
  `~/.diagram-design/profiles/`）。换机器时按下表重建，颜色和 `src/styles/tokens.css` 同源：

  | 角色 | 站点变量 | 用途 |
  | --- | --- | --- |
  | paper | `--paper-raised` | 图的底色 |
  | paper-2 | `--paper-muted` | 分区、状态带 |
  | ink | `--ink` | 正文、步骤框描边 |
  | muted | `--ink-muted` | 副标题、箭头 |
  | soft | `--ink-subtle` | 刻度、分区标签 |
  | rule | `--line` | 细分隔线 |
  | accent | `--brand` | 焦点，一张图最多 2 处 |
  | accent-tint | `--brand-light` | 焦点框填充 |

- 源文件是 `src/diagrams/<name>.html`：一页完整 HTML，里面第一个 `<svg>` 就是图。`npm run assets`
  把它取出来写成同名 `.svg`，讲义里用 `<Diagram name="<name>" />` 引用。
- SVG 里的颜色一律写站点变量加浅色兜底，例如 `var(--ink, #22201b)`，这样嵌进页面后跟着站点切深浅色。
  样式写在 SVG 自己的 `<style>` 里，选择器用 `#<id>` 限定，class 和 marker 的 id 都加图名前缀
  （例如 `nlt-`）——内联 SVG 的样式和 id 在整页是全局的，不加前缀会互相串。
- `viewBox` 宽 640（正文图框的宽度，桌面上 1:1 显示），根 `<svg>` 加 `style="min-width: 560px"`，
  手机上横向滚动而不是缩到看不清。
- 中文说明用正文字体，等宽字体只给函数名、日志原文这类代码。
- 一张图最多 9 个框，超了就拆成两张。
- 提交前跑 skill 自带的 `scripts/self_check.py <源文件>`，并在浅色、深色、手机宽度下各看一眼。
- 现有的 `.mmd` 图下次改动时改画成 `.html`，不单独返工。

## 收尾

直接在 `main` 上工作，不建分支。改完：

1. 改了 `src/diagrams/` 下的 `.html` / `.mmd`，或 `designs/og-card/og.html` / `src/styles/tokens.css`，先跑 `npm run assets`。
2. `make check` 全绿。
3. 只提交本次任务的文件，push `origin main`，核对本地 `HEAD` 与远端 SHA 一致。

不使用 GitHub Actions；质量门只在本地。

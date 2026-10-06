# 学 Pacemaker 手记（learn-pacemaker-notes）

一句话：学 Pacemaker 2.1.11 的公开学习站。按成员与 quorum → 集群状态 → 调度 → 执行与失败 → fencing → PAF
六层、14 个阶段推进，每篇手记引用固定 tag 的上游文档和源码。纯静态站，Astro 构建，部署目标
`https://learn-pacemaker-notes.vercel.app`。

同系列：[学 Pi 手记](https://learn-pi-notes.vercel.app)，设计令牌和版式与它一致。

## 和实验平台的关系

两边互不依赖：一个阶段写完手记就算完成，不等平台。验证用的多节点集群在另一个私有仓库，需要时手记可以
参考它的实现，但**只放文字摘要**，不链接、不点名平台仓库，也不出现平台内部的资源名；
`scripts/check-boundary.mjs` 在 `make check` 里拦这些词。

手记正文由 AI 撰写，作者跟读学习；每条源码结论链到 2.1.11 tag，读者可以自己核对。

## 常用命令

| 命令 | 做什么 |
|---|---|
| `npm install` | 装依赖（Node ≥ 22.12） |
| `npm run dev` | 本地预览，默认 http://localhost:4321 |
| `npm run assets` | 用 Playwright 重新生成 `public/og.png` 和 `src/diagrams/*.svg`，产物入库 |
| `make check` | 本地质量门：类型检查 + 构建、资产是否过期、公开边界、站内链接、行尾空白、不许有 GitHub Actions |

## 目录

| 路径 | 内容 |
|---|---|
| `src/data/site.ts` | 站名、上游版本、导航 |
| `src/data/roadmap.ts` | 6 层 14 个阶段，每个阶段的手记和可选的平台验证 |
| `src/content/notes/` | 手记（Markdown / MDX），字段见 `src/content.config.ts` |
| `src/diagrams/` | 架构图：`.mmd` 是源，`.svg` 由 `npm run assets` 生成 |
| `designs/og-card/og.html` | 分享卡片的源 |

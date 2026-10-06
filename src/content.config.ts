import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

import { stageNos } from "./data/network";

/**
 * 讲义。`layer` 和 `stage` 对应 src/data/roadmap.ts 的编号。
 * `upstream` 指向固定 tag 的上游文档或源码；`evidence` 是实验平台导出的摘要，
 * 只写文字，不链接平台仓库。`links` 是这篇连到的阶段，`why` 写明两者是什么关系，
 * 目标阶段没写讲义也照样连；反向链接由站点算出。
 */
const notes = defineCollection({
  loader: glob({ base: "./src/content/notes", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    layer: z.enum(["L1", "L2", "L3", "L4", "L5", "L6"]),
    stage: z.string().optional(),
    upstream: z
      .array(z.object({ label: z.string(), href: z.string().url() }))
      .default([]),
    evidence: z.array(z.string()).default([]),
    links: z
      .array(
        z.object({
          to: z.string().refine((no) => stageNos.includes(no), "不存在的阶段编号"),
          why: z.string(),
        }),
      )
      .default([]),
  }),
});

export const collections = { notes };

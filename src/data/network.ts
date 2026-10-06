/**
 * 知识网络：阶段之间的连接。连接只来自已发手记 frontmatter 的 `links`，
 * 反向链接（哪些手记指向某个阶段）由这里算出来，不手写。
 */
import type { CollectionEntry } from "astro:content";

import { layers, type Stage } from "./roadmap";

const stages = new Map<string, Stage>(layers.flatMap((l) => l.stages).map((s) => [s.no, s]));

export const stageNos = [...stages.keys()];

export interface Edge {
  from: string;
  to: string;
  why: string;
}

export const edgesOf = (notes: CollectionEntry<"notes">[]): Edge[] =>
  notes.flatMap((n) => {
    const from = n.data.stage;
    return from ? n.data.links.map((l) => ({ from, to: l.to, why: l.why })) : [];
  });

/** 已写的阶段链到手记，没写的链到学习路线上那一格——那是待写信号。 */
export function stageRef(no: string) {
  const s = stages.get(no);
  if (!s) throw new Error(`不存在的阶段编号 ${no}`);
  return {
    no,
    title: s.title,
    written: Boolean(s.note),
    href: s.note ? `/notes/${s.note}/` : `/roadmap/#stage-${no}`,
  };
}

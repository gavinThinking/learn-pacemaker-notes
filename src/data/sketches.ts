/**
 * 图解：学习时用 AI 生成的概念插图。帮人建立直觉，不是证据——
 * 没有对照过源码，细节以手记和 Pacemaker-2.1.11 源码为准。
 *
 * 加一张图：把 WebP 放进 src/assets/sketches/<slug>.webp，再在下面加一条同名 slug。
 * 两边对不上构建直接失败，不会出现没有说明的图或指向空文件的条目。
 *
 * - group：开篇 overview，或 roadmap.ts 的层编号；
 * - stage：对应 roadmap.ts 的阶段编号，能对上才填；
 * - caveats：图里已知画错或说得不准的地方，和图一起展示。
 */
import type { ImageMetadata } from "astro";

import { layers } from "./roadmap";

export type SketchGroup = "overview" | "L1" | "L2" | "L3" | "L4" | "L5" | "L6";

export interface Sketch {
  slug: string;
  title: string;
  /** 一句话：这张图想让人记住什么。也用作图片的替代文本。 */
  point: string;
  group: SketchGroup;
  stage?: string;
  caveats?: readonly string[];
}

const entries: Sketch[] = [
  {
    slug: "why-pacemaker",
    title: "为什么需要 Pacemaker？",
    point:
      "单机上进程挂了，systemd 重启就行；多节点之间一旦网络分区，谁是主库说不准，故障处理就从重启进程变成了分布式的资源管理。",
    group: "overview",
  },
  {
    slug: "what-it-really-solves",
    title: "Pacemaker 真正解决的是什么？",
    point:
      "三个节点对彼此的判断互相矛盾时，由 Pacemaker 综合节点状态、连通性、约束和 quorum，给出唯一的答案：现在谁该运行什么。",
    group: "overview",
  },
  {
    slug: "who-runs-what",
    title: "现在谁运行什么？",
    point: "节点会坏、网络会断，Pacemaker 在这样的集群里持续给每个资源指定一个落脚的节点。",
    group: "overview",
  },
  {
    slug: "what-pacemaker-does",
    title: "Pacemaker 在做什么？",
    point:
      "管理员给出期望的策略，Corosync 提供成员和 quorum，Pacemaker 在两者之间做调度决定，再去启停、提升各个资源。",
    group: "overview",
  },
  {
    slug: "placement-and-recovery",
    title: "Pacemaker 到底在做什么？",
    point:
      "输入是成员、quorum、资源状态和约束，输出是每个资源该在哪、该做什么：promote、start、migrate、stop，必要时 fence。",
    group: "overview",
  },
  {
    slug: "state-convergence",
    title: "让资源状态收敛",
    point: "当前状态加上 HA 策略，算出期望状态和恢复动作，执行完再看一次状态，一轮接一轮。",
    group: "overview",
    caveats: [
      "图里写的「Master-Slave」是旧叫法；2.1 起统一叫 promoted / unpromoted，配置里对应 promotable clone。",
    ],
  },
  {
    slug: "declarative-control-loop",
    title: "声明式控制系统",
    point:
      "管理员写的是「要什么」而不是「怎么做」；调度器比较观测到的状态和策略，算出动作，执行后的新状态再回到下一轮比较。",
    group: "overview",
  },
  {
    slug: "state-decision-action",
    title: "从状态到动作的决策链",
    point:
      "各节点的状态汇进 CIB，调度器拿快照算出要做的动作，controller 把动作分给 executor 启停资源、分给 fencer 隔离节点。",
    group: "overview",
    caveats: [
      "图里没画动作结果写回 CIB 这一步；实际上每个动作的结果都会回到 CIB 的 status 段，触发下一轮计算。",
    ],
  },
  {
    slug: "corosync-first-boundary",
    title: "Corosync 和 Pacemaker 的第一条边界",
    point:
      "Corosync 负责回答「哪些节点还在、有没有 quorum」，形成集群视图；Pacemaker 只基于这份视图决定资源该由谁运行。",
    group: "L1",
    stage: "01",
  },
  {
    slug: "membership-not-pacemaker",
    title: "Pacemaker 不负责「谁还活着」",
    point: "成员关系、quorum 和可靠消息都在 Corosync 这一层；Pacemaker 站在它上面做资源决策。",
    group: "L1",
    stage: "01",
  },
  {
    slug: "corosync-cluster-view",
    title: "Corosync 先告诉 Pacemaker 集群是什么样",
    point: "Corosync 把真实世界里节点的存活情况整理成一份集群视图，Pacemaker 读这份视图，不自己去探测节点。",
    group: "L1",
    stage: "02",
  },
  {
    slug: "cib-world-model",
    title: "CIB：Pacemaker 眼里的世界模型",
    point:
      "CIB 是一份 XML：configuration 段写期望（节点、资源、约束、集群选项），status 段记现实（节点状态、资源状态、操作历史）。",
    group: "L2",
    stage: "03",
    caveats: [
      "图里说状态「通过心跳和监控」更新进 CIB。心跳属于 Corosync；写进 status 段的是 controld 记下的成员变化和每次资源操作的结果。",
    ],
  },
  {
    slug: "constraints-not-scripts",
    title: "约束是规则，不是脚本",
    point:
      "location、colocation、ordering 三类约束描述的是偏好和关系，不规定步骤；具体先 fence 谁、在哪启动什么，由调度器结合当前状态算出来。",
    group: "L3",
    stage: "05",
  },
  {
    slug: "scheduler-compute-only",
    title: "调度器只计算，不执行",
    point: "输入一份 CIB 快照，输出一串必需的动作；真正去执行的是后面的组件。",
    group: "L3",
    stage: "08",
  },
  {
    slug: "scheduler-brain",
    title: "调度器：CIB 快照进，动作计划出",
    point:
      "以 Node A 故障为例：快照里 A 失效、B 在线，调度器得出的计划是先 fence A，再在 B 上启动 PostgreSQL，最后启动 VIP。",
    group: "L3",
    stage: "08",
  },
  {
    slug: "scheduler-five-steps",
    title: "调度器的五步",
    point:
      "当前状态和目标状态进入调度器，算出动作计划，交给 controld，再由 executor 和 fencer 分别执行资源操作和节点隔离。",
    group: "L3",
    stage: "08",
    caveats: [
      "图把「目标状态」画成配置里定义好的东西。实际上配置只给约束和偏好，目标状态是调度器每一轮根据配置和当前状态算出来的。",
    ],
  },
  {
    slug: "resources-not-processes",
    title: "Pacemaker 管的不是进程，是 Resource",
    point:
      "数据库、虚拟 IP、容器、systemd 服务，经过各自的资源代理，都变成同一套 start / stop / monitor 接口；支持角色的资源再多 promote / demote。",
    group: "L4",
    stage: "10",
    caveats: [
      "图里的「ocf:heartbeat:systemd」并不存在。systemd 服务用的是 systemd: 资源类，由 pacemaker-execd 直接调用 systemd，不经过 OCF 资源代理。",
    ],
  },
  {
    slug: "resource-agent-boundary",
    title: "资源代理是 Pacemaker 和真实服务之间的边界",
    point:
      "Pacemaker 只发统一的操作、只关心成功还是失败；pg_ctl、ip addr、docker start 这些细节都由资源代理翻译。",
    group: "L4",
    stage: "10",
  },
];

/** 图片在构建期导入，Astro 据此生成缩略图和多尺寸 srcset。 */
const files = import.meta.glob<{ default: ImageMetadata }>("../assets/sketches/*.webp", {
  eager: true,
});
const imageBySlug = new Map(
  Object.entries(files).map(([path, mod]) => [
    path.replace(/^.*\/(.+)\.webp$/, "$1"),
    mod.default,
  ]),
);

const missing = entries.filter((e) => !imageBySlug.has(e.slug)).map((e) => e.slug);
const orphans = [...imageBySlug.keys()].filter((k) => !entries.some((e) => e.slug === k));
if (missing.length || orphans.length) {
  throw new Error(
    `图解数据和图片对不上。缺图片：${missing.join(", ") || "无"}；缺条目：${orphans.join(", ") || "无"}`,
  );
}

export const sketches = entries.map((e) => ({ ...e, image: imageBySlug.get(e.slug)! }));
export type SketchWithImage = (typeof sketches)[number];

export const sketchGroups = [
  {
    id: "overview" as const,
    name: "开篇：Pacemaker 在解决什么",
    goal: "还没拆层之前，先对整体建立直觉：它为什么存在，输入什么、输出什么。",
  },
  ...layers.map((l) => ({ id: l.no as SketchGroup, name: l.name, goal: l.goal })),
]
  .map((g) => ({ ...g, items: sketches.filter((s) => s.group === g.id) }))
  .filter((g) => g.items.length > 0);

export const sketchBySlug = (slug: string) => {
  const s = sketches.find((x) => x.slug === slug);
  if (!s) throw new Error(`找不到图解 "${slug}"，看看 src/data/sketches.ts。`);
  return s;
};

export const groupLabel = (id: SketchGroup) =>
  id === "overview" ? "开篇" : `${id} · ${layers.find((l) => l.no === id)!.name}`;

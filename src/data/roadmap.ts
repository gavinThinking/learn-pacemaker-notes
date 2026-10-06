/**
 * 学习路线：6 层 14 个阶段，顺序是「这一层要成立，必须先懂哪一层」。
 *
 * 状态只看产出物，不评价掌握程度：
 * - note：已发布讲义的 slug，写了才填，填了这个阶段就算完成；
 * - evidence：实验平台上对应的验证，可选，用文字写，不放链接（平台仓库私有）。
 */
export type StageStatus = "todo" | "done";

export interface Stage {
  no: string;
  title: string;
  summary: string;
  /** 上游里对应的目录或文档章节，相对 Pacemaker-2.1.11 tag。 */
  upstream?: string;
  note?: string;
  evidence?: string;
}

export interface Layer {
  no: string;
  name: string;
  goal: string;
  stages: Stage[];
}

export const layers: Layer[] = [
  {
    no: "L1",
    name: "成员与 quorum",
    goal: "谁还在集群里、这一侧有没有资格做决定。上面所有层都假设这个答案是对的。",
    stages: [
      {
        no: "01",
        title: "Corosync knet 与 Totem 成员",
        summary: "节点怎么互相发现、心跳丢多久算掉线、成员变化怎么通知上层。",
        note: "01-corosync-membership",
      },
      {
        no: "02",
        title: "votequorum 与 two_node / auto_tie_breaker 等特例",
        summary: "quorum 的票数算法，以及偶数节点、两节点时为什么要特例。",
      },
    ],
  },
  {
    no: "L2",
    name: "集群状态",
    goal: "整个集群共享的那份配置和状态放在哪、怎么保持一致。",
    stages: [
      {
        no: "03",
        title: "CIB 的结构和同步",
        summary: "configuration 和 status 两段各管什么，改动怎么同步到每个节点。",
        upstream: "daemons/based",
      },
      {
        no: "04",
        title: "节点属性与 attrd",
        summary: "临时属性和永久属性的区别，资源代理怎么用属性影响调度。",
        upstream: "daemons/attrd",
      },
    ],
  },
  {
    no: "L3",
    name: "调度决策",
    goal: "给定一份 CIB，资源该放在哪、按什么顺序动。这一层是纯计算，可以离线复现。",
    stages: [
      {
        no: "05",
        title: "location / colocation / order 约束",
        summary: "三类约束各自表达什么，组合起来时谁先谁后。",
        upstream: "daemons/schedulerd",
      },
      {
        no: "06",
        title: "score 与 stickiness",
        summary: "分数怎么累加、INFINITY 怎么参与运算、资源为什么不愿意挪回去。",
      },
      {
        no: "07",
        title: "clone 与 promotable",
        summary: "多实例资源怎么分布，主备角色由谁选、promotion score 从哪来。",
      },
      {
        no: "08",
        title: "transition graph 与 crm_simulate",
        summary: "调度结果长什么样，怎样用上游的回归用例离线重放一次决策。",
        upstream: "cts/scheduler",
      },
    ],
  },
  {
    no: "L4",
    name: "执行与失败",
    goal: "决策怎么变成动作，动作失败了怎么办。",
    stages: [
      {
        no: "09",
        title: "controld 与 DC 选举",
        summary: "为什么只有一个节点做决定，这个节点没了谁接手。",
        upstream: "daemons/controld",
      },
      {
        no: "10",
        title: "OCF 资源代理协议",
        summary: "start / stop / monitor / promote 的返回码约定，代理写错了集群会怎样。",
        upstream: "daemons/execd",
      },
      {
        no: "11",
        title: "monitor 失败、on-fail、migration-threshold",
        summary: "一次 monitor 失败之后的完整处理路径，什么时候原地重启、什么时候换节点。",
      },
    ],
  },
  {
    no: "L5",
    name: "安全",
    goal: "状态不确定时，怎样保证不会两边同时写。",
    stages: [
      {
        no: "12",
        title: "fencing / STONITH",
        summary: "为什么不能靠「对方应该已经停了」，fence 设备和拓扑怎么配。",
        upstream: "daemons/fenced",
      },
      {
        no: "13",
        title: "no-quorum-policy 与脑裂",
        summary: "失去 quorum 的一侧该停、该冻结还是该降级，各自的代价。",
      },
    ],
  },
  {
    no: "L6",
    name: "实战",
    goal: "把前面五层用在一个真实的有状态服务上。",
    stages: [
      {
        no: "14",
        title: "PAF：把 PostgreSQL 做成 promotable 资源",
        summary: "主库怎么选、切换时怎么保证不丢已确认的数据、旧主怎么重新加入。",
      },
    ],
  },
];

export const statusLabels: Record<StageStatus, string> = {
  todo: "未开始",
  done: "讲义已发",
};

export const statusOf = (s: Stage): StageStatus => (s.note ? "done" : "todo");

const all = layers.flatMap((l) => l.stages);

export const progress = {
  total: all.length,
  notes: all.filter((s) => s.note).length,
  evidence: all.filter((s) => s.evidence).length,
};

export const nextStage = all.find((s) => statusOf(s) !== "done") ?? all[0];

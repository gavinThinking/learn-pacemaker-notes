/**
 * 知识网络的主线：一个故障从头走到尾，依次经过哪些阶段。
 *
 * 没写手记的阶段，这里的说法是动笔前的理解；写完一篇手记就回来核对对应那一步，
 * 和手记对不上就改这里。阶段 11（monitor 失败）讲的是另一种故障，不在这条线上。
 */
export const scenario =
  "两节点集群，PostgreSQL 主库所在的节点突然断电。从另一边发现它掉线，到备库被提升成新主库。";

export interface Step {
  /** 这一步涉及的阶段编号，全部写了手记才算核对过。 */
  stages: string[];
  what: string;
}

export const storyline: Step[] = [
  {
    stages: ["01"],
    what: "另一边约 6.6 秒后把它划出成员名单，经 quorum 和 CPG 两路通知 Pacemaker。",
  },
  {
    stages: ["02", "13"],
    what: "只剩一个节点：two_node 特例决定这一侧还算不算有 quorum；没有 quorum 就按 no-quorum-policy 停手。",
  },
  {
    stages: ["09"],
    what: "断电的如果是 DC，活着的节点上的 controld 发起选举，自己当上 DC。",
  },
  {
    stages: ["03"],
    what: "新 DC 以 CIB 为准：断电节点上原来跑着哪些资源、各是什么角色，都记在 CIB 的 status 段。",
  },
  {
    stages: ["12"],
    what: "断电节点的状态未知，先 fencing 确认它真的停了，才能在别处接手它的资源。",
  },
  {
    stages: ["05", "06", "07", "08"],
    what: "调度器按约束和分数重新计算，得出新的 transition：在活着的节点上提升主库。",
  },
  {
    stages: ["04", "10"],
    what: "controld 按 transition 通过 OCF 协议调用资源代理；谁该当主，看资源代理写进节点属性的 promotion score。",
  },
  {
    stages: ["14"],
    what: "PAF 在 promote 前确认这个备库的数据足够新，再把它提升成新主库。",
  },
];

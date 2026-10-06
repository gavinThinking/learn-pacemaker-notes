/**
 * 知识网络的主线：一个故障从头走到尾，依次经过哪些阶段。
 *
 * 没写讲义的阶段，这里的说法是动笔前的理解；写完一篇讲义就回来核对对应那一步，
 * 和讲义对不上就改这里。阶段 11（monitor 失败）讲的是另一种故障，不在这条线上。
 */
export const scenario =
  "两节点集群，PostgreSQL 主库所在的节点突然断电。从另一边发现它掉线，到备库被提升成新主库。";

export interface Step {
  /** 这一步涉及的阶段编号，全部写了讲义才算核对过。 */
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
    what: "只剩一个节点、1 票：配了 two_node 门槛降到 1，这一侧保有 quorum（日志 Quorum retained），往下走 fencing；没配就失去 quorum，按 no-quorum-policy（默认 stop）停资源，也不去 fencing 断电的那台。",
  },
  {
    stages: ["09"],
    what: "断电的如果是 DC，活着的节点上的 controld 发起选举，自己当上 DC。",
  },
  {
    stages: ["03"],
    what: "DC 在 CIB 的 status 段把断电节点记为不在成员名单里。它上面原来跑着哪些资源、各是什么角色，记录留在 status 段没人删——新 DC 做 join 时只重写来加入的节点——调度器据此判定它状态不明，必须先 fencing。",
  },
  {
    stages: ["12"],
    what: "断电节点的状态未知，先 fencing 确认它真的停了，才能在别处接手它的资源。",
  },
  {
    stages: ["05", "06", "07", "08"],
    what: "调度器按约束和分数重新计算，得出新的 transition：在活着的节点上提升主库；colocation 让 VIP 跟着新主库走，order 让 VIP 等 promote 完成再启动。",
  },
  {
    stages: ["04", "10"],
    what: "谁该当主，调度器看的是各节点的 promotion score：备库上的资源代理平时在 monitor 里经 attrd 把它写进 status 段（属性名 master-<资源名>），断电节点的那份在它离开时就被删掉。controld 按 transition 通过 OCF 协议调用资源代理执行 promote。",
  },
  {
    stages: ["14"],
    what: "PAF 在 promote 前确认这个备库的数据足够新，再把它提升成新主库。",
  },
];

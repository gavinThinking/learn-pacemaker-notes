/**
 * 站点级常量。改文案先来这里，避免散落进各页面。
 *
 * 定位：学 Pacemaker 的公开学习记录。实验平台是私有仓库，本站只放从平台导出的
 * 摘要和快照，不链接平台仓库——访客点进私有仓库只会看到 404。
 *
 * 表达边界：不写「生产级」「企业级」这类未验证的宣传词；
 * 没有验证过的东西只出现在「证据边界」里，不出现在主张里。
 */
export const site = {
  name: "学 Pacemaker 手记",
  latin: "LEARNING PACEMAKER",
  sub: "跟着 Pacemaker 学集群高可用",
  author: "flyer",
  brand: "星鸦",
  title: "学 Pacemaker 手记 · 跟着 Pacemaker 学集群高可用",
  tagline: "一个学习者的公开记录",
  description:
    "按 Pacemaker 自己的分工——成员、集群状态、调度、执行、fencing——一层层拆开学，并在一套自建的多节点集群上验证。手记引用固定版本的上游文档和源码。",
  /** 唯一的事实源，版本写死。 */
  upstream: {
    name: "Pacemaker",
    version: "2.1.11",
    href: "https://github.com/ClusterLabs/pacemaker/tree/Pacemaker-2.1.11",
    docs: "https://clusterlabs.org/projects/pacemaker/doc/2.1/Pacemaker_Explained/html/",
  },
  email: "ryanzxg@gmail.com",
  nav: [
    { href: "/map/", label: "架构地图" },
    { href: "/roadmap/", label: "学习路线" },
    { href: "/network/", label: "知识网络" },
    { href: "/sketches/", label: "图解" },
    { href: "/notes/", label: "手记" },
    { href: "/platform/", label: "实验平台" },
    { href: "/evidence/", label: "证据边界" },
    { href: "/about/", label: "关于" },
  ],
} as const;

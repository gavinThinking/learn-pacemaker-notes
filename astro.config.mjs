// @ts-check
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig({
  // 同时决定 canonical 和 sitemap 里的绝对地址。预览或换域名用 SITE_URL 覆盖。
  site: process.env.SITE_URL ?? "https://learn-pacemaker-notes.vercel.app",
  integrations: [mdx(), sitemap()],
  // 架构地图并进了路线，证据边界和实验平台并进了关于；旧链接继续能用。
  redirects: {
    "/map": "/roadmap/#overview",
    "/evidence": "/about/#evidence",
    "/platform": "/about/#platform",
  },
});

import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";

import { site } from "../data/site";

export async function GET(context: APIContext) {
  const notes = (await getCollection("notes")).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  return rss({
    title: site.title,
    description: site.description,
    site: context.site!,
    trailingSlash: true,
    items: notes.map((note) => ({
      title: note.data.title,
      description: note.data.summary,
      pubDate: note.data.date,
      link: `/notes/${note.id}/`,
    })),
    customData: `<language>zh-Hans</language>`,
  });
}

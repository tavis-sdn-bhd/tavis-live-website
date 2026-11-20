import type { APIRoute } from "astro";
import { deckOf, defaultDesign, siteUrl } from "@/lib/site";
import { isEnglishOnly, pathIn } from "@/lib/locale";

// EmDash's /sitemap.xml lists only the blog's posts, from D1. This lists the site's own pages in both languages;
// public/robots.txt names both sitemaps.
export const prerender = true;

export const GET: APIRoute = () => {
  const loc = (path: string) => `${siteUrl}${path === "/" ? "" : path}`;
  const urls = deckOf(defaultDesign).flatMap((page) =>
    isEnglishOnly(page.href) ? [`  <url><loc>${loc(page.href)}</loc></url>`] : [loc(pathIn("en", page.href)), loc(pathIn("ms", page.href))].map((url) => `  <url><loc>${url}</loc></url>`),
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};

import type { APIRoute } from "astro";
import { deckOf, defaultDesign, hrefIn, siteUrl } from "@/lib/site";

// EmDash's /sitemap.xml lists only the blog's posts, from D1. This lists the site's own pages; public/robots.txt
// names both.
export const prerender = true;

export const GET: APIRoute = () => {
  const urls = deckOf(defaultDesign).map((page) => `  <url><loc>${siteUrl}${hrefIn(defaultDesign, page.href).replace(/^\/$/, "")}</loc></url>`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};

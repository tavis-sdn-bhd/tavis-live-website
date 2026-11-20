import type { APIRoute } from "astro";
import { deckOf, defaultDesign, siteUrl } from "@/lib/site";
import { hasTwin, pathIn } from "@/lib/locale";

// EmDash's /sitemap.xml lists only the blog's posts, from D1. This lists the site's own pages in both languages.
// Submit both to Google Search Console; EmDash's /robots.txt names the posts' one (README, Launch).
export const prerender = true;

export const GET: APIRoute = () => {
  // The same URLs as the pages' hreflang tags (src/layouts/Ba.astro), home's trailing slash included.
  const paths = deckOf(defaultDesign).flatMap((page) => (hasTwin(page.href) ? [pathIn("en", page.href), pathIn("ms", page.href)] : [page.href]));
  const urls = paths.map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};

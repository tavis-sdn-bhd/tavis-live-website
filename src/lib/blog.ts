import { getEmDashCollection, getEmDashEntry, type ContentEntry } from "emdash";
import type { Post } from "../../emdash-env";
import { type DesignId, hrefIn } from "@/lib/site";

/** The blog's posts, in the `posts` collection that seed/seed.json defines. */
export type BlogPost = ContentEntry<Post>;

/** Cards in each page's grid: four rows of three. Page 1 also has the newest post, wide, above its grid. */
const gridSize = 12;

/** The posts page `page` of the index shows, as [start, end) of the newest-first list. */
const pageSpan = (page: number): [number, number] => (page === 1 ? [0, gridSize + 1] : [gridSize + 1 + (page - 2) * gridSize, gridSize + 1 + (page - 1) * gridSize]);

/** A post's page in a design: "/ba/blog/<slug>" while BA has its prefix. */
export const postHref = (design: DesignId, slug: string) => hrefIn(design, `/blog/${slug}`);

/** An index page's URL; page 1 is the index itself. */
export const indexHref = (design: DesignId, page: number) => hrefIn(design, page > 1 ? `/blog?page=${page}` : "/blog");

/** The words of a Portable Text body. */
function words(body: Post["body"]): number {
  let count = 0;
  for (const block of body) {
    if (block._type !== "block" || !("children" in block) || !Array.isArray(block.children)) continue;
    for (const child of block.children) {
      if (typeof child === "object" && child && "text" in child && typeof child.text === "string") count += child.text.split(/\s+/).filter(Boolean).length;
    }
  }
  return count;
}

/** Minutes to read at 220 words a minute, never less than one. */
export const readingMinutes = (body: Post["body"]) => Math.max(1, Math.round(words(body) / 220));

/** "19 August 2024", in Malaysian time. */
const dateFormat = new Intl.DateTimeFormat("en-MY", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kuala_Lumpur" });
export const formatDate = (date: Date) => dateFormat.format(date);

/** The image a post's card shows: its own card image where it has one, else its cover. */
export const cardImage = (post: BlogPost) => post.data.card_image ?? post.data.cover;

const newestFirst = { published_at: "desc" } as const;

export type IndexPage =
  | { kind: "page"; posts: BlogPost[]; page: number; pages: number; total: number }
  | { kind: "out-of-range"; pages: number }
  | { kind: "error" };

/** One page of the index, newest first. */
export async function indexPage(page: number): Promise<IndexPage> {
  const { entries, error } = await getEmDashCollection("posts", { status: "published", orderBy: newestFirst, limit: 1000 });
  if (error) {
    console.error("blog index:", error);
    return { kind: "error" };
  }
  const total = entries.length;
  const pages = 1 + Math.ceil(Math.max(0, total - (gridSize + 1)) / gridSize);
  if (page < 1 || page > pages) return { kind: "out-of-range", pages };
  return { kind: "page", posts: entries.slice(...pageSpan(page)), page, pages, total };
}

export type PostPage =
  | { kind: "post"; post: BlogPost; newer: BlogPost | null; older: BlogPost | null }
  | { kind: "missing" }
  | { kind: "error" };

/** A published post, with the posts either side of it by date. */
export async function postPage(slug: string): Promise<PostPage> {
  const { entry, error } = await getEmDashEntry("posts", slug);
  if (error) {
    console.error(`blog post ${slug}:`, error);
    return { kind: "error" };
  }
  if (!entry || entry.data.status !== "published" || !entry.data.publishedAt) return { kind: "missing" };
  const at = entry.data.publishedAt.toISOString();
  const [newer, older] = await Promise.all([
    getEmDashCollection("posts", { status: "published", where: { published_at: { gt: at } }, orderBy: { published_at: "asc" }, limit: 1 }),
    getEmDashCollection("posts", { status: "published", where: { published_at: { lt: at } }, orderBy: newestFirst, limit: 1 }),
  ]);
  return { kind: "post", post: entry, newer: newer.entries[0] ?? null, older: older.entries[0] ?? null };
}

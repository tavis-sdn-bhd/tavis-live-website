import { getEmDashCollection, type ContentEntry } from "emdash";
import type { Post } from "../../emdash-env";
import { type DesignId, hrefIn } from "@/lib/site";

/** The blog's posts, in the `posts` collection that seed/seed.json defines. */
export type BlogPost = ContentEntry<Post>;

/** Cards in each page's grid: four rows of three. Page 1 also has the newest post, wide, above its grid. */
const gridSize = 12;

/** The posts page `page` of the index shows, as [start, end) of the newest-first list. */
const pageSpan = (page: number): [number, number] => (page === 1 ? [0, gridSize + 1] : [gridSize + 1 + (page - 2) * gridSize, gridSize + 1 + (page - 1) * gridSize]);

/** The slug in a post's address. */
export const postSlug = (post: BlogPost) => post.data.slug ?? post.id;

/** A post's page in a design: "/blog/<slug>". */
export const postHref = (design: DesignId, slug: string) => hrefIn(design, `/blog/${slug}`);

/** An index page's URL; page 1 is the index itself. */
export const indexHref = (design: DesignId, page: number) => hrefIn(design, page > 1 ? `/blog/page/${page}` : "/blog");

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

/** Every published post, newest first. The blog's pages are built from this once, when the site is built (README,
    Blog), so a failed read throws and stops the build, which would otherwise publish a blog without its posts. */
export async function publishedPosts(): Promise<BlogPost[]> {
  const { entries, error } = await getEmDashCollection("posts", { status: "published", orderBy: newestFirst, limit: 1000 });
  if (error) throw new Error("The blog's posts could not be read", { cause: error });
  return entries;
}

export type IndexPage = { posts: BlogPost[]; page: number; pages: number; total: number };

/** How many pages the index has: one even with no posts. */
export const indexPageCount = (total: number) => 1 + Math.ceil(Math.max(0, total - (gridSize + 1)) / gridSize);

/** Page `page` of the index of `posts`. */
export const indexPage = (posts: BlogPost[], page: number): IndexPage => ({ posts: posts.slice(...pageSpan(page)), page, pages: indexPageCount(posts.length), total: posts.length });

export type PostPage = { post: BlogPost; newer: BlogPost | null; older: BlogPost | null };

/** Each post with the posts either side of it by date. */
export const postPages = (posts: BlogPost[]): PostPage[] => posts.map((post, i) => ({ post, newer: posts[i - 1] ?? null, older: posts[i + 1] ?? null }));

// Inventories the blog on the live tavis.live (Webflow) into seed/blog-inventory.json, and downloads every image a
// post shows into seed/blog/media/, so the import (scripts/blog/import.ts) never needs the old site again:
//   node scripts/blog/inventory.ts
//
// The source text is kept as the site serves it. Each body is also parsed into Portable Text here, so the inventory
// can be read and checked before anything is imported; the parser only knows the markup these posts use and stops on
// anything else, rather than dropping it. A field the source does not have stays null and is listed under `missing`.
import { createHash } from "node:crypto";
import { mkdir, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { type BlogBlock, type BlogInventory, type BlogMedia, type BlogSourcePost, inventoryPath, mediaDir, oldPostPath, sourceSite } from "./shared.ts";

const root = path.resolve(import.meta.dirname, "../..");

async function get(url: string): Promise<Response> {
  const response = await fetch(url, { headers: { "User-Agent": "tavis-live-website blog inventory" } });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response;
}

const text = async (url: string) => (await get(url)).text();

async function writeAtomic(file: string, bytes: string | Uint8Array) {
  const tmp = `${file}.${process.pid}.tmp`;
  await writeFile(tmp, bytes);
  await rename(tmp, file);
}

// ── HTML ───────────────────────────────────────────────────────────────

const entities: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decode(html: string): string {
  return html.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, name: string) => {
    if (name[0] === "#") return String.fromCodePoint(name[1] === "x" || name[1] === "X" ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10));
    const named = entities[name.toLowerCase()];
    if (named === undefined) throw new Error(`Unknown entity ${whole}`);
    return named;
  });
}

/** The one match of `pattern` in `html`, or an error naming what was looked for. */
function one(html: string, pattern: RegExp, what: string): RegExpMatchArray {
  const all = [...html.matchAll(new RegExp(pattern.source, `${pattern.flags.replace("g", "")}g`))];
  if (all.length !== 1) throw new Error(`Expected one ${what}, found ${all.length}`);
  return all[0]!;
}

/** A meta tag's content by name or property, in either attribute order Webflow writes; null if the page has none. */
function meta(html: string, key: string): string | null {
  for (const tag of html.match(/<meta\b[^>]*>/g) ?? []) {
    const name = tag.match(/\b(?:name|property)="([^"]*)"/)?.[1];
    if (name !== key) continue;
    const content = tag.match(/\bcontent="([^"]*)"/)?.[1];
    return content === undefined ? null : decode(content);
  }
  return null;
}

/** Inline HTML as plain text: a <br> is a space, tags go, entities decode. */
const plainText = (html: string) => decode(html.replace(/<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();

// ── Body → Portable Text ───────────────────────────────────────────────

type Run = { text: string; strong: boolean; em: boolean; heading: boolean };
type Line = Run[];

/** Webflow's editor leaves zero-width joiners on otherwise empty lines. They are invisible, not copy. */
const zwj = /‍/g;

/** Splits a post's body paragraphs into lines of styled runs. Only the markup these posts use is known: <br>, <strong>,
    <em> and Webflow's `text-span-N` spans, which wrap each section heading. Anything else stops the inventory. */
function lines(paragraphs: string[]): Line[] {
  const out: Line[] = [];
  for (const html of paragraphs) {
    const stack: string[] = [];
    let line: Line = [];
    for (const token of html.matchAll(/<(\/?)([a-z0-9]+)([^>]*?)\/?>|([^<]+)/gi)) {
      const [, closing, tag, attrs, chunk] = token;
      if (chunk !== undefined) {
        const value = decode(chunk).replace(zwj, "");
        if (value) line.push({ text: value, strong: stack.includes("strong"), em: stack.includes("em"), heading: stack.includes("span") });
        continue;
      }
      const name = tag!.toLowerCase();
      if (name === "br") {
        out.push(line);
        line = [];
      } else if (name === "strong" || name === "em" || (name === "span" && (closing || /^\s*class="text-span-\d+"\s*$/.test(attrs!)))) {
        if (closing) {
          if (stack.pop() !== name) throw new Error(`Unbalanced </${name}>`);
        } else stack.push(name);
      } else {
        throw new Error(`Unexpected <${closing}${tag}${attrs}> in a post body`);
      }
    }
    if (stack.length) throw new Error(`Unclosed <${stack.join("><")}> in a post body`);
    out.push(line);
    // Two paragraphs are two blocks, as a blank line would make them.
    out.push([]);
  }
  return out;
}

const isBlank = (line: Line) => line.every((run) => !run.text.trim());

/** A heading is a line whose words are all inside a heading span, or (as one post writes them) all bold. */
const isHeading = (line: Line) => {
  const words = line.filter((run) => run.text.trim());
  return words.length > 0 && (words.every((run) => run.heading) || words.every((run) => run.strong));
};

function toBlocks(source: Line[]): BlogBlock[] {
  const blocks: BlogBlock[] = [];
  let paragraph: Line[] = [];

  const push = (style: BlogBlock["style"], runs: Run[]) => {
    const b = blocks.length;
    // Merge neighbouring runs that carry the same marks; a heading is bold by its style, so its runs drop `strong`.
    const merged: Array<{ text: string; marks: string[] }> = [];
    for (const run of runs) {
      const marks = [...(run.strong && style === "normal" ? ["strong"] : []), ...(run.em ? ["em"] : [])];
      const last = merged.at(-1);
      if (last && last.marks.join() === marks.join()) last.text += run.text;
      else merged.push({ text: run.text, marks });
    }
    // Trim the block's outer whitespace only; the words and their spacing stay as written.
    merged[0]!.text = merged[0]!.text.trimStart();
    merged.at(-1)!.text = merged.at(-1)!.text.trimEnd();
    const children = merged.filter((span) => span.text).map((span, s) => ({ _type: "span" as const, _key: `b${b}s${s}`, text: span.text, marks: span.marks }));
    blocks.push({ _type: "block", _key: `b${b}`, style, markDefs: [], children });
  };

  const flush = () => {
    if (!paragraph.length) return;
    // Lines inside one paragraph keep their break, as a newline Portable Text renders as <br>.
    push("normal", paragraph.flatMap((line, i) => (i ? [{ text: "\n", strong: false, em: false, heading: false }, ...line] : line)));
    paragraph = [];
  };

  for (const line of source) {
    if (isBlank(line)) flush();
    else if (isHeading(line)) {
      flush();
      push("h2", line);
    } else paragraph.push(line);
  }
  flush();
  return blocks;
}

/** The words a reader sees, for comparing the source with the parsed body and, later, with the rendered page. */
const words = (value: string) => value.replace(zwj, "").replace(/\s+/g, " ").trim();
const blockText = (blocks: BlogBlock[]) => words(blocks.map((block) => block.children.map((span) => span.text).join("")).join(" "));

// ── Media ──────────────────────────────────────────────────────────────

/** Downloads an image once per inventory run, keyed by its Webflow asset id, and records what the import needs. */
async function download(url: string, alt: string, seen: Map<string, BlogMedia>): Promise<BlogMedia> {
  const cached = seen.get(url);
  if (cached) return cached;
  const name = decodeURIComponent(new URL(url).pathname.split("/").pop()!);
  const match = name.match(/^([0-9a-f]{24})_(.+)$/);
  if (!match) throw new Error(`Unexpected Webflow asset name ${name}`);
  const [, assetId, filename] = match;
  const bytes = new Uint8Array(await (await get(url)).arrayBuffer());
  const { width, height, format } = await sharp(bytes).metadata();
  if (!width || !height || !format) throw new Error(`${url}: not an image`);
  const file = `${assetId}.${format === "jpeg" ? "jpg" : format}`;
  await writeAtomic(path.join(root, mediaDir, file), bytes);
  const media: BlogMedia = {
    sourceUrl: url,
    file,
    filename: filename!,
    alt: alt || null,
    width,
    height,
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
  seen.set(url, media);
  return media;
}

// ── The blog ───────────────────────────────────────────────────────────

type IndexCard = { slug: string; title: string; excerpt: string; image: string; imageAlt: string };

async function main() {
  const sitemap = await text(`${sourceSite}/sitemap.xml`);
  const lastmod = new Map<string, string>();
  for (const [, slug, date] of sitemap.matchAll(/<loc>https:\/\/www\.tavis\.live\/tavis-blog\/([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)) lastmod.set(slug!, date!);

  const index = await text(`${sourceSite}/blog`);
  if (/_page=\d/.test(index)) throw new Error("The blog index is paginated now; follow its pages");
  const cards: IndexCard[] = [...index.matchAll(/<h1 class="heading-88">([\s\S]*?)<\/h1><p class="margin-bottom-24px">([\s\S]*?)<\/p><a href="\/tavis-blog\/([^"]+)"[^>]*>[\s\S]*?<img src="([^"]+)"[^>]*?alt="([^"]*)"/g)].map(
    ([, title, excerpt, slug, image, imageAlt]) => ({ slug: slug!, title: plainText(title!), excerpt: decode(excerpt!).trim(), image: image!, imageAlt: decode(imageAlt!) }),
  );
  const linked = new Set([...index.matchAll(/href="\/tavis-blog\/([^"]+)"/g)].map((m) => m[1]!));
  if (linked.size !== cards.length) throw new Error(`The index links ${linked.size} posts but ${cards.length} cards were read`);

  const slugs = [...new Set([...lastmod.keys(), ...linked])];
  const onlyInSitemap = slugs.filter((slug) => !linked.has(slug));
  const onlyInIndex = slugs.filter((slug) => !lastmod.has(slug));

  await rm(path.join(root, mediaDir), { recursive: true, force: true });
  await mkdir(path.join(root, mediaDir), { recursive: true });
  const seen = new Map<string, BlogMedia>();
  const posts: BlogSourcePost[] = [];

  for (const slug of slugs) {
    const url = `${sourceSite}${oldPostPath(slug)}`;
    const html = await text(url);
    const card = cards.find((c) => c.slug === slug) ?? null;

    const h1 = one(html, /<h1 class="centered-heading-2[^"]*">([\s\S]*?)<\/h1>/, `title on ${slug}`)[1]!;
    const hero = one(html, /<div class="hero-split"><img src="([^"]+)"[^>]*?alt="([^"]*)"/, `cover image on ${slug}`);
    const section = one(html, /<section class="hero-heading-center">([\s\S]*?)<\/section>/, `article on ${slug}`)[1]!;
    const paragraphs = [...section.matchAll(/<p class="paragraph-\d+">([\s\S]*?)<\/p>/g)].map((m) => m[1]!);
    if (!paragraphs.length) throw new Error(`No body on ${slug}`);
    // Anything in the article besides the title, the cover and the body paragraphs would be lost; there is none today.
    const rest = section
      .replace(/<a href="\/blog" class="link-8">HOME<\/a>/, "")
      .replace(/<h1 [\s\S]*?<\/h1>/, "")
      .replace(/<img [^>]*>/, "")
      .replace(/<p class="paragraph-\d+">[\s\S]*?<\/p>/g, "")
      .replace(/<\/?div[^>]*>/g, "");
    if (rest.trim()) throw new Error(`Unread markup in the article on ${slug}: ${rest.trim().slice(0, 120)}`);
    if ((section.match(/<img /g) ?? []).length !== 1) throw new Error(`${slug} has inline images; read them`);

    const body = toBlocks(lines(paragraphs));
    const sourceWords = words(plainText(paragraphs.join(" ")));
    if (blockText(body) !== sourceWords) throw new Error(`The parsed body of ${slug} lost or changed words`);

    const pageId = one(html, /data-wf-page="([0-9a-f]{24})"/, `page id on ${slug}`)[1]!;
    const cover = await download(hero[1]!, decode(hero[2]!), seen);
    const listing = card && card.image !== hero[1] ? await download(card.image, card.imageAlt, seen) : null;
    const wordCount = sourceWords.split(" ").length;

    posts.push({
      slug,
      sourceUrl: url,
      indexPosition: card ? cards.indexOf(card) : null,
      title: plainText(h1),
      htmlTitle: decode(one(html, /<title>([\s\S]*?)<\/title>/, `<title> on ${slug}`)[1]!),
      indexTitle: card?.title ?? null,
      excerpt: card?.excerpt ?? null,
      metaDescription: meta(html, "description"),
      ogTitle: meta(html, "og:title"),
      ogDescription: meta(html, "og:description"),
      ogImage: meta(html, "og:image"),
      author: null,
      publishedAt: null,
      derived: {
        pageCreatedAt: new Date(parseInt(pageId.slice(0, 8), 16) * 1000).toISOString(),
        webflowPageId: pageId,
        sitemapLastmod: lastmod.get(slug) ?? null,
      },
      cover,
      listingImage: listing,
      inlineImages: [],
      wordCount,
      bodyHtml: paragraphs,
      body,
    });
    console.log(`${posts.length}/${slugs.length} ${slug}: ${body.length} blocks, ${wordCount} words`);
  }

  // Newest first, as the index lists them.
  posts.sort((a, b) => (a.indexPosition ?? Infinity) - (b.indexPosition ?? Infinity));
  const missing = (has: (post: BlogSourcePost) => boolean) => posts.filter((post) => !has(post)).map((post) => post.slug);
  const inventory: BlogInventory = {
    source: {
      site: sourceSite,
      index: `${sourceSite}/blog`,
      sitemap: `${sourceSite}/sitemap.xml`,
      fetchedAt: new Date().toISOString(),
      postsInSitemap: lastmod.size,
      postsOnIndex: cards.length,
      onlyInSitemap,
      onlyInIndex,
      paginated: false,
      taxonomies: "none: the source has no categories or tags",
    },
    missing: {
      author: missing((post) => post.author !== null),
      publishedAt: missing((post) => post.publishedAt !== null),
      ogImage: missing((post) => post.ogImage !== null),
      coverAlt: missing((post) => post.cover.alt !== null),
      excerpt: missing((post) => post.excerpt !== null),
      metaDescription: missing((post) => post.metaDescription !== null),
    },
    notes: [
      "No post shows a date or an author. derived.pageCreatedAt is the creation time encoded in each page's Webflow id (an ObjectId); it follows the index's order exactly and is never later than the sitemap's lastmod. The import uses it as the published date.",
      "Bodies are one or two <p> elements with <br> line breaks. Lines wrapped in Webflow's text-span-N spans (or, in one post, wholly bold) are section headings; they become h2 blocks. No post has lists, links, quotes or inline images.",
      "Zero-width joiners Webflow's editor leaves on empty lines are dropped; nothing else in the text is changed.",
      "title is the post page's own heading. htmlTitle is its <title>, indexTitle the card's heading on /blog; they differ only in line breaks and, for one post, a question mark.",
      "listingImage is set only where the /blog card shows a different picture from the post's cover.",
    ],
    posts,
  };
  await writeAtomic(path.join(root, inventoryPath), `${JSON.stringify(inventory, null, 2)}\n`);

  const files = await readdir(path.join(root, mediaDir));
  console.log(`\n${posts.length} posts (sitemap ${lastmod.size}, index ${cards.length}), ${files.length} images in ${mediaDir}`);
  for (const [field, slugsMissing] of Object.entries(inventory.missing)) if (slugsMissing.length) console.log(`missing ${field}: ${slugsMissing.length} posts`);
}

await main();

// Imports seed/blog-inventory.json into a running EmDash site, through its own REST API: each image goes to the media
// library (EmDash stores it in the site's R2 bucket, or the local one under `pnpm dev`), and each post is created or
// brought up to date in the `posts` collection, matched by slug. Rerunning changes nothing that is already current:
// EmDash recognises an image it already holds by its content hash, and a post that already matches is left alone.
//
//   node scripts/blog/import.ts                       the dev server at http://localhost:4321
//   node scripts/blog/import.ts --url http://localhost:4330
//   EMDASH_TOKEN=… node scripts/blog/import.ts --url https://www.tavis.live
//
// Locally it signs in through EmDash's dev bypass. Elsewhere it needs an API token with content and media write
// access, made in the admin under Settings › API tokens, passed as EMDASH_TOKEN.
//
// The `posts` collection itself is defined in seed/seed.json; `pnpm cms:schema` applies it to a site that lacks it.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { api, base, dryRun, signIn } from "../emdash-api.ts";
import { type BlogInventory, type BlogMedia, type BlogSourcePost, inventoryPath, mediaDir } from "./shared.ts";

const root = path.resolve(import.meta.dirname, "../..");
const collection = "posts";

// ── Media ──────────────────────────────────────────────────────────────

type MediaItem = { id: string; filename: string; mimeType: string; width: number | null; height: number | null; storageKey: string; blurhash?: string | null; dominantColor?: string | null };

/** The image field value EmDash's own seed writes for an uploaded image. */
type MediaValue = {
  provider: "local";
  id: string;
  filename: string;
  mimeType: string;
  width: number;
  height: number;
  blurhash?: string;
  dominantColor?: string;
  meta: { storageKey: string };
};

const uploaded = new Map<string, MediaValue>();
let mediaCreated = 0;
let mediaReused = 0;

async function upload(media: BlogMedia): Promise<MediaValue> {
  const done = uploaded.get(media.sha256);
  if (done) return done;
  const bytes = await readFile(path.join(root, mediaDir, media.file));
  const form = new FormData();
  form.append("file", new File([bytes], media.filename, { type: media.file.endsWith(".png") ? "image/png" : "image/webp" }));
  form.append("width", String(media.width));
  form.append("height", String(media.height));
  if (media.alt) form.append("alt", media.alt);
  if (dryRun) return { provider: "local", id: `dry-run-${media.sha256.slice(0, 8)}`, filename: media.filename, mimeType: "", width: media.width, height: media.height, meta: { storageKey: "" } };
  const result = await api<{ item: MediaItem; deduplicated?: boolean }>("POST", "/media", form);
  const item = result!.item;
  if (result!.deduplicated) mediaReused++;
  else mediaCreated++;
  const value: MediaValue = {
    provider: "local",
    id: item.id,
    filename: item.filename,
    mimeType: item.mimeType,
    width: item.width ?? media.width,
    height: item.height ?? media.height,
    ...(item.blurhash && { blurhash: item.blurhash }),
    ...(item.dominantColor && { dominantColor: item.dominantColor }),
    meta: { storageKey: item.storageKey },
  };
  uploaded.set(media.sha256, value);
  return value;
}

// ── Posts ──────────────────────────────────────────────────────────────

type ContentItem = { id: string; slug: string; status: string; publishedAt: string | null; data: Record<string, unknown>; seo?: { description?: string | null } | null };

/** What the import writes for a post, from its inventory record. */
async function entryFor(post: BlogSourcePost) {
  return {
    slug: post.slug,
    // No post shows a date; the inventory's derived page creation time stands in for it (see its notes).
    publishedAt: post.derived.pageCreatedAt,
    data: {
      title: post.title,
      excerpt: post.excerpt,
      cover: await upload(post.cover),
      card_image: post.listingImage ? await upload(post.listingImage) : null,
      body: post.body,
    },
    seo: { description: post.metaDescription },
  };
}

type Entry = Awaited<ReturnType<typeof entryFor>>;

/** Whether the site already holds exactly this post. Image fields compare by media id. */
function current(item: ContentItem, entry: Entry): boolean {
  const pick = (data: Record<string, unknown>) =>
    JSON.stringify({
      title: data.title,
      excerpt: data.excerpt ?? null,
      cover: (data.cover as { id?: string } | null)?.id ?? null,
      card_image: (data.card_image as { id?: string } | null)?.id ?? null,
      body: data.body,
    });
  return (
    item.status === "published" &&
    item.publishedAt !== null &&
    new Date(item.publishedAt).getTime() === new Date(entry.publishedAt).getTime() &&
    (item.seo?.description ?? null) === entry.seo.description &&
    pick(item.data) === pick(entry.data)
  );
}

async function main() {
  const inventory = JSON.parse(await readFile(path.join(root, inventoryPath), "utf8")) as BlogInventory;
  console.log(`${inventory.posts.length} posts in ${inventoryPath}, importing into ${base.origin}${dryRun ? " (dry run)" : ""}`);
  await signIn();

  const schema = await api<{ items: Array<{ slug: string }> }>("GET", "/schema/collections");
  if (!schema?.items.some((item) => item.slug === collection)) {
    throw new Error(`${base.origin} has no \`${collection}\` collection. Run \`pnpm cms:schema\` against it first.`);
  }

  const counts = { created: 0, updated: 0, unchanged: 0 };
  for (const post of inventory.posts) {
    const entry = await entryFor(post);
    const existing = await api<{ item: ContentItem }>("GET", `/content/${collection}/${encodeURIComponent(post.slug)}`);
    let outcome: keyof typeof counts;
    if (existing && current(existing.item, entry)) {
      outcome = "unchanged";
    } else {
      outcome = existing ? "updated" : "created";
      if (!dryRun) {
        // The collection keeps drafts, so a write lands as a draft until it is published.
        const id = existing
          ? (await api<{ item: ContentItem }>("PUT", `/content/${collection}/${existing.item.id}`, { ...entry, overrideLock: true }))!.item.id
          : (await api<{ item: ContentItem }>("POST", `/content/${collection}`, entry))!.item.id;
        await api("POST", `/content/${collection}/${id}/publish`);
      }
    }
    counts[outcome]++;
    console.log(`${outcome.padEnd(9)} ${post.slug}`);
  }

  const listed = dryRun ? null : await api<{ total: number }>("GET", `/content/${collection}?status=published&limit=1`);
  console.log(
    `\nPosts: ${counts.created} created, ${counts.updated} updated, ${counts.unchanged} unchanged. ` +
      `Images: ${mediaCreated} uploaded, ${mediaReused} already in the library.` +
      (listed ? ` The site now has ${listed.total} published posts.` : ""),
  );
}

await main();

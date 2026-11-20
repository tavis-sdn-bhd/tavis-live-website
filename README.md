# Tavis website

The marketing website for [Tavis](https://tavis.live): free practice and online tuition for Form 1–5 students in Malaysia.

Built by [Cynco](https://cynco.io). The repository moves to Tavis at handover.

## Stack

- [Astro](https://astro.build) renders the pages on a Cloudflare Worker.
- [EmDash](https://emdashcms.com) 1.5 is the CMS. Its admin is at `/_emdash/admin`, with content in D1 and media in R2.
- React runs the interactive parts as Astro islands.
- Tailwind CSS 4 provides the design tokens, in `src/styles/globals.css`.

## Status

Design BA is ported from the proposal site and served at `/ba`. The root redirects there until the client chooses a design (`public/_redirects`). Every page sends `noindex` until launch.

BA's pages, `/get` and the 404 page are pre-rendered (`export const prerender = true`): built once at deploy and served as static files, so they never wake the Worker and cost no CPU. Their copy only changes with a deploy, as it already did. The Worker renders only what has to be live: the blog, EmDash's admin and API, and the contact form's submissions. On Workers' free plan a Worker request may use 10 ms of CPU and EmDash's start-up alone takes more, so those routes can fail there; the paid plan lifts the limit.

`/get` is the footer QR code's target. Phones are redirected to their app store, and other devices see the store badges.

Any unknown path returns a 404 page in BA's style, with a link to every page.

Page copy still lives in `src/lib/content.ts` and `src/lib/pages.ts`. It moves into EmDash collections next.

## Develop

```bash
pnpm install
pnpm dev
```

`pnpm dev` and `pnpm build` first run two generators. Neither runs on the Worker, and both skip files that are already up to date:

- `scripts/image-variants.mjs` writes WebP width variants of `public/assets` to `public/variants`, plus the manifest that `src/components/image.tsx` reads.
- `scripts/og-cards.tsx` renders each page's Open Graph card to `public/og/ba/<page>.png` with Satori and resvg. The cards are listed in `src/og/cards.ts`, and the renderer is `scripts/og/card.tsx`.

The first visit to `/_emdash/admin` runs EmDash's setup. Locally, the dev server prints a bypass link that signs you in as an admin without a passkey.

## Layout

| Path | What |
|---|---|
| `src/pages/ba/` | One Astro route per BA page |
| `src/layouts/Ba.astro` | The `<head>`, and BA's header, footer and WhatsApp button as islands |
| `src/views/ba/` | Each page's body, a React island; the blog's views are Astro components in `src/views/ba/blog/` |
| `src/lib/blog.ts` | The blog's queries, paths, dates and reading time |
| `scripts/blog/` | The blog's inventory, import and check |
| `seed/` | EmDash's seed, the blog inventory and the posts' original images |
| `src/components/` | The React components the pages share |
| `src/lib/site.ts` | Pages, titles, and the prefix each design lives under |
| `src/og/cards.ts` | Each page's Open Graph card: its words and its art |
| `src/middleware.ts` | Contact form rate limits and checks, security and `noindex` headers |
| `public/_headers`, `public/_redirects` | The same headers for static files and pre-rendered pages, and the root redirect, applied by Cloudflare before the Worker |

When a design is chosen, set its prefix in `src/lib/site.ts` to `""`, move its routes to `src/pages/`, and drop the root redirect (`public/_redirects`) and the `noindex` header (`src/middleware.ts` and `public/_headers`).

## Blog

The blog is at `/ba/blog`, a post at `/ba/blog/<slug>`. Posts live in EmDash's `posts` collection, which `seed/seed.json` defines; EmDash applies it at setup. The index and post pages read the collection on the server and send no script of their own.

The 56 posts from the old tavis.live (Webflow) were brought over in three steps, each a script you can rerun:

1. `pnpm blog:inventory` reads tavis.live's sitemap, `/blog` and every post, and writes `seed/blog-inventory.json`: each post's text as served, its body as Portable Text, its SEO fields, and what the source lacks. It downloads every image a post shows into `seed/blog/media/`, so nothing later needs the old site. It stops on markup it does not know rather than drop it.
2. `pnpm blog:import [--url <site>]` uploads the images to EmDash's media library and creates or updates each post, matched by slug, then publishes it. A rerun changes nothing that is current: EmDash knows an image it already holds by its hash, and an unchanged post is skipped. Locally it signs in through the dev bypass; anywhere else it needs `EMDASH_TOKEN`. The inventory wins: a rerun puts back any imported post edited in the admin since, so once posts are edited there, stop rerunning it.
3. `pnpm blog:verify [--url <site>]` checks every inventoried post on a running site: listed on the index, its old URL redirecting to it, its title and whole body word for word, its cover image, and every link on those pages.

No post on tavis.live shows a date or an author. The date each post shows is the creation time in its Webflow page id, which follows the old index's order; `seed/blog-inventory.json` lists that and everything else missing at the source.

Old links keep working: `/tavis-blog/<slug>` redirects to the post and `/blog` to the index (`src/pages/tavis-blog/`, `src/pages/blog.astro`). The post redirect is a 302 while the design waits under `/ba`, and becomes a 301 by itself once the prefix is `""`.

At launch, besides the steps under Status: delete `src/pages/blog.astro` (the blog's own route takes `/blog`), and in the admin change the collection's URL pattern from `/ba/blog/{slug}` to `/blog/{slug}`.

### Importing into production

R2 must be enabled on the Cloudflare account and the `tavis-live-media` bucket created before EmDash can store the images. Then:

1. Check the `IMAGES` (Cloudflare Images) binding the adapter adds: the blog's responsive images are resized through it, and without it every phone gets the full-size originals. Deploy and run setup at `/_emdash/admin`. Setup applies `seed/seed.json`, which creates the `posts` collection.
2. As an admin, create an API token under Settings › API tokens with the scopes `content:read`, `content:write`, `media:read`, `media:write` and `schema:read`. Writing a post's date needs an admin's or editor's token.
3. Run the import against the deployed site, then the check:

```bash
EMDASH_TOKEN=… pnpm blog:import --url https://<deployed host>
```

```bash
pnpm blog:verify --url https://<deployed host>
```

## Contact form

The footer form posts to EmDash's forms plugin. Submissions appear in the admin under **Forms › Submissions**. After setup, create the form once in the admin:

- Slug: `contact`
- Fields: `name` (text, required), `email` (email, required), `phone` (tel), `message` (textarea, required), `page` (hidden)
- Spam protection: honeypot

Add the addresses that should hear about new messages under the form's notification settings.

Before a submission reaches the plugin, `src/middleware.ts` applies two Cloudflare rate limits from `cloudflare.config.ts`: 3 a minute per visitor and 20 a minute across the site. It also checks the contact form's fields against the limits in `src/lib/enquiry.ts`, which the form's inputs use too.

## Deploy

Deploys run through Cloudflare's `cf` CLI, configured by `cloudflare.config.ts`, which pins the Tavis-owned account (`Admin@tavis.live`). `cf` must be signed in to it: `cf auth whoami`. The Astro adapter (15, which builds with Cloudflare's Vite plugin v2) writes the Worker to `.cloudflare/output`, and `pnpm run deploy` builds and then uploads it with `cf deploy --prebuilt`. `pnpm types` regenerates the bindings' types in `.cloudflare/types`; `pnpm typecheck` runs it first. Locally, `pnpm dev` keeps D1 and R2 in `.cloudflare/state`.

Before the first deploy, turn on R2 for the account in the dashboard, then create the database and bucket the config names:

```bash
cf d1 create --name tavis-live-website
```

```bash
cf r2 buckets create --name tavis-live-media
```

```bash
pnpm run deploy
```

The adapter also binds `SESSION` (KV) and `IMAGES` (Cloudflare Images); `cf deploy --prebuilt --dry-run` lists every binding the Worker will get. The site is served on `*.workers.dev` until `tavis.live` moves to that account.

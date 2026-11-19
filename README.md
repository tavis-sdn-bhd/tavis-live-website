# Tavis website

The marketing website for [Tavis](https://tavis.live): free practice and online tuition for Form 1–5 students in Malaysia.

Built by [Cynco](https://cynco.io). The repository moves to Tavis at handover.

## Stack

- [Astro](https://astro.build) renders the pages on a Cloudflare Worker.
- [EmDash](https://emdashcms.com) 1.5 is the CMS. Its admin is at `/_emdash/admin`, with content in D1 and media in R2.
- React runs the interactive parts as Astro islands.
- Tailwind CSS 4 provides the design tokens, in `src/styles/globals.css`.

## Status

Design BA is ported from the proposal site and served at `/ba`. The root redirects there until the client chooses a design. Every page sends `noindex` until launch.

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
| `src/views/ba/` | Each page's body, a React island |
| `src/components/` | The React components the pages share |
| `src/lib/site.ts` | Pages, titles, and the prefix each design lives under |
| `src/og/cards.ts` | Each page's Open Graph card: its words and its art |
| `src/middleware.ts` | Contact form rate limits and checks, security and `noindex` headers |

When a design is chosen, set its prefix in `src/lib/site.ts` to `""`, move its routes to `src/pages/`, and drop the root redirect and the `noindex` header.

## Contact form

The footer form posts to EmDash's forms plugin. Submissions appear in the admin under **Forms › Submissions**. After setup, create the form once in the admin:

- Slug: `contact`
- Fields: `name` (text, required), `email` (email, required), `phone` (tel), `message` (textarea, required), `page` (hidden)
- Spam protection: honeypot

Add the addresses that should hear about new messages under the form's notification settings.

Before a submission reaches the plugin, `src/middleware.ts` applies two Cloudflare rate limits from `wrangler.jsonc`: 3 a minute per visitor and 20 a minute across the site. It also checks the contact form's fields against the limits in `src/lib/enquiry.ts`, which the form's inputs use too.

## Deploy

Deploy from a Cloudflare account Tavis owns. Before the first deploy, create the database and bucket that `wrangler.jsonc` names, then add the database's `database_id` to `wrangler.jsonc`:

```bash
pnpm exec wrangler d1 create tavis-live-website
```

```bash
pnpm exec wrangler r2 bucket create tavis-live-media
```

```bash
pnpm deploy
```

The Astro Cloudflare adapter also binds `SESSION` (KV) and `IMAGES` (Cloudflare Images), which `wrangler.jsonc` doesn't list. Check them on the first deploy. The site is served on `*.workers.dev` until `tavis.live` moves to that account.

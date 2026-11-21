import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { formsPlugin } from "@emdash-cms/plugin-forms";
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";

export default defineConfig({
  site: "https://www.tavis.live",
  output: "server",
  // Pre-rendered pages are written as /rewards.html, so Cloudflare serves /rewards directly, without a
  // trailing-slash redirect.
  build: { format: "file" },
  // `astro build` pre-renders the blog from the deployed database (cloudflare.config.ts marks DB remote). Dev and
  // preview stay on the local one, so nothing done in a local admin reaches production.
  adapter: cloudflare({ remoteBindings: process.argv.includes("build") }),
  integrations: [
    react(),
    emdash({
      database: d1({ binding: "DB", session: "auto", coalesce: true }),
      storage: r2({ binding: "MEDIA" }),
      plugins: [formsPlugin({ defaultSpamProtection: "honeypot" })],
    }),
  ],
  // No image.domains yet, so the blog's images are served as uploaded. EmDash resizes a media-library image only on a
  // host listed there, and for a pre-rendered page the build does the resizing, fetching each original from
  // www.tavis.live. Until that address serves this Worker the fetch fails, so the host goes in at launch (README, Launch).
  vite: { plugins: [tailwindcss()] },
  devToolbar: { enabled: false },
});

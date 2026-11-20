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
  // Pre-rendered pages are written as /ba/rewards.html, so Cloudflare serves /ba/rewards directly, without a
  // trailing-slash redirect.
  build: { format: "file" },
  adapter: cloudflare(),
  integrations: [
    react(),
    emdash({
      database: d1({ binding: "DB", session: "auto", coalesce: true }),
      storage: r2({ binding: "MEDIA" }),
      plugins: [formsPlugin({ defaultSpamProtection: "honeypot" })],
    }),
  ],
  // EmDash builds srcsets for media-library images (the blog's) through Astro's image service, which only resizes URLs on
  // hosts listed here; anything else is served at full size. localhost covers `astro preview`. A preview on
  // workers.dev serves full-size images unless its host is added.
  image: { domains: ["www.tavis.live", "tavis.live", "localhost"] },
  vite: { plugins: [tailwindcss()] },
  devToolbar: { enabled: false },
});

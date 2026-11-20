// Renders every page's Open Graph card to public/og with Satori and resvg: English from src/og/cards.ts into og/ba,
// Malay from its twin src/ms/og/cards.ts (scripts/i18n/generate.ts, run first) into og/ms.
// Runs before dev and build, in Node: the Worker only serves the files. A card whose bytes are unchanged
// is not rewritten, and files no card produces any more are deleted.
import { mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PagePath } from "@/lib/site";
import { renderOgCard } from "./og/card";
import * as english from "@/og/cards";
import * as malay from "@/ms/og/cards";

const root = path.resolve(import.meta.dirname, "..");

async function renderAll({ ogCards, ogImagePath }: typeof english) {
  const pathsOf = Object.keys(ogCards) as PagePath[];
  const keep = new Set(pathsOf.map((page) => path.join(root, "public", ogImagePath(page))));
  const results = await Promise.all(
    pathsOf.map(async (page) => {
      const file = path.join(root, "public", ogImagePath(page));
      const bytes = await renderOgCard(ogCards[page]);
      const current = await readFile(file).catch(() => null);
      if (current && Buffer.compare(current, bytes) === 0) return false;
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(`${file}.tmp`, bytes);
      await rename(`${file}.tmp`, file);
      return true;
    }),
  );
  const written = results.filter(Boolean).length;

  const dir = path.dirname(path.join(root, "public", ogImagePath("/")));
  const stale = (await readdir(dir)).map((f) => path.join(dir, f)).filter((f) => !keep.has(f) && !f.endsWith(".tmp"));
  await Promise.all(stale.map((f) => rm(f)));

  console.log(`og-cards: ${path.relative(root, dir)}: ${pathsOf.length} cards, ${written} written` + (stale.length ? `, removed ${stale.length} stale` : ""));
}

for (const cards of [english, malay]) await renderAll(cards);

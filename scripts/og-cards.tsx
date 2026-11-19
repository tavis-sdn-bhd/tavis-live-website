// Renders every page's Open Graph card (src/og/cards.ts) to public/og/ba/<page>.png with Satori and resvg.
// Runs before dev and build, in Node: the Worker only serves the files. A card whose bytes are unchanged
// is not rewritten, and files no card produces any more are deleted.
import { mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PagePath } from "@/lib/site";
import { renderOgCard } from "./og/card";
import { ogCards, ogImagePath } from "@/og/cards";

const root = path.resolve(import.meta.dirname, "..");
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

console.log(`og-cards: ${pathsOf.length} cards, ${written} written` + (stale.length ? `, removed ${stale.length} stale` : ""));

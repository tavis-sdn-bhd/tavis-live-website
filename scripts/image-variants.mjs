// Writes WebP width variants of every raster in public/assets to public/variants, plus the manifest
// src/components/image.tsx reads. The widths come from src/lib/image-ladder.ts, so the srcsets
// Image builds and the files on disk come from one list.
//
// A variant's name carries a hash of its source and encoder settings: an existing file is already
// correct, a changed source gets new URLs, and files no source produces any more are deleted.
// Reruns converge on the same tree and write nothing when nothing changed.
import { createHash } from "node:crypto";
import { access, mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { imageLadder as ladder } from "../src/lib/image-ladder.ts";

const root = path.resolve(import.meta.dirname, "..");
const sourceDir = path.join(root, "public/assets");
const variantDir = path.join(root, "public/variants");
const manifestPath = path.join(root, "src/lib/image-variants.json");
const raster = /\.(png|jpe?g|webp|avif)$/i;
const webp = { quality: 80, alphaQuality: 90, effort: 6, smartSubsample: true };


async function writeAtomic(file, bytes) {
  const tmp = `${file}.${process.pid}.tmp`;
  await writeFile(tmp, bytes);
  await rename(tmp, file);
}

const exists = (file) =>
  access(file).then(
    () => true,
    () => false,
  );

/** Encodes one source; returns its manifest entry and the variant file names it owns. */
async function processSource(name) {
  const input = await readFile(path.join(sourceDir, name));
  const { width } = await sharp(input).metadata();
  const hash = createHash("sha256")
    .update(input)
    .update(JSON.stringify({ webp, libwebp: sharp.versions.webp }))
    .digest("hex")
    .slice(0, 8);
  const stem = `${path.parse(name).name}.${hash}`;
  const widths = ladder.filter((w) => w < width);
  const files = [];

  for (const w of [...widths, width]) {
    const file = `${stem}-${w}.webp`;
    files.push(file);
    const target = path.join(variantDir, file);
    if (await exists(target)) continue;
    let bytes = await sharp(input).resize({ width: w }).webp(webp).toBuffer();
    // At full size a WebP source may already be smaller than its re-encode; serve its own bytes then.
    if (w === width && /\.webp$/i.test(name) && input.length <= bytes.length) bytes = input;
    await writeAtomic(target, bytes);
  }

  return { src: `/assets/${name}`, entry: { base: `/variants/${stem}`, widths, full: width }, files };
}

await mkdir(variantDir, { recursive: true });
const sources = (await readdir(sourceDir)).filter((f) => raster.test(f)).sort();
const results = await Promise.all(sources.map(processSource));

const keep = new Set(results.flatMap((r) => r.files));
// Leave *.tmp alone: they are another run's writes in flight (predev and pretypecheck can overlap).
const stale = (await readdir(variantDir)).filter((f) => !keep.has(f) && !f.endsWith(".tmp"));
await Promise.all(stale.map((f) => rm(path.join(variantDir, f))));

const manifest = JSON.stringify(Object.fromEntries(results.map((r) => [r.src, r.entry])), null, 2) + "\n";
const current = await readFile(manifestPath, "utf8").catch(() => "");
if (current !== manifest) await writeAtomic(manifestPath, manifest);

console.log(
  `image-variants: ${sources.length} sources, ${keep.size} variants` +
    (stale.length ? `, removed ${stale.length} stale` : "") +
    (current !== manifest ? ", manifest updated" : ""),
);

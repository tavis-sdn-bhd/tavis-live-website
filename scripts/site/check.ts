// Checks every page of a running site, before the domain points at it and again after:
//   node --import tsx scripts/site/check.ts --url https://www.tavis.live
// It reads the sitemaps and follows every link from the home page, then checks, for each page it finds: that every
// link, image, script, stylesheet and font answers 200 and every #anchor exists; its title, description, canonical
// address and share image; and its language. It also tries each rule in public/_redirects, addresses that should be
// the 404 page, and the pages as the link-preview and search crawlers ask for them.
// The pages name themselves by the launch address (src/lib/site.ts `siteUrl`). Those addresses are checked on the
// site being tested, and a share image is also fetched as written, since a messaging app asks for exactly that.
// Exits 1 on any failure. A host or a note is a fact to read, not a failure.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { siteUrl } from "../../src/lib/site.ts";
import { decode } from "../html.ts";

const root = path.resolve(import.meta.dirname, "../..");
const { values: args } = parseArgs({ options: { url: { type: "string" } } });
const base = new URL(args.url ?? "http://localhost:4321");
/** The address the pages name themselves by. */
const launch = new URL(siteUrl);

/* ── Findings ─────────────────────────────────────────────────────────────
   "host": named on the launch address, which doesn't serve it (yet). "unverified": an outside site refused the
   check, as many do to scripts. */

type Kind = "fail" | "host" | "unverified" | "note";
const findings = new Map<string, { kind: Kind; where: Set<string> }>();
function report(kind: Kind, message: string, where: string) {
  const finding = findings.get(message) ?? { kind, where: new Set<string>() };
  finding.where.add(where);
  findings.set(message, finding);
}

/* ── Fetching ─────────────────────────────────────────────────────────────
   Each address is fetched once, redirects followed by hand so the chain is known. EmDash's media files wake the
   Worker, so they go two at a time. */

type Got = { status: number; type: string; headers: Headers; body: Buffer; hops: { status: number; to: URL }[]; final: URL; error: string | null };

function limiter(max: number) {
  let active = 0;
  const waiting: (() => void)[] = [];
  return async <T>(task: () => Promise<T>): Promise<T> => {
    if (active >= max) await new Promise<void>((resolve) => waiting.push(resolve));
    active++;
    try {
      return await task();
    } finally {
      active--;
      waiting.shift()?.();
    }
  };
}
const gates = { pages: limiter(6), media: limiter(2), outside: limiter(4) };
const gateFor = (url: URL) => (url.origin !== base.origin ? gates.outside : url.pathname.startsWith("/_emdash/") ? gates.media : gates.pages);

const browser = "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36";
const cache = new Map<string, Promise<Got>>();

function get(target: URL | string, agent = browser): Promise<Got> {
  const url = new URL(target, base);
  url.hash = "";
  const key = `${agent} ${url.href}`;
  let got = cache.get(key);
  if (!got) {
    got = gateFor(url)(() => follow(url, agent));
    cache.set(key, got);
  }
  return got;
}

async function follow(start: URL, agent: string): Promise<Got> {
  const hops: Got["hops"] = [];
  let url = start;
  try {
    for (;;) {
      const response = await fetch(url, { redirect: "manual", headers: { "user-agent": agent }, signal: AbortSignal.timeout(30_000) });
      const location = response.headers.get("location");
      if (response.status >= 300 && response.status < 400 && location && hops.length < 6) {
        await response.arrayBuffer();
        url = new URL(location, url);
        hops.push({ status: response.status, to: url });
        continue;
      }
      return { status: response.status, type: response.headers.get("content-type") ?? "", headers: response.headers, body: Buffer.from(await response.arrayBuffer()), hops, final: url, error: null };
    }
  } catch (error) {
    const reason = error instanceof Error ? (error.cause instanceof Error ? error.cause.message : error.message) : String(error);
    return { status: 0, type: "", headers: new Headers(), body: Buffer.alloc(0), hops, final: url, error: reason };
  }
}

const isHtml = (got: Got) => got.type.startsWith("text/html");
const answer = (got: Got) => (got.error ? `no answer (${got.error})` : `HTTP ${got.status}`);
/** An address as the site being tested serves it: one written for the launch address moves to the tested host. */
const onBase = (url: URL) => (url.origin === launch.origin ? new URL(url.pathname + url.search + url.hash, base) : url);
const isOurs = (url: URL) => url.origin === base.origin;
const show = (url: URL) => (isOurs(url) ? url.pathname + url.search + url.hash : url.href);

/* ── Reading a page ───────────────────────────────────────────────────── */

type Attrs = Record<string, string>;

/** The attributes of every `<name>` tag. */
function tags(html: string, name: string): Attrs[] {
  return [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, "gi"))].map(([, attrs = ""]) =>
    Object.fromEntries([...attrs.matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g)].map(([, key = "", double, single]) => [key.toLowerCase(), decode(double ?? single ?? "")])),
  );
}
/** Without scripts and styles, whose text can look like tags. */
const markup = (html: string) => html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, "");
const srcsetUrls = (srcset: string) => srcset.split(/,\s+/).map((candidate) => candidate.trim().split(/\s+/)[0] ?? "").filter(Boolean);

type Use = "link" | "image" | "script" | "style" | "file";
type Ref = { url: URL; use: Use; pages: Set<string>; anchors: Map<string, Set<string>> };
/** Everything the pages point at, by address without its #anchor. */
const refs = new Map<string, Ref>();

function point(from: string, raw: string, use: Use) {
  if (!raw || raw.startsWith("data:")) return;
  let url: URL;
  try {
    url = new URL(raw, new URL(from, base));
  } catch {
    return report("fail", `"${raw}" is not an address`, from);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  url = onBase(url);
  const anchor = decodeURIComponent(url.hash.slice(1));
  url.hash = "";
  const ref = refs.get(url.href) ?? { url, use, pages: new Set<string>(), anchors: new Map<string, Set<string>>() };
  ref.pages.add(from);
  if (anchor) ref.anchors.set(anchor, (ref.anchors.get(anchor) ?? new Set<string>()).add(from));
  refs.set(url.href, ref);
}

const linkUses: Record<string, Use> = { stylesheet: "style", icon: "image", "apple-touch-icon": "image", manifest: "file", preload: "file", modulepreload: "script" };

function collect(from: string, html: string) {
  const body = markup(html);
  for (const a of tags(body, "a")) if (a.href !== undefined) point(from, a.href, "link");
  for (const name of ["img", "source", "video"]) {
    for (const tag of tags(body, name)) {
      for (const raw of [tag.src, tag.poster, ...srcsetUrls(tag.srcset ?? "")]) if (raw) point(from, raw, (name === "video" && raw === tag.src) || (tag.type ?? "").startsWith("video/") ? "file" : "image");
    }
  }
  for (const link of tags(body, "link")) {
    const use = (link.rel ?? "").split(/\s+/).map((rel) => linkUses[rel]).find(Boolean);
    if (use && link.href) point(from, link.href, use);
  }
  for (const script of tags(html, "script")) if (script.src) point(from, script.src, "script");
  for (const island of tags(body, "astro-island")) for (const raw of [island["component-url"], island["renderer-url"], island["before-hydration-url"]]) if (raw) point(from, raw, "script");
}

/* ── Crawl ────────────────────────────────────────────────────────────── */

/** Each page's HTML, by path. */
const pages = new Map<string, string>();
/** Paths a page links to, as opposed to ones only a sitemap names. */
const linked = new Set<string>(["/"]);

async function crawl(seeds: string[]) {
  const seen = new Set<string>();
  let frontier = seeds;
  while (frontier.length) {
    const next: string[] = [];
    await Promise.all(
      frontier.map(async (pathname) => {
        if (seen.has(pathname)) return;
        seen.add(pathname);
        const got = await get(pathname);
        const at = got.final.pathname;
        if (got.status !== 200 || !isHtml(got) || !isOurs(got.final) || pages.has(at)) return;
        const html = got.body.toString("utf8");
        pages.set(at, html);
        const before = refs.size;
        collect(at, html);
        for (const ref of [...refs.values()].slice(before)) {
          if (ref.use !== "link" || !isOurs(ref.url) || ref.url.pathname.startsWith("/_emdash")) continue;
          linked.add(ref.url.pathname);
          next.push(ref.url.pathname + ref.url.search);
        }
      }),
    );
    frontier = next;
  }
}

/* ── Checks ───────────────────────────────────────────────────────────── */

/** An outside site's answers that say the address is gone or broken. Its other refusals are often meant for scripts. */
const broken = (status: number) => status === 404 || status === 410 || status >= 500;
const expectedType: Partial<Record<Use, RegExp>> = { image: /^image\//, script: /javascript/, style: /^text\/css/ };

async function checkRefs() {
  const checked = new Set<string>();
  for (;;) {
    const fresh = [...refs.values()].filter((ref) => !checked.has(ref.url.href));
    if (!fresh.length) return;
    await Promise.all(
      fresh.map(async (ref) => {
        checked.add(ref.url.href);
        const got = await get(ref.url);
        const name = `${ref.use} ${show(ref.url)}`;
        const from = (message: string, kind: Kind) => ref.pages.forEach((page) => report(kind, message, page));
        if (!isOurs(ref.url)) {
          if (got.status !== 200) from(`${name}: ${answer(got)}`, broken(got.status) ? "fail" : "unverified");
          return;
        }
        if (got.status !== 200) return from(`${name}: ${answer(got)}`, "fail");
        if (got.hops.length && ref.use === "link") from(`${name} redirects to ${show(got.final)}`, "note");
        const type = expectedType[ref.use];
        if (type && !type.test(got.type)) from(`${name} is served as ${got.type || "no type"}`, "fail");
        if (isHtml(got) && isOurs(got.final)) {
          const html = got.body.toString("utf8");
          const ids = new Set(tags(html, "[a-z][\\w-]*").flatMap((tag) => [tag.id, tag.name].filter((id) => id !== undefined)));
          for (const [anchor, askers] of ref.anchors) if (!ids.has(anchor)) askers.forEach((page) => report("fail", `${show(got.final)} has no #${anchor}`, page));
        }
        // A stylesheet's own files: fonts and background images.
        if (ref.use === "style") for (const [, raw = ""] of got.body.toString("utf8").matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) point(show(ref.url), raw, "file");
      }),
    );
  }
}

/** A PNG's, JPEG's or WebP's size in pixels. */
function imageSize(file: Buffer): { width: number; height: number } | null {
  if (file.length < 30) return null;
  if (file.toString("latin1", 1, 4) === "PNG") return { width: file.readUInt32BE(16), height: file.readUInt32BE(20) };
  if (file.readUInt16BE(0) === 0xffd8) {
    for (let at = 2; at + 9 < file.length; at += 2 + file.readUInt16BE(at + 2)) {
      const marker = file[at + 1] ?? 0;
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { width: file.readUInt16BE(at + 7), height: file.readUInt16BE(at + 5) };
    }
    return null;
  }
  if (file.toString("latin1", 8, 12) !== "WEBP") return null;
  const format = file.toString("latin1", 12, 16);
  if (format === "VP8X") return { width: 1 + file.readUIntLE(24, 3), height: 1 + file.readUIntLE(27, 3) };
  if (format === "VP8 ") return { width: file.readUInt16LE(26) & 0x3fff, height: file.readUInt16LE(28) & 0x3fff };
  const bits = file.readUInt32LE(21);
  return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
}

/** WhatsApp's link-preview documentation: "This image should be under 600KB in size." It also requires og:url. */
const shareImageLimit = 600_000;
/** Share images checked, with their sizes, for the summary. */
const shareImages = new Map<string, number>();

async function checkHead(pathname: string, html: string) {
  const metas = tags(html, "meta");
  const meta = (key: string) => metas.find((tag) => (tag.property ?? tag.name) === key)?.content;
  const links = tags(html, "link");
  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "").trim();

  if (!title) report("fail", "no title", pathname);
  for (const key of ["description", "og:title", "og:description", "og:url", "og:image", "twitter:card"]) if (!meta(key)) report("fail", `no ${key}`, pathname);

  const lang = tags(html, "html")[0]?.lang ?? "";
  const expectedLang = pathname === "/ms" || pathname.startsWith("/ms/") ? "ms" : "en";
  if (!lang.startsWith(expectedLang)) report("fail", `lang is "${lang}", not ${expectedLang}`, pathname);

  const headings = tags(markup(html), "h1").length;
  if (headings !== 1) report("note", `${headings} h1 headings`, pathname);

  const robots = meta("robots");
  if (robots?.includes("noindex")) report("note", `the page asks not to be indexed (meta robots: ${robots})`, pathname);

  const canonical = links.find((link) => link.rel === "canonical")?.href;
  if (!canonical) report("note", "no canonical address", pathname);
  else if (canonical !== launch.origin + (pathname === "/" ? "/" : pathname)) report("fail", `canonical is ${canonical}`, pathname);

  for (const alternate of links.filter((link) => link.rel === "alternate" && link.hreflang)) {
    const got = await get(onBase(new URL(alternate.href ?? "", launch)));
    if (got.status !== 200 || got.hops.length) report("fail", `hreflang ${alternate.hreflang} names ${alternate.href}: ${got.hops.length ? "redirects" : answer(got)}`, pathname);
  }

  for (const [, json = ""] of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(json);
    } catch {
      report("fail", "structured data is not valid JSON", pathname);
    }
  }

  const image = meta("og:image");
  if (!image) return;
  if (meta("twitter:image") !== image) report("note", "twitter:image differs from og:image", pathname);
  const written = new URL(image, new URL(pathname, launch));
  const got = await get(onBase(written));
  if (got.status !== 200 || !got.type.startsWith("image/")) return report("fail", `share image ${show(onBase(written))}: ${answer(got)} ${got.type}`, pathname);
  shareImages.set(written.href, got.body.length);
  if (got.body.length > shareImageLimit) report("note", `share image over ${Math.round(shareImageLimit / 1000)} kB`, pathname);
  const size = imageSize(got.body);
  const declared = `${meta("og:image:width")}×${meta("og:image:height")}`;
  if (size && declared !== `${size.width}×${size.height}`) report("fail", `share image is ${size.width}×${size.height}, declared ${declared}`, pathname);
  if (!isOurs(written)) {
    const asWritten = await get(written);
    if (asWritten.status !== 200 || !asWritten.type.startsWith("image/")) report("host", `share images are named on ${written.origin}, which answers ${answer(asWritten)} for them`, pathname);
  }
}

function checkDuplicates(field: string, read: (html: string) => string) {
  const byValue = new Map<string, string[]>();
  for (const [pathname, html] of pages) byValue.set(read(html), [...(byValue.get(read(html)) ?? []), pathname]);
  for (const [value, paths] of byValue) if (value && paths.length > 1) paths.forEach((pathname) => report("note", `${paths.length} pages share the ${field} "${value.slice(0, 70)}"`, pathname));
}

/** The addresses a sitemap lists, moved to the tested host, through a sitemap index to its sitemaps. */
async function sitemap(pathname: string): Promise<string[]> {
  const got = await get(pathname);
  if (got.status !== 200) {
    report("fail", `${pathname}: ${answer(got)}`, "sitemaps");
    return [];
  }
  const xml = got.body.toString("utf8");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc = ""]) => new URL(decode(loc.trim())));
  for (const origin of new Set(locs.map((loc) => loc.origin))) if (origin !== launch.origin) report("note", `${pathname} names its addresses on ${origin}`, "sitemaps");
  const paths = locs.map((loc) => loc.pathname + loc.search);
  if (xml.includes("<sitemapindex")) return (await Promise.all(paths.map(sitemap))).flat();
  await Promise.all(
    paths.map(async (listed) => {
      const page = await get(listed);
      if (page.status !== 200 || page.hops.length || !isHtml(page)) report("fail", `${pathname} lists ${listed}: ${page.hops.length ? `redirects to ${show(page.final)}` : answer(page)}`, "sitemaps");
    }),
  );
  return paths;
}

async function checkRobots(sitemaps: string[]) {
  const got = await get("/robots.txt");
  if (got.status !== 200) return report("fail", `/robots.txt: ${answer(got)}`, "robots.txt");
  const lines = got.body.toString("utf8").split("\n").map((line) => line.trim()).filter((line) => /^(sitemap|disallow|allow|user-agent):/i.test(line));
  report("note", `robots.txt says: ${lines.join(" | ")}`, "robots.txt");
  for (const name of sitemaps) if (!lines.some((line) => /^sitemap:/i.test(line) && line.endsWith(name))) report("note", `robots.txt does not name ${name}`, "robots.txt");
  const header = (await get("/")).headers.get("x-robots-tag");
  if (header) report("note", `every page is sent with X-Robots-Tag: ${header}`, "/");
}

/** Each rule in public/_redirects, tried with an address it should catch. */
async function checkRedirects() {
  const rules = (await readFile(path.join(root, "public/_redirects"), "utf8")).split("\n").map((line) => line.trim()).filter((line) => line && !line.startsWith("#"));
  await Promise.all(
    rules.map(async (rule) => {
      const [from = "", to = "", status = "302"] = rule.split(/\s+/);
      // For "/old/* → /new/:splat", the rest of a page the site has under /new/.
      const prefix = to.split(":splat")[0] ?? "";
      const known = [...pages.keys()].find((pathname) => pathname.startsWith(prefix) && pathname.length > prefix.length && !pathname.slice(prefix.length).includes("/"));
      const splat = to.includes(":splat") ? (known?.slice(prefix.length) ?? "sample") : "sample";
      const asked = from.replace("*", splat);
      const expected = new URL(to.replace(":splat", splat), base);
      const got = await get(asked);
      const first = got.hops[0];
      if (!first || first.status !== Number(status) || first.to.href !== expected.href) return report("fail", `${asked} should go to ${show(expected)} (${status}): ${first ? `${first.status} to ${show(first.to)}` : answer(got)}`, "redirects");
      if (got.status !== 200) return report(isOurs(got.final) ? "fail" : "unverified", `${asked} goes to ${show(got.final)}: ${answer(got)}`, "redirects");
      const anchor = expected.hash.slice(1);
      if (anchor && !tags(got.body.toString("utf8"), "[a-z][\\w-]*").some((tag) => tag.id === anchor)) report("fail", `${asked} goes to ${show(expected)}, which has no #${anchor}`, "redirects");
    }),
  );
  return rules.length;
}

async function checkNotFound() {
  for (const pathname of ["/no-such-page", "/ms/no-such-page", "/blog/no-such-post", "/blog/page/99", "/no/such/page"]) {
    const got = await get(pathname);
    if (got.status !== 404 || !got.body.includes("<h1")) report("fail", `${pathname} should be the 404 page: ${answer(got)}, ${got.body.length} bytes`, "not found");
  }
  // A page's other spellings: each should redirect to the page or be a 404, not a second copy of it.
  for (const pathname of ["/rewards.html", "/rewards/", "/index.html", "/blog/"]) {
    const got = await get(pathname);
    if (got.status === 200 && !got.hops.length) report("note", `${pathname} answers 200 with its own copy of the page`, "not found");
    else if (got.status !== 200 && got.status !== 404) report("fail", `${pathname}: ${answer(got)}`, "not found");
  }
}

/** The pages as the crawlers that draw link previews and search results ask for them. */
async function checkCrawlers() {
  const agents = ["facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)", "WhatsApp/2.23.20.0", "Twitterbot/1.0", "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"];
  const post = [...pages.keys()].find((pathname) => /^\/blog\/(?!page\/)./.test(pathname));
  for (const pathname of ["/", ...(post ? [post] : [])]) {
    for (const agent of agents) {
      const got = await get(pathname, agent);
      if (got.status !== 200 || !got.body.includes('property="og:image"')) report("fail", `${pathname} as ${agent.split(/[/ ]/)[0]}: ${answer(got)}`, "crawlers");
    }
  }
}

/* ── Run ──────────────────────────────────────────────────────────────── */

const sitemapNames = ["/sitemap.xml", "/sitemap-pages.xml"];
const listed = new Set((await Promise.all(sitemapNames.map(sitemap))).flat());
await crawl(["/", "/get", ...listed]);
await checkRefs();
await Promise.all([...pages].map(([pathname, html]) => checkHead(pathname, html)));
checkDuplicates("title", (html) => decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "").trim());
checkDuplicates("description", (html) => tags(html, "meta").find((tag) => tag.name === "description")?.content ?? "");
for (const pathname of pages.keys()) if (!listed.has(pathname)) report("note", "not in a sitemap", pathname);
for (const pathname of listed) if (!linked.has(pathname)) report("note", "in a sitemap, but no page links to it", pathname);
await checkRobots(sitemapNames);
const rules = await checkRedirects();
await checkNotFound();
await checkCrawlers();

const all = [...refs.values()];
const count = (test: (ref: Ref) => boolean) => all.filter(test).length;
const imageBytes = [...shareImages.values()];
const kB = (bytes: number) => `${Math.round(bytes / 1000)} kB`;
console.log(`${base.origin}\n`);
console.log(`${pages.size} pages, ${listed.size} addresses in the sitemaps, ${rules} redirect rules.`);
console.log(`${count((ref) => isOurs(ref.url) && ref.use === "link")} links on the site, ${count((ref) => isOurs(ref.url) && ref.use !== "link")} files, ${count((ref) => !isOurs(ref.url))} outside addresses.`);
if (imageBytes.length) console.log(`${imageBytes.length} share images: ${kB(Math.min(...imageBytes))} to ${kB(Math.max(...imageBytes))}, ${imageBytes.filter((bytes) => bytes > shareImageLimit).length} over ${kB(shareImageLimit)}.`);

const titles: Record<Kind, string> = { fail: "FAILED", host: "NAMED ON THE LAUNCH ADDRESS", unverified: "COULD NOT VERIFY", note: "NOTES" };
for (const kind of ["fail", "host", "unverified", "note"] as const) {
  const ofKind = [...findings].filter(([, finding]) => finding.kind === kind);
  if (!ofKind.length) continue;
  console.log(`\n${titles[kind]} (${ofKind.length})`);
  for (const [message, { where }] of ofKind) {
    const places = [...where];
    console.log(`  ${message}\n      ${places.length > 1 ? `${places.length} places: ` : ""}${places.slice(0, 4).join(", ")}${places.length > 4 ? ", …" : ""}`);
  }
}
if ([...findings.values()].some((finding) => finding.kind === "fail")) process.exitCode = 1;

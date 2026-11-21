// Checks the imported blog on a running site against seed/blog-inventory.json:
//   node scripts/blog/verify.ts [--url http://localhost:4321]
// For every inventoried post: its old tavis.live path redirects to its page, the page answers 200 with the post's
// title and its whole body (word for word, as the inventory has it), and its cover image loads. It also counts the
// posts the index lists across its pages, follows every link on the index and post pages that stays on the site, and
// asks for a post that doesn't exist, which must be the 404 page.
// Exits 1 on any failure, naming it.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { defaultDesign, hrefIn } from "../../src/lib/site.ts";
import { decode } from "../html.ts";
import { type BlogInventory, inventoryPath, oldPostPath } from "./shared.ts";

const root = path.resolve(import.meta.dirname, "../..");
const { values: args } = parseArgs({ options: { url: { type: "string" } } });
const base = new URL(args.url ?? process.env.EMDASH_URL ?? "http://localhost:4321");
/** The blog's path in the design the site renders. */
const blog = hrefIn(defaultDesign, "/blog");

const failures: string[] = [];
const fail = (message: string) => {
  failures.push(message);
  console.log(`FAIL ${message}`);
};

const words = (text: string) => text.replace(/\s+/g, " ").trim();
const textOf = (html: string) => words(decode(html.replace(/<br\s*\/?>/g, " ").replace(/<\/(p|h[1-6]|li|blockquote)>/g, " ").replace(/<[^>]+>/g, "")));

async function get(pathname: string, redirect: RequestRedirect = "follow") {
  const response = await fetch(new URL(pathname, base), { redirect });
  return { response, html: redirect === "manual" ? "" : await response.text() };
}

const links = new Set<string>();
const collectLinks = (html: string) => {
  for (const [, href] of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
    const url = new URL(decode(href!), base);
    if (url.origin === base.origin && !url.pathname.startsWith("/_emdash")) links.add(url.pathname + url.search);
  }
};

async function main() {
  const inventory = JSON.parse(await readFile(path.join(root, inventoryPath), "utf8")) as BlogInventory;
  const slugs = new Set(inventory.posts.map((post) => post.slug));

  // The index, page by page, until it runs out.
  const listed: string[] = [];
  for (let page = 1; ; page++) {
    const { response, html } = await get(page === 1 ? blog : `${blog}/page/${page}`);
    if (response.status === 404 && page > 1) break;
    if (response.status !== 200) {
      fail(`index page ${page}: HTTP ${response.status}`);
      break;
    }
    collectLinks(html);
    for (const [, slug] of html.matchAll(new RegExp(`<article\\b[\\s\\S]*?href="${blog}/([^"?#]+)"`, "g"))) listed.push(slug!);
  }
  const unlisted = [...slugs].filter((slug) => !listed.includes(slug));
  if (unlisted.length) fail(`index omits ${unlisted.join(", ")}`);
  if (listed.length !== new Set(listed).size) fail("index lists a post twice");

  let bodiesMatch = 0;
  for (const post of inventory.posts) {
    const page = `${blog}/${post.slug}`;

    const old = await get(oldPostPath(post.slug), "manual");
    const location = old.response.headers.get("location");
    if (![301, 302].includes(old.response.status) || !location || new URL(location, base).pathname !== page) fail(`${oldPostPath(post.slug)} → ${old.response.status} ${location}`);

    const { response, html } = await get(page);
    if (response.status !== 200) {
      fail(`${page}: HTTP ${response.status}`);
      continue;
    }
    collectLinks(html);
    const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1];
    if (!h1 || textOf(h1) !== post.title) fail(`${page}: title is "${h1 && textOf(h1)}"`);

    const body = html.match(/<div class="article-body[^"]*">([\s\S]*?)<\/div>\s*<\/div>\s*<footer/)?.[1];
    const expected = words(post.body.map((block) => block.children.map((span) => span.text).join("")).join(" "));
    if (!body) fail(`${page}: no article body`);
    else if (textOf(body) !== expected) fail(`${page}: body differs from the inventory`);
    else bodiesMatch++;
    const headings = (body?.match(/<h2\b/g) ?? []).length;
    if (headings !== post.body.filter((block) => block.style === "h2").length) fail(`${page}: ${headings} headings`);

    const cover = html.match(/<article>[\s\S]*?<img\b[^>]*\bsrc="([^"]+)"/)?.[1];
    if (!cover) fail(`${page}: no cover image`);
    else {
      const image = await fetch(new URL(decode(cover), base));
      const type = image.headers.get("content-type") ?? "";
      if (!image.ok || !type.startsWith("image/")) fail(`${page}: cover ${image.status} ${type}`);
      await image.arrayBuffer();
    }
  }

  const unknown = `${blog}/no-such-post`;
  const missing = await get(unknown);
  if (missing.response.status !== 404 || !missing.html.includes("<h1")) fail(`${unknown}: HTTP ${missing.response.status}, ${missing.html.length} bytes`);

  for (const link of links) {
    const { response } = await get(link, "manual");
    if (response.status >= 400) fail(`link ${link}: HTTP ${response.status}`);
  }

  console.log(
    `\n${inventory.posts.length} posts inventoried, ${listed.length} listed on the index, ${bodiesMatch} pages with the full body, ${links.size} site links followed.`,
  );
  if (failures.length) {
    console.log(`${failures.length} failure(s).`);
    process.exitCode = 1;
  } else console.log("All checks passed.");
}

await main();

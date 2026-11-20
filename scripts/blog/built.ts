// Stops a deploy that would publish the blog without its posts:
//   node scripts/blog/built.ts
// The build makes a page for each post in the deployed database (cloudflare.config.ts). A build that read an empty
// database instead still succeeds, with an index that says "No posts yet", so this counts the post pages in the build
// output and exits 1 when there are none. A new site has no posts until they are imported: for its first deploy, run
// `pnpm build` and `cf deploy --prebuilt` without this check.
import { readdir } from "node:fs/promises";
import path from "node:path";

const dir = path.resolve(import.meta.dirname, "../../.cloudflare/output/v1/workers/default/assets/blog");
const posts = (await readdir(dir).catch(() => [])).filter((file) => file.endsWith(".html"));
if (posts.length === 0) {
  console.error(`No post pages in ${dir}. The build did not read the deployed database's posts; nothing was deployed.`);
  process.exit(1);
}
console.log(`${posts.length} post pages built.`);

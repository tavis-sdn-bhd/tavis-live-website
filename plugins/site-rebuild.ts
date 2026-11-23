// Rebuilds the site when what visitors see changes. The site's pages are pre-rendered at deploy (README, Deploy), so a
// post or timetable change published in the admin only reaches them in the next build. This plugin asks Cloudflare
// for that build by calling the Worker's Workers Builds deploy hook, whose URL an admin pastes into this plugin's
// settings (README, Editing). Bursts are safe: while one hook build is still queued, Cloudflare returns it instead of
// starting another, so publishing five posts in a minute costs one or two builds.
import type { PluginContext, PluginDescriptor, ResolvedPlugin } from "emdash";
import { definePlugin } from "emdash";

const id = "site-rebuild";
const version = "1.0.0";
const hookHost = "api.cloudflare.com";

const settingsSchema = {
  deployHookUrl: {
    type: "url",
    label: "Deploy hook URL",
    description: "From Cloudflare: Workers & Pages › tavis-live-website › Settings › Builds › Deploy Hooks. Leave empty to stop rebuilding on publish.",
  },
} as const;

export function siteRebuild(): PluginDescriptor {
  return {
    id,
    version,
    entrypoint: import.meta.filename,
    capabilities: ["content:read", "network:request"],
    allowedHosts: [hookHost],
    settingsSchema,
  };
}

/** Asks Cloudflare for a build, and logs what happened: the hook runs after the editor's request has been answered, so
    a failure here can't reach the admin. */
async function rebuild(reason: string, ctx: PluginContext) {
  const url = await ctx.settings.get<string>("deployHookUrl");
  if (!url) {
    ctx.log.warn(`Not rebuilding after ${reason}: no deploy hook URL is set`);
    return;
  }
  if (new URL(url).hostname !== hookHost) {
    ctx.log.error(`Not rebuilding after ${reason}: the deploy hook URL isn't on ${hookHost}`);
    return;
  }
  if (!ctx.http) throw new Error("site-rebuild needs the network:request capability");
  const response = await ctx.http.fetch(url, { method: "POST" });
  if (response.ok) ctx.log.info(`Rebuilding after ${reason}`);
  else ctx.log.error(`The deploy hook answered HTTP ${response.status} after ${reason}`);
}

const describe = (verb: string, event: { collection: string; content?: Record<string, unknown> }) =>
  `${verb} ${event.collection}${typeof event.content?.id === "string" ? ` ${event.content.id}` : ""}`;

export function createPlugin(): ResolvedPlugin {
  return definePlugin({
    id,
    version,
    capabilities: ["content:read", "network:request"],
    allowedHosts: [hookHost],
    admin: { settingsSchema },
    hooks: {
      "content:afterPublish": (event, ctx) => rebuild(describe("publishing", event), ctx),
      "content:afterUnpublish": (event, ctx) => rebuild(describe("unpublishing", event), ctx),
      // Emptying the trash deletes for good what trashing already took off the site.
      "content:afterDelete": async (event, ctx) => {
        if (!event.permanent) await rebuild(`deleting ${event.collection} ${event.id}`, ctx);
      },
      "content:afterRestore": (event, ctx) => rebuild(describe("restoring", event), ctx),
    },
  });
}

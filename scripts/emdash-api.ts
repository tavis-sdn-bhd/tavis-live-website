// A client for a running EmDash site's REST API, shared by the scripts that write to it.
//
//   --url <site>      the site, default the dev server at http://localhost:4321 (or EMDASH_URL)
//   EMDASH_TOKEN=…    an API token from the admin's Settings › API tokens; locally the dev bypass signs in instead
import { parseArgs } from "node:util";

const { values: args } = parseArgs({ options: { url: { type: "string" }, "dry-run": { type: "boolean" } } });

export const base = new URL(args.url ?? process.env.EMDASH_URL ?? "http://localhost:4321");
export const dryRun = args["dry-run"] ?? false;
const local = ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname);

/** How each request authenticates: the token, or locally the dev bypass's session cookie. */
let auth: Record<string, string> = {};

export async function signIn() {
  const token = process.env.EMDASH_TOKEN;
  if (token) {
    auth = { Authorization: `Bearer ${token}` };
    return;
  }
  if (!local) throw new Error(`Set EMDASH_TOKEN to an API token for ${base.origin}`);
  const response = await fetch(new URL("/_emdash/api/setup/dev-bypass", base), { method: "POST", headers: { "X-EmDash-Request": "1", Origin: base.origin } });
  const cookie = response.headers.getSetCookie().find((value) => value.startsWith("astro-session="));
  if (!response.ok || !cookie) throw new Error(`Dev bypass failed (HTTP ${response.status}). Is \`pnpm dev\` running at ${base.origin}?`);
  auth = { Cookie: cookie.split(";")[0]! };
}

type Envelope<T> = { success: true; data: T } | { success: false; error: { code: string; message: string } };

/** One API call. A GET that finds nothing returns null; any other failure throws with EmDash's own message. */
export async function api<T>(method: string, route: string, body?: unknown | FormData): Promise<T | null> {
  const headers: Record<string, string> = { ...auth, "X-EmDash-Request": "1", Origin: base.origin };
  if (body !== undefined && !(body instanceof FormData)) headers["Content-Type"] = "application/json";
  const response = await fetch(new URL(`/_emdash/api${route}`, base), {
    method,
    headers,
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  });
  if (response.status === 404 && method === "GET") return null;
  const json = (await response.json().catch(() => null)) as Envelope<T> | null;
  if (!response.ok || !json?.success) {
    const error = json && !json.success ? `${json.error.code}: ${json.error.message}` : `HTTP ${response.status}`;
    throw new Error(`${method} ${route} failed: ${error}`);
  }
  return json.data;
}

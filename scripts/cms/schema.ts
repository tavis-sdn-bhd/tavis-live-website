// Brings a running site's collections in line with seed/seed.json, through EmDash's schema API. EmDash reads the seed
// only when a site is first set up, so a collection or field added to it later reaches an existing database this way.
// It creates what is missing and updates what differs: labels, descriptions, select options and the like, and the
// site's timezone, which the admin's date boxes and the timetable's holiday dates both depend on. It never deletes a
// field or changes a field's type, required or unique flag, since EmDash makes those a migration; it stops on such a
// difference instead, before writing anything. Do those in the admin's Content Types.
//
//   pnpm cms:schema                                     the dev server at http://localhost:4321
//   EMDASH_TOKEN=… pnpm cms:schema --url https://www.tavis.live
//
// The token needs the schema:read, schema:write, settings:read and settings:manage scopes, so an admin's.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { api, base, dryRun, signIn } from "../emdash-api.ts";

type SeedField = {
  slug: string;
  label: string;
  type: string;
  required?: boolean;
  unique?: boolean;
  searchable?: boolean;
  validation?: Record<string, unknown>;
};

type SeedCollection = {
  slug: string;
  label: string;
  labelSingular?: string;
  description?: string;
  icon?: string;
  supports?: string[];
  urlPattern?: string;
  routable?: boolean;
  sortOrder?: number;
  titleField?: string;
  dateField?: string;
  fields: SeedField[];
};

type LiveField = { slug: string; label: string; type: string; required: boolean; unique: boolean; searchable: boolean; validation?: Record<string, unknown> };
type LiveCollection = Omit<SeedCollection, "fields"> & { fields?: LiveField[] };

const root = path.resolve(import.meta.dirname, "../..");
type Seed = { settings: { timezone?: string }; collections: SeedCollection[] };

function isSeed(value: unknown): value is Seed {
  if (!value || typeof value !== "object" || !("settings" in value) || !("collections" in value)) return false;
  const { settings, collections } = value;
  return !!settings && typeof settings === "object" && Array.isArray(collections) && collections.every((c: unknown) => !!c && typeof c === "object" && "slug" in c && "fields" in c && Array.isArray(c.fields));
}

const parsed: unknown = JSON.parse(await readFile(path.join(root, "seed/seed.json"), "utf8"));
if (!isSeed(parsed)) throw new Error("seed/seed.json needs `settings` and `collections`, each collection with a `slug` and `fields`");
const seed = parsed;

/** JSON equality that ignores key order, for comparing a seed value with what the API returns. */
const same = (a: unknown, b: unknown): boolean => JSON.stringify(sorted(a)) === JSON.stringify(sorted(b));
function sorted(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sorted);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, sorted(v)]));
  return value;
}

const changes: string[] = [];
async function write(summary: string, method: string, route: string, body: unknown) {
  changes.push(summary);
  if (!dryRun) await api(method, route, body);
}

await signIn();
console.log(`Applying seed/seed.json's ${seed.collections.length} collections to ${base.origin}${dryRun ? " (dry run)" : ""}`);

type Live = { wanted: SeedCollection; index: number; live: LiveCollection | undefined };
const lives: Live[] = [];
for (const [index, wanted] of seed.collections.entries()) {
  lives.push({ wanted, index, live: (await api<{ item: LiveCollection }>("GET", `/schema/collections/${wanted.slug}?includeFields=true`))?.item });
}

// Differences EmDash only allows as a migration, found before anything is written.
const blocked = lives.flatMap(({ wanted, live }) =>
  wanted.fields.flatMap((field) => {
    const current = live?.fields?.find((f) => f.slug === field.slug);
    if (!current) return [];
    const problems: string[] = [];
    if (current.type !== field.type) problems.push(`is a ${current.type} field on the site and a ${field.type} in the seed`);
    if (current.required !== (field.required ?? false)) problems.push(`is ${current.required ? "" : "not "}required on the site`);
    if (current.unique !== (field.unique ?? false)) problems.push(`is ${current.unique ? "" : "not "}unique on the site`);
    return problems.map((problem) => `${wanted.slug}.${field.slug} ${problem}`);
  }),
);
if (blocked.length) throw new Error(`These differ from the seed in ways only the admin's Content Types can change:\n  ${blocked.join("\n  ")}`);

const settings = await api<{ timezone?: string }>("GET", "/settings");
if (seed.settings.timezone && settings?.timezone !== seed.settings.timezone) await write(`timezone: ${seed.settings.timezone}`, "POST", "/settings", { timezone: seed.settings.timezone });

for (const { wanted, index, live } of lives) {
  const { fields, titleField, dateField, ...collection } = wanted;
  if (!live) await write(`${wanted.slug}: created`, "POST", "/schema/collections", collection);

  const liveFields = new Map((live?.fields ?? []).map((field) => [field.slug, field]));
  for (const [order, field] of fields.entries()) {
    const current = liveFields.get(field.slug);
    // Validation the seed leaves out is left alone, so a limit set in the admin survives.
    const body = { label: field.label, searchable: field.searchable ?? false, ...(field.validation && { validation: field.validation }), sortOrder: order };
    if (!current) {
      await write(`${wanted.slug}.${field.slug}: created`, "POST", `/schema/collections/${wanted.slug}/fields`, { slug: field.slug, type: field.type, required: field.required ?? false, unique: field.unique ?? false, validation: null, ...body });
      continue;
    }
    const differs = current.label !== body.label || current.searchable !== body.searchable || (field.validation !== undefined && !same(field.validation, current.validation ?? null));
    if (differs) await write(`${wanted.slug}.${field.slug}: updated`, "PUT", `/schema/collections/${wanted.slug}/fields/${field.slug}`, body);
  }

  // Title and date fields name fields, so they are set once the fields exist.
  const update = { ...collection, slug: undefined, titleField, dateField, sortOrder: wanted.sortOrder ?? index + 1 };
  const differs = !live || Object.entries(update).some(([key, value]) => value !== undefined && !same(value, live[key as keyof LiveCollection]));
  if (differs) await write(`${wanted.slug}: settings updated`, "PUT", `/schema/collections/${wanted.slug}`, update);
}

console.log(changes.length ? changes.map((line) => `  ${line}`).join("\n") : "  Already up to date.");

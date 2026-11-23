// Puts the 2027 timetable that src/lib/pages.ts transcribes into EmDash, once: a published Timetable entry per form and
// a published Public holiday per holiday. It only adds what is missing, matched by form and by holiday name and date,
// and never changes an entry that exists, so it can't undo an edit made in the admin. The one exception is an entry
// this script created and never got to publish, because a run stopped between the two: a rerun publishes a
// never-published entry whose content is exactly what the script writes, so a draft someone is still working on stays.
// Run `pnpm cms:schema` first.
//
//   pnpm cms:timetable                                     the dev server at http://localhost:4321
//   EMDASH_TOKEN=… pnpm cms:timetable --url https://www.tavis.live
//
// The token needs content:read and content:write.
import { timetable2027 } from "../../src/lib/pages.ts";
import { api, base, dryRun, signIn } from "../emdash-api.ts";
import { holidayDate, weekdays } from "../../src/lib/timetable-dates.ts";

type Item = { id: string; status: string; publishedAt: string | null; data: Record<string, unknown> };

/** "8 Mac" in 2027 → that date's start in Malaysian time, as an ISO instant. */
const malayMonths = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogos", "Sep", "Okt", "Nov", "Dis"];
function isoDate(label: string): string {
  const [day, month] = label.split(" ");
  const index = malayMonths.indexOf(month ?? "");
  if (!day || index < 0) throw new Error(`Can't read the holiday date "${label}"`);
  return `2027-${String(index + 1).padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00+08:00`;
}

async function all(collection: string): Promise<Item[]> {
  const items: Item[] = [];
  let cursor: string | undefined;
  do {
    const page = await api<{ items: Item[]; nextCursor?: string }>("GET", `/content/${collection}?limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`);
    items.push(...(page?.items ?? []));
    cursor = page?.nextCursor;
  } while (cursor);
  return items;
}

/** Whether an entry holds what the script writes. Dates compare as instants, since EmDash stores them in UTC. */
function sameData(stored: Record<string, unknown>, written: Record<string, unknown>): boolean {
  return Object.entries(written).every(([key, value]) =>
    key === "date" ? new Date(String(stored[key])).getTime() === new Date(String(value)).getTime() : JSON.stringify(stored[key]) === JSON.stringify(value),
  );
}

/** Adds an entry and publishes it, or publishes one that was added but never published. Says what it did. */
async function ensure(collection: string, existing: Item | undefined, data: Record<string, unknown>): Promise<string> {
  const stranded = existing && existing.status === "draft" && existing.publishedAt === null && sameData(existing.data, data);
  if (existing && !stranded) return "already there, left as it is";
  if (dryRun) return existing ? "would be published" : "would be added";
  const id = existing?.id ?? (await api<{ item: Item }>("POST", `/content/${collection}`, { data }))!.item.id;
  await api("POST", `/content/${collection}/${id}/publish`);
  return existing ? "published" : "added";
}

await signIn();
console.log(`Importing the 2027 timetable into ${base.origin}${dryRun ? " (dry run)" : ""}`);

const forms = new Map((await all("timetable")).map((item) => [item.data.form, item]));
// Form 5 first: the admin lists the newest entry first, so Form 1 ends up at the top.
for (const [form, week] of Object.entries(timetable2027.forms).reverse()) {
  const title = `Form ${form}`;
  const days = Object.fromEntries(weekdays.map((day, d) => [day, week[d]!.map((slot) => ({ ...slot }))]));
  console.log(`  ${title}: ${await ensure("timetable", forms.get(title), { form: title, ...days })}`);
}

const key = (name: string, date: string) => `${name} ${new Date(date).getTime()}`;
const holidays = new Map((await all("holidays")).map((item) => [key(String(item.data.title), String(item.data.date)), item]));
for (const [d, day] of timetable2027.holidays.entries()) {
  for (const holiday of day) {
    const date = isoDate(holiday.date);
    // The transcription files each holiday under a weekday; the site files it by its date, so the two must agree.
    if (holidayDate(date).weekday !== d) throw new Error(`${holiday.name} on ${holiday.date} is filed under ${weekdays[d]} but falls on another day`);
    console.log(`  ${holiday.name}, ${holiday.date}: ${await ensure("holidays", holidays.get(key(holiday.name, date)), { title: holiday.name, date })}`);
  }
}

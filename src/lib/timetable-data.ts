import { getEmDashCollection } from "emdash";
import { minutes, timetable, type Form, type Holiday, type Slot, type Timetable } from "@/lib/pages";
import { holidayDate, weekdays } from "@/lib/timetable-dates";

const formNumber = (value: unknown): Form | null => {
  const match = typeof value === "string" ? /^Form ([1-5])$/.exec(value) : null;
  return match ? (Number(match[1]) as Form) : null;
};

/** A repeater row as a class, or null when a field is missing. The admin requires every field, so that is rare. */
function slot(row: unknown): Slot | null {
  if (!row || typeof row !== "object") return null;
  const { subject, tutor, start, end } = row as Record<string, unknown>;
  if (typeof subject !== "string" || typeof tutor !== "string" || typeof start !== "string" || typeof end !== "string") return null;
  return { subject, tutor: tutor.trim(), start, end };
}

/**
 * The timetable the site shows, read from EmDash when the page is built: each published Timetable entry's week and
 * each published Public holiday under its weekday. A form with no entry keeps the transcribed 2027 week, so the grid
 * never shows a form empty because its entry was deleted, and with no published holidays at all the transcribed 2027
 * ones stay. A failed read, such as a site without these collections yet, throws and stops the build, as the blog's does.
 */
export async function loadTimetable(): Promise<Timetable> {
  const [forms, holidays] = await Promise.all([
    getEmDashCollection("timetable", { status: "published", limit: 100 }),
    getEmDashCollection("holidays", { status: "published", limit: 500 }),
  ]);
  if (forms.error) throw new Error("The timetable could not be read", { cause: forms.error });
  if (holidays.error) throw new Error("The public holidays could not be read", { cause: holidays.error });

  const weeks: Record<Form, Slot[][]> = { ...timetable.weeks };
  for (const entry of forms.entries) {
    const form = formNumber(entry.data.form);
    if (!form) continue;
    weeks[form] = weekdays.map((day) =>
      (Array.isArray(entry.data[day]) ? entry.data[day] : [])
        .map(slot)
        .filter((s): s is Slot => s !== null)
        .sort((a, b) => minutes(a.start) - minutes(b.start)),
    );
  }

  if (holidays.entries.length === 0) return { weeks, holidays: timetable.holidays };
  const byDay: Holiday[][] = weekdays.map(() => []);
  const dated = holidays.entries
    .map((entry) => ({ name: String(entry.data.title ?? "").trim(), date: new Date(entry.data.date) }))
    .filter((h) => h.name !== "" && !Number.isNaN(h.date.getTime()))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  for (const holiday of dated) {
    const { weekday, label } = holidayDate(holiday.date);
    if (weekday !== null) byDay[weekday]!.push({ date: label, name: holiday.name });
  }

  return { weeks, holidays: byDay };
}

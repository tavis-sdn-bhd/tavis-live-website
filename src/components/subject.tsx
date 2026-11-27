import { cx } from "./ui";

/** One highlighter per subject family. Colour only ever means a subject. */
export type SubjectKey = "sci" | "math" | "bm" | "en" | "hist" | "acc";

const families: Record<SubjectKey, readonly string[]> = {
  sci: ["Sains", "Science", "Biologi", "Biology", "Kimia", "Chemistry", "Fizik", "Physics"],
  math: ["Matematik", "Mathematics", "Matematik Tambahan", "Additional Mathematics"],
  bm: ["Bahasa Melayu"],
  // The Malay site names English "Bahasa Inggeris", as its timetable is in Malay.
  en: ["English", "Bahasa Inggeris"],
  hist: ["Sejarah"],
  acc: ["Perniagaan", "Prinsip Perakaunan"],
};

export function subjectKey(name: string): SubjectKey {
  for (const [key, names] of Object.entries(families) as Array<[SubjectKey, readonly string[]]>) {
    if (names.includes(name)) return key;
  }
  return "sci";
}

/* Literal class names so Tailwind can see them. Colour is a dot, never a fill. */
export const subjectDot: Record<SubjectKey, string> = {
  sci: "bg-sci",
  math: "bg-math",
  bm: "bg-bm",
  en: "bg-en",
  hist: "bg-hist",
  acc: "bg-acc",
};

/** Subjects are named in Malay, except English. */
export const subjectLang = (name: string) => (name === "English" ? "en" : "ms");

export function SubjectChip({ name, className, lang }: { name: string; className?: string; lang?: string }) {
  return (
    <span lang={name === "English" ? "en" : lang} className={cx("inline-flex items-center gap-1.5 rounded-md bg-cream px-2 py-0.5 text-[0.75rem] leading-5 text-forest", className)}>
      {/* Centred on the first 20px line, so it stays beside the name's first line when the name wraps. */}
      <span aria-hidden="true" className={cx("mt-[7px] size-1.5 shrink-0 self-start rounded-full", subjectDot[subjectKey(name)])} />
      {name}
    </span>
  );
}

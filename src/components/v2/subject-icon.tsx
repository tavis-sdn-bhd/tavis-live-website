import type { ReactNode } from "react";
import { subjectDot, subjectKey } from "../subject";
import { cx } from "../ui";

/* Duolingo's course flags, as subjects: a white glyph on a tile in the subject's colour, drawn on a 24px grid.
   Decorative: the subject's name always sits beside it. */

const line = { fill: "none", stroke: "#fff", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** Text on a white shape takes the tile's own colour, so it reads as cut out of the shape. */
function Label({ children }: { children: string }) {
  return (
    <text x="12" y="13.9" textAnchor="middle" fontSize="7.2" fontWeight="900" fill="currentColor" style={{ fontFamily: "inherit" }}>
      {children}
    </text>
  );
}

const bubble = "M5 4.5h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-4.5 3.5v-3.5H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z";

const glyphs: Record<string, ReactNode> = {
  Sains: (
    <>
      <path d="M9.5 3h5M10.5 3v5.5L5.4 17.6A2 2 0 0 0 7.1 20.6h9.8a2 2 0 0 0 1.7-3L13.5 8.5V3" {...line} />
      <path d="M7.6 15.2h8.8l1.9 3.4a1 1 0 0 1-.9 1.4H6.6a1 1 0 0 1-.9-1.4Z" fill="#fff" />
    </>
  ),
  Matematik: <path d="M7 3.5v7M3.5 7h7M13.5 7h7M4.5 14.5l5 5M9.5 14.5l-5 5M13.5 15.5h7M13.5 18.5h7" {...line} />,
  "Bahasa Melayu": (
    <>
      <path d={bubble} fill="#fff" />
      <Label>BM</Label>
    </>
  ),
  English: (
    <>
      <path d={bubble} fill="#fff" />
      <Label>EN</Label>
    </>
  ),
  Sejarah: (
    <>
      <path d="M3 8.5 12 3.5l9 5Z" fill="#fff" />
      <path d="M6 11v6M10 11v6M14 11v6M18 11v6" {...line} />
      <rect x="3" y="18.5" width="18" height="2.5" rx="1" fill="#fff" />
    </>
  ),
  Biologi: (
    <>
      <path d="M4.5 19.5C4.5 10.5 10 4.5 20 4c-.5 10-6.5 15.5-15.5 15.5Z" fill="#fff" />
      <path d="M4.5 19.5 14 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  Kimia: (
    <>
      <path d="M12 3.2 19.6 7.6v8.8L12 20.8l-7.6-4.4V7.6Z" {...line} />
      <circle cx="12" cy="12" r="3.4" {...line} />
    </>
  ),
  Fizik: (
    <>
      <ellipse cx="12" cy="12" rx="9.5" ry="3.8" {...line} strokeWidth={1.7} />
      <ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(60 12 12)" {...line} strokeWidth={1.7} />
      <ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(-60 12 12)" {...line} strokeWidth={1.7} />
      <circle cx="12" cy="12" r="2.2" fill="#fff" />
    </>
  ),
  "Matematik Tambahan": (
    <>
      <path d="M4 3.5v16.5h16.5" {...line} />
      <path d="M6.5 17C9 7 11.5 6 13.5 11s4 4.5 6-5" {...line} />
    </>
  ),
  Perniagaan: (
    <>
      <path d="M9 8V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v2" {...line} />
      <rect x="3" y="8" width="18" height="12" rx="2.5" fill="#fff" />
      <path d="M3 13.5h18" stroke="currentColor" strokeWidth="1.8" />
    </>
  ),
  "Prinsip Perakaunan": (
    <>
      <rect x="5" y="2.5" width="14" height="19" rx="2.5" fill="#fff" />
      <rect x="7.5" y="5" width="9" height="4" rx="1" fill="currentColor" />
      {[11.8, 15, 18.2].flatMap((y) => [8.6, 12, 15.4].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.15" fill="currentColor" />))}
    </>
  ),
};

/** Text colour for each subject's tile, so `currentColor` inside a glyph matches the tile. */
const tileText: Record<ReturnType<typeof subjectKey>, string> = {
  sci: "text-sci",
  math: "text-math",
  bm: "text-bm",
  en: "text-en",
  hist: "text-hist",
  acc: "text-acc",
};

export function SubjectIcon({ name, className }: { name: string; className?: string }) {
  const key = subjectKey(name);
  return (
    <span aria-hidden="true" className={cx("grid shrink-0 place-items-center rounded-xl shadow-[inset_0_-4px_0_rgb(0_0_0/0.16)]", subjectDot[key], tileText[key], className)}>
      <svg viewBox="0 0 24 24" focusable="false" className="size-[62%] -translate-y-[4%] overflow-visible">
        {glyphs[name] ?? glyphs.Sains}
      </svg>
    </span>
  );
}

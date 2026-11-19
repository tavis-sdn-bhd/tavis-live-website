/* The student avatars from the app's avatar shop, drawn flat in code: soft
   skin, big glinting eyes, an open smile, no outlines. One drawing per look
   on a 200 × 512 canvas; `head` crops the same drawing to a square portrait,
   so the tab bar and the home greeting never drift from the full figure. */

export type Look = "pink" | "green" | "blue";

const skin = "#f8d6c3";
const skinShade = "#efc2ab";
const hand = { r: 11, fill: skin } as const;

function Face() {
  return (
    <>
      <ellipse cx="100" cy="130" rx="57" ry="58" fill={skin} />
      <ellipse cx="66" cy="153" rx="10" ry="6" fill="#f59a9f" opacity=".5" />
      <ellipse cx="134" cy="153" rx="10" ry="6" fill="#f59a9f" opacity=".5" />
      <ellipse cx="78" cy="137" rx="7.5" ry="10" fill="#2a2d2c" />
      <ellipse cx="122" cy="137" rx="7.5" ry="10" fill="#2a2d2c" />
      <circle cx="80.6" cy="132.5" r="3" fill="#fff" />
      <circle cx="124.6" cy="132.5" r="3" fill="#fff" />
      <circle cx="75.5" cy="141.5" r="1.3" fill="#fff" opacity=".8" />
      <circle cx="119.5" cy="141.5" r="1.3" fill="#fff" opacity=".8" />
      <path d="M89 155H111A11 10.5 0 0 1 89 155Z" fill="#a8424c" />
      <path d="M93.5 162.5a7 4 0 0 1 13 0a11 10.5 0 0 1 -13 0Z" fill="#f2848f" />
    </>
  );
}

/** Long black hair, a pink sweater, jeans and white trainers. */
function Pink() {
  const hair = "#2b2a33";
  return (
    <>
      <path d="M38 132C38 66 70 40 100 40s62 26 62 92l4 108c-12 10-30 10-40 2H74c-10 8-28 8-40-2Z" fill={hair} />
      <path d="M66 368h32l-3 118H71Z" fill="#34466e" />
      <path d="M102 368h32l-6 118h-24Z" fill="#2e3f63" />
      <path d="M54 484h40a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H52a8 8 0 0 1-8-8c0-5 4-8 10-8Z" fill="#fff" />
      <path d="M106 484h40c6 0 10 3 10 8a8 8 0 0 1-8 8h-42a4 4 0 0 1-4-4v-8a4 4 0 0 1 4-4Z" fill="#fff" />
      <path d="M45 495h53M102 495h53" stroke="#dfe4e1" strokeWidth="3" />
      <rect x="90" y="176" width="20" height="26" rx="6" fill={skinShade} />
      <path d="M60 216c0-13 14-20 40-20s40 7 40 20l9 140c0 10-7 16-17 16H68c-10 0-17-6-17-16Z" fill="#f4b9c5" />
      <path d="M51 350h98v6c0 10-7 16-17 16H68c-10 0-17-6-17-16Z" fill="#eaa5b5" />
      <path d="M85 199c5 6 25 6 30 0" stroke="#eaa5b5" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M64 222 48 336M136 222l16 114" stroke="#efaebd" strokeWidth="27" strokeLinecap="round" />
      <circle cx="47" cy="352" {...hand} />
      <circle cx="153" cy="352" {...hand} />
      <Face />
      <path d="M42 134C42 78 68 50 100 50s58 28 58 84c-4-16-12-30-26-40C120 112 86 124 56 118c-7 4-11 10-14 16Z" fill={hair} />
      <path d="M132 94c4 10 4 18 0 26 10-6 16-14 18-22Z" fill={hair} />
      <path d="M41 134c-3 52 1 96 15 130 10-14 13-46 9-86ZM159 134c3 52-1 96-15 130-10-14-13-46-9-86Z" fill={hair} />
      <path d="M68 70c10-8 26-12 40-10" stroke="#fff" strokeOpacity=".16" strokeWidth="5" strokeLinecap="round" fill="none" />
    </>
  );
}

/** A sage tudung over a baju kurung, its hems picked out in cream. */
function Green() {
  const tudung = "#6fa58a";
  const fold = "#5f9479";
  const trim = { stroke: "#f3eedc", strokeWidth: 3, strokeDasharray: "1 7", strokeLinecap: "round" } as const;
  return (
    <>
      <path d="M54 394h92l6 96H48Z" fill="#78a98e" />
      <path d="M52 474h96" {...trim} />
      <ellipse cx="80" cy="494" rx="16" ry="7" fill="#5f8a74" />
      <ellipse cx="120" cy="494" rx="16" ry="7" fill="#5f8a74" />
      <path d="M60 226c4-10 76-10 80 0l16 166c0 7-5 12-12 12H56c-7 0-12-5-12-12Z" fill="#8cbca3" />
      <path d="M48 386h104" {...trim} />
      <path d="M63 234 48 360M137 234l15 126" stroke="#84b49b" strokeWidth="26" strokeLinecap="round" />
      <circle cx="47" cy="376" {...hand} />
      <circle cx="153" cy="376" {...hand} />
      <path d="M100 44c42 0 64 36 64 88 0 36-6 60-16 78 14 8 22 20 22 36-26 20-114 20-140 0 0-16 8-28 22-36-10-18-16-42-16-78 0-52 22-88 64-88Z" fill={tudung} />
      <Face />
      <path d="M43 134c0-48 24-76 57-76s57 28 57 76c-8-22-30-38-57-38s-49 16-57 38Z" fill={tudung} />
      <path d="M52 104c6-12 14-20 24-26" stroke="#fff" strokeOpacity=".2" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M64 200c16 14 56 14 72 0" stroke={fold} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M46 232c18 10 90 10 108 0" stroke={fold} strokeWidth="3" strokeLinecap="round" fill="none" opacity=".6" />
    </>
  );
}

/** Short black hair, a blue T-shirt, dark trousers and white trainers. */
function Blue() {
  return (
    <>
      <path d="M68 340h31l-2 146H72Z" fill="#2a2b31" />
      <path d="M101 340h31l-4 146h-25Z" fill="#232429" />
      <path d="M54 484h40a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H52a8 8 0 0 1-8-8c0-5 4-8 10-8Z" fill="#fff" />
      <path d="M106 484h40c6 0 10 3 10 8a8 8 0 0 1-8 8h-42a4 4 0 0 1-4-4v-8a4 4 0 0 1 4-4Z" fill="#fff" />
      <path d="M45 495h53M102 495h53" stroke="#3b6fd8" strokeWidth="3" />
      <rect x="90" y="176" width="20" height="26" rx="6" fill={skinShade} />
      <path d="M52 288 46 336M148 288l6 48" stroke={skin} strokeWidth="18" strokeLinecap="round" />
      <circle cx="46" cy="344" {...hand} />
      <circle cx="154" cy="344" {...hand} />
      <path d="M62 214c0-12 14-18 38-18s38 6 38 18l6 126c0 6-5 10-11 10H67c-6 0-11-4-11-10Z" fill="#3a5a9c" />
      <path d="M66 216 52 284M134 216l14 68" stroke="#33508d" strokeWidth="30" strokeLinecap="round" />
      <path d="M86 199c4 6 24 6 28 0" stroke="#2c4679" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="43" cy="140" r="10" fill={skinShade} />
      <circle cx="157" cy="140" r="10" fill={skinShade} />
      <Face />
      <path d="M43 124C41 76 68 46 100 46s60 30 57 78c-5-14-12-24-22-30-14 8-32 10-50 6-12 6-28 12-42 24Z" fill="#26252b" />
      <path d="M66 64c10-7 24-10 36-8" stroke="#fff" strokeOpacity=".16" strokeWidth="5" strokeLinecap="round" fill="none" />
    </>
  );
}

/** A player with no avatar: a plain figure in the current text colour. */
function Placeholder() {
  return (
    <g fill="currentColor">
      <ellipse cx="100" cy="128" rx="54" ry="58" />
      <path d="M58 214c0-12 14-18 42-18s42 6 42 18l8 150c0 8-6 14-14 14h-12l-4 112H96v-112h-8l-4 112H66l-4-112H54c-8 0-14-6-14-14Z" />
    </g>
  );
}

const drawings = { pink: Pink, green: Green, blue: Blue } as const;

type StudentProps = {
  /** null draws the empty placeholder the app shows for a player without an avatar. */
  look: Look | null;
  /** Crop to a square portrait of the head. */
  head?: boolean;
  /** Names the figure for screen readers; without it the drawing is decorative. */
  label?: string;
  className?: string;
};

export function Student({ look, head, label, className }: StudentProps) {
  const Drawing = look ? drawings[look] : Placeholder;
  return (
    <svg
      viewBox={head ? "25 40 150 150" : "0 0 200 512"}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      className={className}
    >
      <Drawing />
    </svg>
  );
}

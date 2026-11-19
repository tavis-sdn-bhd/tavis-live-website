import type { CSSProperties } from "react";

/* Variant B's cast: Malaysian students drawn for Tavis in Duolingo's character
   grammar. Rounded blobs and capsule limbs, flat fills with one darker side,
   no outlines, dark oval eyes with a glint, mouths open mid-shout. All
   decorative: they illustrate, the copy beside them speaks. */

type ArtProps = { className?: string; style?: CSSProperties };

const ink = "#4b4b4b";
const mouth = "#a51d2d";
const tongue = "#ff8aa6";
const blush = "#ff8aa6";

function Eye({ x, y, r = 5.5 }: { x: number; y: number; r?: number }) {
  return (
    <>
      <ellipse cx={x} cy={y} rx={r} ry={r * 1.35} fill={ink} />
      <circle cx={x + r * 0.35} cy={y - r * 0.55} r={r * 0.38} fill="#fff" />
    </>
  );
}

/** Mid-leap in a pink tudung and sky baju kurung, one arm up. */
export function TudungLeap({ className, style }: ArtProps) {
  const skin = "#d99470";
  return (
    <svg viewBox="0 0 200 240" aria-hidden="true" focusable="false" className={className} style={style}>
      <g transform="rotate(-10 100 120)">
        <path d="M84 168 66 214" stroke="#2b70c9" strokeWidth="19" strokeLinecap="round" />
        <path d="M114 168 140 204" stroke="#2457a6" strokeWidth="19" strokeLinecap="round" />
        <ellipse cx="62" cy="222" rx="14" ry="8.5" fill={ink} />
        <ellipse cx="146" cy="212" rx="14" ry="8.5" fill={ink} transform="rotate(35 146 212)" />

        <path d="M62 112Q100 96 138 112L146 180Q100 194 54 180Z" fill="#1cb0f6" />
        <path d="M122 104 138 112 146 180Q134 186 120 188Z" fill="#1899d6" />

        <path d="M72 122 38 70" stroke="#1cb0f6" strokeWidth="19" strokeLinecap="round" />
        <circle cx="33" cy="61" r="12" fill={skin} />
        <path d="M132 126 172 146" stroke="#1899d6" strokeWidth="19" strokeLinecap="round" />
        <circle cx="179" cy="149" r="12" fill={skin} />

        <path d="M100 16C140 16 158 46 156 82 154 104 146 118 132 126H68C54 118 46 104 44 82 42 46 60 16 100 16Z" fill="#ff86d0" />
        <path d="M142 38C154 56 158 80 152 102 148 114 140 122 132 126H118C136 106 144 72 142 38Z" fill="#f05fbb" />
        <ellipse cx="100" cy="76" rx="35" ry="37" fill={skin} />
        <path d="M66 70C70 50 84 40 100 40S130 50 134 70" fill="none" stroke="#ff86d0" strokeWidth="10" />

        <path d="M80 60 90 58M110 58 120 60" stroke={ink} strokeWidth="4.5" strokeLinecap="round" />
        <Eye x={86} y={73} />
        <Eye x={114} y={73} />
        <circle cx="75" cy="90" r="6.5" fill={blush} opacity="0.55" />
        <circle cx="125" cy="90" r="6.5" fill={blush} opacity="0.55" />
        <path d="M84 92Q100 116 116 92Z" fill={mouth} />
        <path d="M86 93H114L112.6 97H87.4Z" fill="#fff" />
        <path d="M92 103Q100 110 108 103Q100 99 92 103Z" fill={tongue} />
      </g>
    </svg>
  );
}

/** Tumbling head over heels in glasses and a sun-yellow tee, mouth an O. */
export function GlassesTumble({ className, style }: ArtProps) {
  const skin = "#a8673f";
  return (
    <svg viewBox="0 0 220 220" aria-hidden="true" focusable="false" className={className} style={style}>
      <g transform="rotate(28 110 110)">
        <path d="M96 152 76 196" stroke={ink} strokeWidth="19" strokeLinecap="round" />
        <path d="M124 150 152 186" stroke="#3a3a3a" strokeWidth="19" strokeLinecap="round" />
        <ellipse cx="72" cy="204" rx="14" ry="8.5" fill="#ff4b4b" />
        <ellipse cx="158" cy="193" rx="14" ry="8.5" fill="#ff4b4b" transform="rotate(40 158 193)" />

        <rect x="70" y="92" width="80" height="70" rx="26" fill="#ffc800" />
        <path d="M128 93C141 96 150 108 150 122V136C150 150 141 160 128 162Z" fill="#e5a400" />

        <path d="M76 108 34 92" stroke="#ffc800" strokeWidth="19" strokeLinecap="round" />
        <circle cx="26" cy="89" r="12" fill={skin} />
        <path d="M146 108 182 80" stroke="#e5a400" strokeWidth="19" strokeLinecap="round" />
        <circle cx="189" cy="74" r="12" fill={skin} />

        <circle cx="110" cy="58" r="40" fill={skin} />
        <path d="M69 62C66 32 86 14 110 14 136 14 154 32 151 62 142 52 128 46 110 46 94 46 78 52 69 62Z" fill="#2f2f2f" />
        <path d="M92 18 86 6M108 15 108 2M124 18 132 6" stroke="#2f2f2f" strokeWidth="9" strokeLinecap="round" />

        <circle cx="94" cy="64" r="13" fill="#fff" stroke={ink} strokeWidth="5" />
        <circle cx="126" cy="64" r="13" fill="#fff" stroke={ink} strokeWidth="5" />
        <path d="M107 63H113" stroke={ink} strokeWidth="5" strokeLinecap="round" />
        <circle cx="96" cy="66" r="4.5" fill={ink} />
        <circle cx="128" cy="66" r="4.5" fill={ink} />
        <ellipse cx="110" cy="88" rx="7" ry="9" fill={mouth} />
      </g>
    </svg>
  );
}

/** Flying flat out, black bob and fringe, holding an open book ahead like a surfboard. */
export function BobFly({ className, style }: ArtProps) {
  const skin = "#ffd2b8";
  const hair = "#2f2f2f";
  return (
    <svg viewBox="0 0 240 180" aria-hidden="true" focusable="false" className={className} style={style}>
      <g transform="rotate(-8 120 90)">
        <path d="M150 104 196 82" stroke="#a572ff" strokeWidth="18" strokeLinecap="round" />
        <path d="M150 118 202 124" stroke="#8a55e8" strokeWidth="18" strokeLinecap="round" />
        <ellipse cx="206" cy="78" rx="13" ry="8" fill={ink} transform="rotate(-25 206 78)" />
        <ellipse cx="212" cy="126" rx="13" ry="8" fill={ink} transform="rotate(8 212 126)" />

        <rect x="96" y="84" width="72" height="50" rx="22" fill="#ff9600" />
        <path d="M100 118C104 128 114 134 126 134H146C158 134 166 126 168 116Z" fill="#e07f00" />

        <path d="M108 100 90 112" stroke="#ff9600" strokeWidth="17" strokeLinecap="round" />
        <path d="M110 122 88 134" stroke="#e07f00" strokeWidth="17" strokeLinecap="round" />

        <path d="M14 96 52 88 56 146 18 152Z" fill="var(--color-brand-ledge)" />
        <path d="M52 88 90 96 88 152 56 146Z" fill="var(--color-brand)" />
        <path d="M19 100 50 94 53 140 22 145Z" fill="#fff" />
        <path d="M55 94 85 100 83 145 56 140Z" fill="#fff" />
        <path d="M52 88 56 146" stroke="var(--color-brand-ink)" strokeWidth="4" />
        <path d="M26 108 44 104M27 117 45 113M28 126 46 122M62 104 78 108M62 113 78 117M62 122 78 126" stroke="#cfcfcf" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="88" cy="112" r="10" fill={skin} />
        <circle cx="86" cy="136" r="10" fill={skin} />

        <circle cx="88" cy="62" r="36" fill={skin} />
        <path d="M50 68C46 34 66 20 90 20 116 20 132 38 128 66V96H114V62C102 66 82 64 68 56L66 96H52Z" fill={hair} />
        <rect x="104" y="30" width="16" height="9" rx="4" fill="#ff4b4b" transform="rotate(-20 112 34)" />
        <path d="M70 68Q76 61 82 68M94 68Q100 61 106 68" fill="none" stroke={ink} strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="70" cy="80" r="6" fill={blush} opacity="0.55" />
        <circle cx="108" cy="80" r="6" fill={blush} opacity="0.55" />
        <path d="M80 82Q89 92 98 82" fill="none" stroke={mouth} strokeWidth="4.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** A points coin seen at an angle: gold face on a darker rim, two highlight bars. */
export function CoinArt({ className, style }: ArtProps) {
  return (
    <svg viewBox="0 0 64 56" aria-hidden="true" focusable="false" className={className} style={style}>
      <ellipse cx="34" cy="31" rx="28" ry="23" fill="#e5a400" />
      <ellipse cx="30" cy="27" rx="28" ry="23" fill="#ffc800" />
      <ellipse cx="30" cy="27" rx="19" ry="15" fill="#ffd84d" />
      <path d="M22 22H38M30 22V36" stroke="#e5a400" strokeWidth="5" strokeLinecap="round" />
      <path d="M10 22Q14 12 24 8" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/** The Tavis mark drawn: a green tile, the T's arms curling down into its stem. */
export function TavisMark({ className, style }: ArtProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" className={className} style={style}>
      <rect width="64" height="64" rx="15" fill="var(--color-brand)" />
      <path d="M10 14H54V20.5C47 20.5 41.5 23.5 38.2 29L35 34.5V52H29V34.5L25.8 29C22.5 23.5 17 20.5 10 20.5Z" fill="#fff" />
    </svg>
  );
}

/** Duolingo's speed dashes: short coloured capsules flung out from the burst. */
export function Dash({ colour, className, style }: ArtProps & { colour: string }) {
  return (
    <svg viewBox="0 0 40 12" aria-hidden="true" focusable="false" className={className} style={style}>
      <rect width="40" height="12" rx="6" style={{ fill: colour }} />
    </svg>
  );
}

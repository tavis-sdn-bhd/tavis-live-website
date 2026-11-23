import type { CSSProperties } from "react";

/* Variant B's cast: Malaysian secondary students, Form 1 to 5, drawn for Tavis in Duolingo's character grammar.
   Rounded blobs and capsule limbs, flat fills with one darker side, no outlines. Teen proportions set them apart
   from a primary-school cast: a head about a third of the figure, long limbs, brows and a nose, and clothes a
   teenager picks. All decorative: they illustrate, the copy beside them speaks. */

type ArtProps = { className?: string; style?: CSSProperties };

const ink = "#4b4b4b";
const mouth = "#a51d2d";
const tongue = "#ff8aa6";
const blush = "#ff8aa6";
const gold = "#ffc800";
const goldRim = "#e5a400";

function Eye({ x, y, r = 3.5 }: { x: number; y: number; r?: number }) {
  return (
    <>
      <ellipse cx={x} cy={y} rx={r} ry={r * 1.3} fill={ink} />
      <circle cx={x + r * 0.35} cy={y - r * 0.5} r={r * 0.4} fill="#fff" />
    </>
  );
}

/** A happy eye squeezed shut, an arc with a lash flicked off its outer end (`side` -1 for the left eye). */
function ShutEye({ x, y, side }: { x: number; y: number; side: -1 | 1 }) {
  return <path d={`M${x - 4.5} ${y + 1}Q${x} ${y - 4.5} ${x + 4.5} ${y + 1}M${x + side * 4.2} ${y}l${side * 2.6} -1.6`} fill="none" stroke={ink} strokeWidth="2.8" strokeLinecap="round" />;
}

function Brows({ x, y, gap = 8, lift = 1.5 }: { x: number; y: number; gap?: number; lift?: number }) {
  return <path d={`M${x - gap - 4} ${y + lift}l8 ${-lift}M${x + gap - 4} ${y}l8 ${lift}`} stroke={ink} strokeWidth="3" strokeLinecap="round" />;
}

function Nose({ x, y, shade }: { x: number; y: number; shade: string }) {
  return <path d={`M${x} ${y}q2.6 3.4 -1 4.4`} fill="none" stroke={shade} strokeWidth="2.4" strokeLinecap="round" />;
}

function Blush({ x, y, gap }: { x: number; y: number; gap: number }) {
  return (
    <>
      <circle cx={x - gap} cy={y} r="4.5" fill={blush} opacity="0.5" />
      <circle cx={x + gap} cy={y} r="4.5" fill={blush} opacity="0.5" />
    </>
  );
}

/** An open laugh `w` wide each side of x: a top row of teeth and the tongue, both inside the curve. */
function Laugh({ x, y, w }: { x: number; y: number; w: number }) {
  const at = (k: number) => y + w * k;
  return (
    <>
      <path d={`M${x - w} ${y}Q${x} ${at(1.5)} ${x + w} ${y}Z`} fill={mouth} />
      <path d={`M${x - w * 0.9} ${at(0.05)}H${x + w * 0.9}L${x + w * 0.74} ${at(0.3)}H${x - w * 0.74}Z`} fill="#fff" />
      <path d={`M${x - w * 0.4} ${at(0.62)}Q${x} ${at(0.38)} ${x + w * 0.4} ${at(0.62)}Q${x} ${at(0.82)} ${x - w * 0.4} ${at(0.62)}Z`} fill={tongue} />
    </>
  );
}

/** A sneaker side-on, its ankle at (x, y) and toe along +x before `turn`; `flip` points the toe along -x. */
function Shoe({ x, y, turn = 0, flip, upper, sole = "#dde2e6" }: { x: number; y: number; turn?: number; flip?: boolean; upper: string; sole?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${turn})${flip ? " scale(-1 1)" : ""}`}>
      <path d="M-11 6V-1C-11-5-8-7-4-7H2C6-7 9-4 12-2L15 0C17 1 18 3 18 6Z" fill={upper} />
      <rect x="-12" y="5" width="31" height="5.5" rx="2.75" fill={sole} />
    </g>
  );
}

/** A limb as one capsule from (x1, y1) to (x2, y2). */
function Limb({ d, colour, w }: { d: string; colour: string; w: number }) {
  return <path d={d} fill="none" stroke={colour} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />;
}

/** Mid-leap in a pink tudung draped to a point, a sky baju kurung top over navy slacks, one arm flung up. */
export function TudungLeap({ className, style }: ArtProps) {
  const skin = "#d99470";
  const shade = "#bf7a56";
  const tudung = "#ff86d0";
  const tudungShade = "#ef5fb9";
  return (
    <svg viewBox="0 0 200 240" aria-hidden="true" focusable="false" className={className} style={style}>
      <g transform="rotate(-10 100 120)">
        <Limb d="M91 170 75 217" colour="#2b4a8a" w={15} />
        <Limb d="M111 170 139 207" colour="#223d73" w={15} />
        <Shoe x={74} y={221} turn={6} flip upper={ink} />
        <Shoe x={143} y={210} turn={14} upper={ink} />

        <path d="M73 108Q100 99 127 108L138 174Q100 186 62 174Z" fill="#1cb0f6" />
        <path d="M117 103Q123 105 127 108L138 174Q129 178 117 180Z" fill="#1899d6" />

        <Limb d="M81 116 48 72" colour="#1cb0f6" w={14} />
        <circle cx="44" cy="65" r="8" fill={skin} />
        <Limb d="M121 120 162 140" colour="#1899d6" w={14} />
        <circle cx="169" cy="143" r="8" fill={skin} />

        <path d="M100 26C125 26 140 44 139 68 138 84 134 96 142 110L100 131 58 110C66 96 62 84 61 68 60 44 75 26 100 26Z" fill={tudung} />
        <path d="M126 33C135 42 140 55 139 68 138 84 134 96 142 110L119 121C132 100 135 64 126 33Z" fill={tudungShade} />
        <ellipse cx="100" cy="67" rx="20" ry="23" fill={skin} />
        <path d="M77 68C78 50 87 41 100 41S122 50 123 68" fill="none" stroke={tudung} strokeWidth="8" />
        <circle cx="113" cy="99" r="2.8" fill={gold} />

        <Brows x={100} y={57} />
        <Eye x={92} y={65} />
        <Eye x={108} y={65} />
        <Nose x={100} y={69} shade={shade} />
        <Blush x={100} y={75} gap={14} />
        <Laugh x={100} y={78} w={8} />
      </g>
    </svg>
  );
}

/** Tumbling head over heels in glasses and an oversized sun-yellow tee, backpack still on, mouth an O. */
export function GlassesTumble({ className, style }: ArtProps) {
  const skin = "#a8673f";
  const shade = "#8b5131";
  const hair = "#2a2a2a";
  return (
    <svg viewBox="0 0 220 220" aria-hidden="true" focusable="false" className={className} style={style}>
      <g transform="rotate(28 110 110)">
        <rect x="131" y="86" width="27" height="50" rx="11" fill="#2bb3a3" />
        <rect x="141" y="104" width="15" height="19" rx="5" fill="#23978a" />

        <Limb d="M100 138 85 184" colour="#3a3a3a" w={16} />
        <Limb d="M121 138 146 178" colour="#2e2e2e" w={16} />
        <Shoe x={84} y={190} turn={10} flip upper="#ff4b4b" />
        <Shoe x={150} y={182} turn={22} upper="#ff4b4b" />

        <Limb d="M62 85 36 78" colour={skin} w={12} />
        <circle cx="31" cy="76" r="8" fill={skin} />
        <Limb d="M156 77 177 58" colour={skin} w={12} />
        <circle cx="182" cy="53" r="8" fill={skin} />

        <path d="M80 84Q110 74 140 84L144 142Q110 150 76 142Z" fill="#ffc800" />
        <path d="M126 78Q134 80 140 84L144 142Q135 146 124 147Z" fill="#e5a400" />
        <Limb d="M86 91 66 86" colour="#ffc800" w={21} />
        <Limb d="M134 91 152 80" colour="#e5a400" w={21} />
        <path d="M131 82C127 96 126 110 127 126" fill="none" stroke="#23978a" strokeWidth="5" strokeLinecap="round" />

        <rect x="103" y="64" width="14" height="18" rx="5" fill={shade} />
        <circle cx="88" cy="52" r="5" fill={shade} />
        <circle cx="132" cy="52" r="5" fill={shade} />
        <ellipse cx="110" cy="50" rx="22" ry="25" fill={skin} />
        <path d="M88 46C86 28 97 18 110 18 124 18 134 28 132 46 128 38 120 34 110 34 100 34 92 38 88 46Z" fill={hair} />
        {[
          [93, 30, 8],
          [102, 23, 9],
          [114, 21, 9],
          [125, 26, 8],
          [131, 35, 6],
          [89, 38, 6],
        ].map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={hair} />
        ))}

        <Brows x={110} y={38} gap={9} lift={-1.5} />
        <rect x="92" y="44" width="15" height="12" rx="4.5" fill="#fff" fillOpacity="0.55" stroke={ink} strokeWidth="3" />
        <rect x="113" y="44" width="15" height="12" rx="4.5" fill="#fff" fillOpacity="0.55" stroke={ink} strokeWidth="3" />
        <path d="M107 49H113" stroke={ink} strokeWidth="3" />
        <Eye x={100} y={50} r={2.8} />
        <Eye x={120} y={50} r={2.8} />
        <Nose x={110} y={58} shade={shade} />
        <ellipse cx="110" cy="68" rx="5" ry="6" fill={mouth} />
        <ellipse cx="110" cy="71" rx="3" ry="2.2" fill={tongue} />
      </g>
    </svg>
  );
}

/** Flying flat out, a high ponytail streaming behind and an earbud in, holding an open textbook ahead like a surfboard. */
export function PonytailFly({ className, style }: ArtProps) {
  const skin = "#ffd2b8";
  const shade = "#eeae8c";
  const hair = "#2f2f2f";
  return (
    <svg viewBox="0 0 240 180" aria-hidden="true" focusable="false" className={className} style={style}>
      <g transform="rotate(-8 120 90)">
        <Limb d="M162 96 204 80" colour="#a572ff" w={14} />
        <Limb d="M162 112 208 118" colour="#8a55e8" w={14} />
        <Shoe x={207} y={79} turn={-111} flip upper="#1cb0f6" />
        <Shoe x={211} y={118} turn={-83} flip upper="#1899d6" />

        <rect x="100" y="84" width="70" height="38" rx="17" fill="#ff9600" />
        <path d="M102 108C106 117 114 122 124 122H153C162 122 169 115 170 106Z" fill="#e07f00" />
        <path d="M128 84V100" stroke="#e07f00" strokeWidth="3" strokeLinecap="round" />

        <Limb d="M112 96 86 108" colour="#ff9600" w={13} />
        <Limb d="M114 114 84 130" colour="#e07f00" w={13} />

        <path d="M16 96 50 89 53 146 19 152Z" fill="var(--color-brand-ledge)" />
        <path d="M50 89 84 96 82 152 53 146Z" fill="var(--color-brand)" />
        <path d="M21 100 48 94 51 140 24 145Z" fill="#fff" />
        <path d="M55 94 80 100 78 145 55 140Z" fill="#fff" />
        <path d="M50 89 53 146" stroke="var(--color-brand-ink)" strokeWidth="3.5" />
        <path d="M27 108 42 105M28 116 43 113M29 124 44 121M60 104 73 107M60 112 73 115M60 120 73 123" stroke="#cfcfcf" strokeWidth="3" strokeLinecap="round" />
        <path d="M64 96V110L67.5 107 71 110V97" fill="#ff4b4b" />
        <circle cx="86" cy="108" r="7.5" fill={skin} />
        <circle cx="84" cy="130" r="7.5" fill={skin} />

        <Limb d="M94 84 103 92" colour={shade} w={12} />
        <path d="M108 42C126 26 152 32 170 18 164 38 148 52 116 54Z" fill={hair} />
        <path d="M128 40C142 38 154 34 164 26" fill="none" stroke="#484848" strokeWidth="3" strokeLinecap="round" />
        <path d="M67 66C63 40 78 33 94 33 112 33 123 45 119 66 117 80 111 88 104 90H80C72 86 68 78 67 66Z" fill={hair} />
        <ellipse cx="114" cy="68" rx="4.5" ry="5.5" fill={shade} />
        <ellipse cx="92" cy="64" rx="21" ry="23" fill={skin} />
        <path d="M71 63C69 46 80 38 94 38 108 38 116 46 114 57 106 50 95 48 87 52 80 55 75 59 71 63Z" fill={hair} />
        <rect x="104" y="37" width="13" height="8" rx="4" fill="#ff4b4b" transform="rotate(-32 110 41)" />
        <circle cx="115" cy="69" r="2.6" fill="#fff" />

        <path d="M80 61.5l7 -1.5M97 60l7 1.5" stroke={ink} strokeWidth="2.8" strokeLinecap="round" />
        <ShutEye x={84} y={67} side={-1} />
        <ShutEye x={100} y={67} side={1} />
        <Nose x={92} y={70} shade={shade} />
        <Blush x={92} y={76} gap={13} />
        <Laugh x={92} y={78} w={6} />
      </g>
    </svg>
  );
}

/** Jumping in school uniform, white shirt, school tie and green trousers, phone held high and a fist pumped. */
export function UniformCheer({ className, style }: ArtProps) {
  const skin = "#c98a5e";
  const shade = "#ab6f47";
  const hair = "#262626";
  const shirt = "#f0f4f7";
  const shirtShade = "#d3dde5";
  const canvas = "#eef2f5";
  return (
    <svg viewBox="0 0 200 240" aria-hidden="true" focusable="false" className={className} style={style}>
      <g transform="rotate(16 100 120)">
        <Limb d="M90 150 74 180 84 208" colour="#2f6b3d" w={16} />
        <Limb d="M112 150 132 182 158 192" colour="#245a31" w={16} />
        <Shoe x={84} y={213} flip upper={canvas} sole="#c3ccd4" />
        <Shoe x={164} y={192} turn={-62} upper={canvas} sole="#c3ccd4" />

        <g transform="rotate(14 152 26)">
          <rect x="141" y="4" width="22" height="40" rx="5" fill="#363636" />
          <rect x="143.5" y="7.5" width="17" height="31" rx="3" fill="var(--color-brand)" />
          <ellipse cx="152" cy="22" rx="5.5" ry="4.8" fill={goldRim} />
          <ellipse cx="151.4" cy="21.4" rx="5.5" ry="4.8" fill={gold} />
        </g>

        <Limb d="M66 106 54 114 46 88" colour={skin} w={12} />
        <circle cx="45" cy="82" r="8.5" fill={skin} />
        <Limb d="M134 84 148 48" colour={skin} w={12} />
        <circle cx="150" cy="41" r="8" fill={skin} />

        <path d="M76 90Q100 82 124 90L128 150Q100 156 72 150Z" fill={shirt} />
        <path d="M112 85Q119 87 124 90L128 150Q120 153 110 154Z" fill={shirtShade} />
        <path d="M72 144Q100 150 128 144V151Q100 157 72 151Z" fill="#2a2a2a" />
        <rect x="81" y="104" width="14" height="14" rx="3" fill={shirtShade} />
        <path d="M84 107H92V111C92 114 90 116 88 117 86 116 84 114 84 111Z" fill="var(--color-brand)" />
        <Limb d="M82 96 68 104" colour={shirt} w={21} />
        <Limb d="M120 96 131 84" colour={shirtShade} w={21} />
        <path d="M89 86 100 97 111 86 105 83 100 89 95 83Z" fill={shirtShade} />
        <path d="M97.5 92H102.5L104.5 98 100 128 95.5 98Z" fill="#0f4d27" />
        <path d="M96 104 104 101M96.5 112 103.5 109M97.5 120 102.5 118" stroke="#65cd7d" strokeWidth="1.8" strokeLinecap="round" />

        <rect x="93" y="70" width="14" height="16" rx="5" fill={shade} />
        <circle cx="79" cy="58" r="5" fill={shade} />
        <circle cx="121" cy="58" r="5" fill={shade} />
        <ellipse cx="100" cy="56" rx="21" ry="24" fill={skin} />
        <path d="M79 54C76 32 88 22 102 22 116 22 125 30 123 50 118 42 110 38 100 39 91 40 84 45 79 54Z" fill={hair} />
        <path d="M92 28C96 14 112 10 122 18 113 19 107 24 104 32Z" fill={hair} />
        <path d="M79 54C78 48 79 44 81 40L84 49Z" fill="#5a5a5a" />

        <Brows x={100} y={43} gap={9} lift={-2} />
        <Eye x={92} y={52} />
        <Eye x={108} y={52} />
        <Nose x={100} y={57} shade={shade} />
        <Laugh x={100} y={65} w={9} />
      </g>
    </svg>
  );
}

/** Skipping in a teal hoodie with her curls up in a puff, holding a points coin over her head and winking. */
export function CurlsCoin({ className, style }: ArtProps) {
  const skin = "#8d5524";
  const shade = "#71421b";
  const hair = "#241c18";
  return (
    <svg viewBox="0 0 200 240" aria-hidden="true" focusable="false" className={className} style={style}>
      <g transform="rotate(-6 100 120)">
        <Limb d="M90 162 76 210" colour="#7aa7e0" w={16} />
        <Limb d="M110 162 136 196" colour="#5f8fcf" w={16} />
        <Shoe x={75} y={215} turn={6} flip upper="#9b7bf0" />
        <Shoe x={140} y={199} turn={16} upper="#9b7bf0" />

        <Limb d="M118 114 150 134" colour="#23978a" w={15} />
        <circle cx="156" cy="138" r="8" fill={skin} />

        <path d="M74 104Q98 96 122 104L126 164Q98 170 70 164Z" fill="#2bb3a3" />
        <path d="M110 99Q117 101 122 104L126 164Q118 167 108 168Z" fill="#23978a" />
        <path d="M82 140H114L118 158Q98 162 78 158Z" fill="#23978a" />
        <path d="M82 100C86 92 110 92 114 100 105 107 91 107 82 100Z" fill="#23978a" />
        <path d="M93 104V122M103 104V120" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />

        <Limb d="M80 112 55 72" colour="#2bb3a3" w={15} />
        <g transform="rotate(-14 44 40)">
          <ellipse cx="46" cy="42" rx="18" ry="15" fill={goldRim} />
          <ellipse cx="43" cy="39" rx="18" ry="15" fill={gold} />
          <ellipse cx="43" cy="39" rx="12" ry="10" fill="#ffd84d" />
          <path d="M38 35H48M43 35V44" stroke={goldRim} strokeWidth="3.4" strokeLinecap="round" />
        </g>
        <path d="M18 26 12 20M24 14 22 6M66 18 72 12" stroke={gold} strokeWidth="3.4" strokeLinecap="round" />
        <circle cx="51" cy="65" r="8" fill={skin} />

        <rect x="91" y="86" width="14" height="16" rx="5" fill={shade} />
        <ellipse cx="78" cy="76" rx="4.5" ry="5.5" fill={shade} />
        <circle cx="78" cy="85" r="3" fill="none" stroke={gold} strokeWidth="1.8" />
        <ellipse cx="98" cy="72" rx="20" ry="23" fill={skin} />
        {[
          [88, 34, 10],
          [98, 27, 12],
          [109, 34, 10],
          [98, 40, 10],
        ].map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={hair} />
        ))}
        <rect x="87" y="44" width="22" height="6" rx="3" fill={gold} />
        <path d="M78 68C76 54 86 48 98 48 110 48 120 54 118 68 112 60 106 57 98 57 90 57 84 60 78 68Z" fill={hair} />
        {[
          [79, 64, 6],
          [117, 64, 6],
          [83, 54, 6],
          [113, 54, 6],
        ].map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={hair} />
        ))}

        <Brows x={98} y={62} />
        <path d="M86 70Q90 66 94 70" fill="none" stroke={ink} strokeWidth="2.8" strokeLinecap="round" />
        <Eye x={106} y={70} />
        <Nose x={98} y={74} shade={shade} />
        <Blush x={98} y={80} gap={13} />
        <Laugh x={98} y={83} w={8.5} />
      </g>
    </svg>
  );
}

/** A points coin seen at an angle: gold face on a darker rim, two highlight bars. */
export function CoinArt({ className, style }: ArtProps) {
  return (
    <svg viewBox="0 0 64 56" aria-hidden="true" focusable="false" className={className} style={style}>
      <ellipse cx="34" cy="31" rx="28" ry="23" fill={goldRim} />
      <ellipse cx="30" cy="27" rx="28" ry="23" fill={gold} />
      <ellipse cx="30" cy="27" rx="19" ry="15" fill="#ffd84d" />
      <path d="M22 22H38M30 22V36" stroke={goldRim} strokeWidth="5" strokeLinecap="round" />
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

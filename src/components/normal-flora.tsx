import type { ReactNode } from "react";

/* "Normal Flora in Humans", the diagram on the app's F5 Sains Learning Card for chapter 1, Mikroorganisma: two
   bacteria under the microscope, and where normal flora live in the body. Redrawn flat in code from the client's
   screenshot, so it stays sharp at any size. */

const ink = "#2b2f36";
const cell = { fill: "#e07f72", stroke: "#a14f45", strokeWidth: 1.2 } as const;
const panel = { fill: "#fbe4cc", stroke: ink, strokeWidth: 1.3 } as const;
const label = { fill: ink, fontFamily: "Helvetica, Arial, sans-serif" } as const;

/** Rod-shaped bacteria: x, y, angle. */
const rods: ReadonlyArray<[number, number, number]> = [
  [34, 96, 30], [52, 84, -20], [76, 92, 60], [98, 86, -35], [40, 118, -50], [64, 114, 15], [88, 116, -70], [104, 110, 40], [52, 138, 80], [78, 136, -15], [100, 136, 25],
];

/** What each lens shows: cocci in the airway, rods in the gut, both in the urethra. */
const airway: ReadonlyArray<[number, number]> = [[350, 92], [358, 86], [366, 92], [362, 100], [354, 102], [370, 104], [346, 104], [372, 96], [358, 112], [366, 112], [350, 112]];
const gut: ReadonlyArray<[number, number, number]> = [[348, 172, 30], [360, 168, -20], [372, 176, 60], [352, 186, -50], [364, 186, 15], [374, 190, -30], [358, 196, 80]];
const urethraRods: ReadonlyArray<[number, number, number]> = [[350, 256, 20], [362, 252, -40], [372, 262, 70], [356, 270, -10]];
const urethraCocci: ReadonlyArray<[number, number]> = [[366, 272], [374, 252], [348, 266]];

/** A chain of cocci along a quadratic curve. */
function Chain({ from, via, to, n }: { from: [number, number]; via: [number, number]; to: [number, number]; n: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const t = i / (n - 1);
        const x = (1 - t) ** 2 * from[0] + 2 * (1 - t) * t * via[0] + t ** 2 * to[0];
        const y = (1 - t) ** 2 * from[1] + 2 * (1 - t) * t * via[1] + t ** 2 * to[1];
        return <circle key={i} cx={x} cy={y} r="3.4" {...cell} strokeWidth="1" />;
      })}
    </>
  );
}

/** A magnified view: a disc of bacteria at the end of a light-blue beam from the body. */
function Lens({ x, y, from, children }: { x: number; y: number; from: [number, number]; children: ReactNode }) {
  return (
    <>
      <path d={`M${from[0]} ${from[1]}L${x - 4} ${y - 22}L${x - 4} ${y + 22}Z`} fill="#cfe4f3" stroke="#8fb3cc" strokeWidth="1" />
      <circle cx={x + 16} cy={y} r="25" fill="#fbe4cc" stroke={ink} strokeWidth="1.3" />
      {children}
    </>
  );
}

/** A callout's label, its number in a ring before it. */
function Numbered({ x, y, n, children }: { x: number; y: number; n: number; children: ReactNode }) {
  return (
    <>
      <circle cx={x + 6} cy={y - 3} r="6.5" fill="#fff" stroke={ink} strokeWidth="1" />
      <text x={x + 6} y={y} textAnchor="middle" fontSize="8.5" {...label}>
        {n}
      </text>
      <text x={x + 16} y={y} fontSize="8.6" {...label}>
        {children}
      </text>
    </>
  );
}

export function NormalFlora({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 300" role="img" aria-label="Normal flora in humans: Lactobacillus and Streptococcus, found in the upper respiratory tract, the intestines and the urethra" className={className}>
      <text x="14" y="22" fontSize="15" fontWeight="700" {...label}>
        Normal Flora in Humans
      </text>
      <text x="14" y="37" fontSize="8.6" {...label}>
        Normal flora are microorganisms found in organisms, including humans and animals, that do not cause
      </text>
      <text x="14" y="48" fontSize="8.6" {...label}>
        disease. Observe some normal flora in different parts of the human body.
      </text>

      {/* Under the microscope */}
      <rect x="18" y="66" width="104" height="216" fill="#fff" stroke={ink} strokeWidth="1.3" />
      <rect x="24" y="72" width="92" height="84" {...panel} />
      {rods.map(([x, y, a], i) => (
        <rect key={i} x={x - 9} y={y - 3.6} width="18" height="7.2" rx="3.6" transform={`rotate(${a} ${x} ${y})`} {...cell} />
      ))}
      <text x="70" y="168" textAnchor="middle" fontSize="8.4" fontStyle="italic" {...label}>
        Lactobacillus sp.
      </text>
      <rect x="24" y="176" width="92" height="84" {...panel} />
      <Chain from={[32, 196]} via={[60, 180]} to={[96, 192]} n={10} />
      <Chain from={[34, 222]} via={[70, 206]} to={[108, 226]} n={11} />
      <Chain from={[30, 246]} via={[66, 236]} to={[104, 250]} n={10} />
      <text x="70" y="272" textAnchor="middle" fontSize="8.4" fontStyle="italic" {...label}>
        Streptococcus sp.
      </text>

      {/* The body, with the intestines */}
      <g fill="#f3c5a6" stroke="#c99677" strokeWidth="1.2" strokeLinejoin="round">
        <ellipse cx="228" cy="90" rx="19" ry="22" />
        <path d="M220 108H236V122C256 124 270 130 274 146L284 214C285 222 274 224 272 216L262 158L262 222C262 234 260 252 256 288H236L228 240L220 288H200C196 252 194 234 194 222L194 158L184 216C182 224 171 222 172 214L182 146C186 130 200 124 220 122Z" />
      </g>
      {/* The large intestine frames the coils of the small one */}
      <path d="M208 232V184C208 176 212 172 220 172H236C244 172 248 176 248 184V236C248 242 242 246 236 244" fill="none" stroke="#b9574d" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M208 232V184C208 176 212 172 220 172H236C244 172 248 176 248 184V236C248 242 242 246 236 244" fill="none" stroke="#e59384" strokeWidth="5.6" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M216 184q3-4 6 0t6 0 6 0 6 0M240 192q-3 4-6 0t-6 0-6 0-6 0M216 200q3-4 6 0t6 0 6 0 6 0M240 208q-3 4-6 0t-6 0-6 0-6 0M216 216q3-4 6 0t6 0 6 0 6 0M240 224q-3 4-6 0t-6 0-6 0-6 0"
        fill="none"
        stroke="#b9574d"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M216 184q3-4 6 0t6 0 6 0 6 0M240 192q-3 4-6 0t-6 0-6 0-6 0M216 200q3-4 6 0t6 0 6 0 6 0M240 208q-3 4-6 0t-6 0-6 0-6 0M216 216q3-4 6 0t6 0 6 0 6 0M240 224q-3 4-6 0t-6 0-6 0-6 0"
        fill="none"
        stroke="#eda193"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Where they live */}
      <Lens x={340} y={98} from={[244, 100]}>
        {airway.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.6" {...cell} strokeWidth="1" />
        ))}
      </Lens>
      <Numbered x={338} y={64} n={1}>
        Upper Respiratory Tract
      </Numbered>

      <Lens x={340} y={180} from={[248, 198]}>
        {gut.map(([x, y, a], i) => (
          <rect key={i} x={x - 7.5} y={y - 3} width="15" height="6" rx="3" transform={`rotate(${a} ${x} ${y})`} {...cell} strokeWidth="1" />
        ))}
      </Lens>
      <Numbered x={338} y={146} n={2}>
        Digestive Tract (Intestines)
      </Numbered>

      <Lens x={340} y={262} from={[230, 250]}>
        {urethraRods.map(([x, y, a], i) => (
          <rect key={i} x={x - 7.5} y={y - 3} width="15" height="6" rx="3" transform={`rotate(${a} ${x} ${y})`} {...cell} strokeWidth="1" />
        ))}
        {urethraCocci.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.4" {...cell} strokeWidth="1" />
        ))}
      </Lens>
      <Numbered x={386} y={265} n={3}>
        Urethra
      </Numbered>
    </svg>
  );
}

import { useId, type CSSProperties } from "react";
import { cx } from "./ui";

const d = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

/**
 * The bacteriophage diagram from Question Universe Q17, redrawn as vector
 * line art with Paper Mono labels so it stays crisp at any size. When
 * `draw` is set, strokes trace in on load (CSS, no JS).
 */
export function Bacteriophage({ className, draw = false, delay = 0 }: { className?: string; draw?: boolean; delay?: number }) {
  const titleId = useId();
  const stroke = cx(draw && "intro-draw");
  const fade = cx(draw && "intro-fade");
  return (
    <svg viewBox="0 0 240 300" role="img" aria-labelledby={titleId} className={cx("text-forest", className)}>
      <title id={titleId}>Diagram of a bacteriophage with head (capsid), collar, tail sheath, tail fibers and base plate labelled</title>
      <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
        {/* Head (capsid): icosahedron outline and facets */}
        <path pathLength={1} className={stroke} style={d(delay)} d="M120 18 160 42 160 92 120 116 80 92 80 42Z" />
        <path
          pathLength={1}
          className={stroke}
          style={d(delay + 200)}
          strokeWidth="1.5"
          d="M120 18 104 62 136 62Z M104 62 80 42 M104 62 80 92 M136 62 160 42 M136 62 160 92 M104 62 120 96 136 62 M120 96 80 92 M120 96 160 92 M120 96 120 116"
        />
        {/* Collar */}
        <rect pathLength={1} className={stroke} style={d(delay + 380)} x="110" y="116" width="20" height="8" rx="2" />
        {/* Tail sheath with lattice */}
        <rect pathLength={1} className={stroke} style={d(delay + 460)} x="111" y="124" width="18" height="72" rx="2" />
        <path
          pathLength={1}
          className={stroke}
          style={d(delay + 560)}
          strokeWidth="1.3"
          d="M111 124 129 136 111 148 129 160 111 172 129 184 111 196 M129 124 111 136 129 148 111 160 129 172 111 184 129 196"
        />
        {/* Base plate */}
        <path pathLength={1} className={stroke} style={d(delay + 680)} d="M102 196H138L143 205H97Z" />
        {/* Tail fibers */}
        <path
          pathLength={1}
          className={stroke}
          style={d(delay + 760)}
          d="M103 201 66 222 50 270 M108 205 88 238 86 286 M137 201 174 222 190 270 M132 205 152 238 154 286"
        />
      </g>

      <g className={fade} style={d(delay + 900)}>
        <g fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1">
          <path d="M68 46H82" />
          <path d="M131 120H180" />
          <path d="M129 160H180" />
          <path d="M60 226 42 210" />
          <path d="M120 206V284" />
        </g>
        {/* As large as the margins allow: the card draws the diagram about 150px wide, so 12 units is about 7.5px. "BASE
            PLATE" sits under the tail fibers, the only place wide enough for it. */}
        <g fill="currentColor" fontFamily="var(--font-mono)" fontSize="12" letterSpacing="0.02em">
          <text x="2" y="36">HEAD</text>
          <text x="2" y="50">(CAPSID)</text>
          <text x="184" y="124">COLLAR</text>
          <text x="184" y="158">TAIL</text>
          <text x="184" y="172">SHEATH</text>
          <text x="2" y="190">TAIL</text>
          <text x="2" y="204">FIBERS</text>
          <text x="120" y="298" textAnchor="middle">BASE PLATE</text>
        </g>
      </g>
    </svg>
  );
}

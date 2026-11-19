"use client";

import { motion, useReducedMotion } from "motion/react";
import { C } from "./mascot-palette";

/**
 * Outfits for Tavi. Each outfit is split into the layers it lives on, so it
 * sits correctly in front of or behind the body, head and arms:
 *   Back  – behind the torso (backpack)
 *   Body  – over the chest, under the head (collar, tie, coat, bow tie)
 *   Head  – on the head, tilting with it (goggles, glasses, hats)
 *   Prop  – held in the hand; drawn at the grip point (0,0)
 */

export type Outfit = "none" | "school" | "science" | "math" | "history" | "english" | "graduate";

export const outfitHasProp = (o: Outfit) => o === "science" || o === "math" || o === "history" || o === "english" || o === "graduate";
/** Outfits that cover the chest logo with their own chest details. */
export const outfitHidesLogo = (o: Outfit) => o === "school" || o === "science";

export function OutfitBack({ outfit }: { outfit: Outfit }) {
  if (outfit !== "school") return null;
  return (
    <g>
      <rect x={168} y={170} width={46} height={74} rx={16} fill={C.forestSoft} />
      <rect x={186} y={198} width={24} height={30} rx={8} fill={C.forest} />
      <path d="M190 206 h16" stroke={C.forestSoft} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

export function OutfitBody({ outfit }: { outfit: Outfit }) {
  switch (outfit) {
    case "school":
      return (
        <g>
          {/* backpack straps */}
          <path d="M92 172 C88 198 88 222 92 246" stroke={C.forestSoft} strokeWidth={11} strokeLinecap="round" fill="none" />
          <path d="M168 172 C172 198 172 222 168 246" stroke={C.forestSoft} strokeWidth={11} strokeLinecap="round" fill="none" />
          {/* collar */}
          <path d="M106 182 L130 198 L114 210Z" fill={C.white} stroke={C.whiteShade} strokeWidth={2} strokeLinejoin="round" />
          <path d="M154 182 L130 198 L146 210Z" fill={C.white} stroke={C.whiteShade} strokeWidth={2} strokeLinejoin="round" />
          {/* tie */}
          <path d="M124 196 L136 196 L134 206 L126 206Z" fill={C.forest} />
          <path d="M126 206 L134 206 L140 236 L130 246 L120 236Z" fill={C.forest} />
          <path d="M127 216 L137 214 M126 226 L139 224" stroke={C.brand} strokeWidth={2.5} strokeLinecap="round" />
          {/* pocket badge */}
          <rect x={144} y={218} width={18} height={18} rx={4.5} fill={C.brand} />
          <path transform="translate(144 218) scale(0.56)" d="M7 8H13C15.5 8 16 10.5 16 12.5C16 10.5 16.5 8 19 8H25V11.5H20.5C18.3 11.5 17.6 13.2 17.6 15.2V25H14.4V15.2C14.4 13.2 13.7 11.5 11.5 11.5H7Z" fill={C.white} />
        </g>
      );
    case "science":
      return (
        <g>
          {/* lab coat over the teal sides */}
          <path d="M84 168 C68 198 64 240 76 262 L112 270 L120 204Z" fill={C.white} stroke={C.whiteShade} strokeWidth={2.5} strokeLinejoin="round" />
          <path d="M176 168 C192 198 196 240 184 262 L148 270 L140 204Z" fill={C.white} stroke={C.whiteShade} strokeWidth={2.5} strokeLinejoin="round" />
          <path d="M120 204 L130 230 L140 204" fill="none" stroke={C.whiteShade} strokeWidth={2.5} strokeLinejoin="round" />
          {/* pocket with pens */}
          <rect x={86} y={222} width={22} height={18} rx={4} fill={C.white} stroke={C.whiteShade} strokeWidth={2} />
          <rect x={90} y={212} width={4} height={14} rx={2} fill={C.forest} />
          <rect x={97} y={214} width={4} height={12} rx={2} fill={C.sunDeep} />
        </g>
      );
    case "english":
      return (
        <g>
          <path d="M130 200 L112 190 C108 196 108 206 112 212Z" fill={C.forest} />
          <path d="M130 200 L148 190 C152 196 152 206 148 212Z" fill={C.forest} />
          <rect x={125} y={194} width={10} height={12} rx={4} fill={C.forestSoft} />
        </g>
      );
    default:
      return null;
  }
}

export function OutfitHead({ outfit }: { outfit: Outfit }) {
  switch (outfit) {
    case "science":
      return (
        <g>
          <path d="M50 70 C90 54 170 54 210 70" stroke={C.forest} strokeWidth={7} fill="none" strokeLinecap="round" />
          {[104, 156].map((x) => (
            <g key={x}>
              <circle cx={x} cy={62} r={17} fill={C.sun} stroke={C.forest} strokeWidth={5} />
              <ellipse cx={x - 5} cy={57} rx={5} ry={3} fill={C.white} opacity={0.75} transform={`rotate(-30 ${x - 5} 57)`} />
            </g>
          ))}
        </g>
      );
    case "math":
      return (
        <g fill="none" stroke={C.forest} strokeWidth={4.5}>
          <circle cx={96} cy={96} r={20} fill={C.white} fillOpacity={0.12} />
          <circle cx={164} cy={96} r={20} fill={C.white} fillOpacity={0.12} />
          <path d="M116 94 Q130 86 144 94" strokeLinecap="round" />
          <path d="M76 92 L56 86 M184 92 L204 86" strokeLinecap="round" />
        </g>
      );
    case "history":
      return (
        <g>
          <path d="M60 50 C62 6 198 6 200 50Z" fill={C.khaki} />
          <path d="M70 40 C90 30 170 30 190 40 L192 48 C170 40 90 40 68 48Z" fill={C.forest} />
          <ellipse cx={130} cy={52} rx={86} ry={12} fill={C.khakiDeep} />
          <ellipse cx={104} cy={24} rx={16} ry={6} fill={C.white} opacity={0.35} transform="rotate(-18 104 24)" />
        </g>
      );
    case "english":
      return (
        <g>
          <ellipse cx={112} cy={34} rx={56} ry={20} fill={C.forest} transform="rotate(-12 112 34)" />
          <ellipse cx={104} cy={28} rx={22} ry={6} fill={C.forestSoft} transform="rotate(-12 104 28)" />
          <circle cx={118} cy={14} r={5} fill={C.forest} />
        </g>
      );
    case "graduate":
      return (
        <g>
          <path d="M92 44 L92 62 C110 72 150 72 168 62 L168 44Z" fill={C.forestSoft} />
          <path d="M60 40 L130 18 L200 40 L130 62Z" fill={C.forest} />
          <circle cx={130} cy={40} r={4} fill={C.sun} />
          <path d="M130 40 L186 50 L188 82" stroke={C.sun} strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d="M183 80 L193 80 L195 96 L181 96Z" fill={C.sun} />
        </g>
      );
    default:
      return null;
  }
}

function Bubbles() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <g fill={C.brand}>
      {[0, 0.6, 1.2].map((delay, i) => (
        <motion.circle
          key={i}
          cx={i === 1 ? 3 : -3}
          r={i === 1 ? 3 : 2.2}
          initial={{ cy: -26, opacity: 0 }}
          animate={{ cy: [-26, -48], opacity: [0, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, delay, ease: "easeOut" }}
        />
      ))}
    </g>
  );
}

/** Held item, drawn around the grip point (0,0). */
/** `still`: Tavi is resting or off screen, so the flask stops bubbling. */
export function Prop({ outfit, still }: { outfit: Outfit; still: boolean }) {
  switch (outfit) {
    case "science":
      return (
        <g>
          {!still && <Bubbles />}
          <rect x={-5} y={-30} width={10} height={16} rx={2} fill={C.glass} stroke={C.deep} strokeWidth={2.5} />
          <path d="M-5 -16 L-17 7 C-19 12 -16 15 -11 15 L11 15 C16 15 19 12 17 7 L5 -16Z" fill={C.glass} stroke={C.deep} strokeWidth={2.5} strokeLinejoin="round" />
          <path d="M-12 -1 L12 -1 L16 7 C18 11 15 13 11 13 L-11 13 C-15 13 -18 11 -16 7Z" fill={C.brand} />
        </g>
      );
    case "math":
      return (
        <g transform="rotate(-30)">
          <rect x={-5} y={-40} width={10} height={50} rx={2} fill={C.sun} />
          <rect x={-5} y={-40} width={10} height={8} rx={2} fill={C.cheek} />
          <rect x={-5} y={-33} width={10} height={4} fill={C.whiteShade} />
          <path d="M-5 10 L5 10 L0 20Z" fill={C.paper} />
          <path d="M-1.6 16.5 L1.6 16.5 L0 20Z" fill={C.forest} />
        </g>
      );
    case "history":
      return (
        <g transform="rotate(-12)">
          <rect x={-22} y={-9} width={44} height={18} rx={9} fill={C.paper} />
          <ellipse cx={-22} cy={0} rx={5} ry={9} fill={C.paperShade} />
          <ellipse cx={22} cy={0} rx={5} ry={9} fill={C.paperShade} />
          <rect x={-3} y={-9} width={6} height={18} fill={C.ribbon} />
        </g>
      );
    case "english":
      return (
        <g transform="rotate(-8)">
          <rect x={-16} y={-24} width={32} height={38} rx={4} fill={C.brand} />
          <rect x={-16} y={-24} width={6} height={38} rx={2} fill={C.brandDeep} />
          <rect x={14} y={-21} width={3} height={32} fill={C.white} />
          <text x={3} y={0} textAnchor="middle" fontFamily="var(--font-display)" fontSize={13} fill={C.white}>
            Aa
          </text>
        </g>
      );
    case "graduate":
      return (
        <g transform="rotate(-20)">
          <rect x={-24} y={-8} width={48} height={16} rx={8} fill={C.white} stroke={C.whiteShade} strokeWidth={2} />
          <rect x={-3} y={-8} width={6} height={16} fill={C.sun} />
        </g>
      );
    default:
      return null;
  }
}

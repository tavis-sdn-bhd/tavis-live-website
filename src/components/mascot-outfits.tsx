"use client";

import { motion, useReducedMotion } from "motion/react";
import { C, LINE, outlined, sprout } from "./mascot-palette";

/**
 * Outfits for Tavi, after the client's Tavvy sheets. Each outfit is split into the layers it lives on,
 * so it sits correctly in front of or behind the body, head and arms:
 *   Back  – behind the torso (backpack)
 *   Body  – over the chest, under the head (strap, lab coat)
 *   Head  – on the head, tilting with it (goggles, glasses, hats)
 *   Prop  – held in the hand; drawn at the grip point (0,0)
 */

export type Outfit = "none" | "school" | "science" | "math" | "history" | "english" | "graduate";

export const outfitHasProp = (o: Outfit) => o === "science" || o === "math" || o === "history" || o === "english" || o === "graduate";

/** Gear outlines: the same ink, a touch lighter than the body's. */
const gear = { ...outlined, strokeWidth: LINE * 1.6 } as const;
const thin = { stroke: C.ink, strokeWidth: 2.2, strokeLinejoin: "round" } as const;

function Sprout({ x, y, size, fill = C.white }: { x: number; y: number; size: number; fill?: string }) {
  return <path transform={`translate(${x} ${y}) scale(${size / 32})`} d={sprout} fill={fill} />;
}

export function OutfitBack({ outfit }: { outfit: Outfit }) {
  if (outfit !== "school") return null;
  return (
    <g>
      <path d="M184 170 C186 158 200 158 203 170" fill="none" stroke={C.forestDeep} strokeWidth={5} strokeLinecap="round" />
      <path d="M170 170 C188 162 210 166 218 180 C226 196 225 226 216 242 C210 252 192 254 176 250Z" fill={C.forest} {...gear} />
      <rect x={196} y={204} width={22} height={28} rx={7} fill={C.forestDeep} {...thin} />
      <Sprout x={200} y={208} size={14} />
    </g>
  );
}

export function OutfitBody({ outfit }: { outfit: Outfit }) {
  switch (outfit) {
    case "school":
      return <path d="M164 168 L175 168 C175 188 177 206 181 224 L171 226 C167 208 164 188 164 168Z" fill={C.forest} {...thin} />;
    case "science":
      return (
        <g>
          {/* An open lab coat over the sides, the belly logo showing between */}
          <path d="M27 160 C23 190 29 220 43 240 C47 243 51 244 55 244 C49 222 46 198 46 176 C45 168 40 162 34 160Z" fill={C.white} {...gear} />
          <path d="M190 160 C193 190 189 214 182 234 C176 241 167 244 158 244 C155 220 154 194 156 170Z" fill={C.white} {...gear} />
          <path d="M40 186 C40 206 43 224 49 238 M160 194 C159 214 160 230 161 240" fill="none" stroke={C.whiteShade} strokeWidth={3} strokeLinecap="round" />
          <rect x={162} y={214} width={17} height={17} rx={3} fill={C.white} {...thin} />
          <rect x={165} y={217} width={11} height={11} rx={2.5} fill={C.brand} />
          <Sprout x={164.5} y={216.5} size={12} />
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
          <path d="M12 113 C44 104 170 104 203 115" fill="none" stroke={C.forest} strokeWidth={7} />
          <rect x={34} y={100} width={130} height={42} rx={19} fill={C.glass} fillOpacity={0.45} stroke={C.ink} strokeWidth={2.4} />
          <rect x={38} y={104} width={122} height={34} rx={15} fill="none" stroke={C.white} strokeOpacity={0.7} strokeWidth={2} />
          <path d="M46 112 L60 107 M48 120 L54 118" stroke={C.white} strokeWidth={3} strokeLinecap="round" />
        </g>
      );
    case "math":
      return (
        <g fill="none" stroke={C.forestDeep} strokeWidth={3}>
          <circle cx={56} cy={118} r={16.5} fill={C.white} fillOpacity={0.15} />
          <circle cx={142} cy={122} r={16.5} fill={C.white} fillOpacity={0.15} />
          <path d="M72 115 Q99 105 126 119" strokeLinecap="round" />
          <path d="M40 114 L14 109 M158.5 119 L202 112" strokeLinecap="round" />
        </g>
      );
    case "history":
      return (
        <g transform="rotate(-6 108 70)">
          <ellipse cx={108} cy={73} rx={94} ry={12} fill={C.khakiDeep} {...gear} />
          <path d="M30 72 C30 -4 186 -4 186 72Z" fill={C.khaki} {...gear} />
          <path d="M31 61 C70 54 146 54 185 61 L186 70 C146 63 70 63 30 70Z" fill={C.forest} />
          <path d="M52 58 C50 40 62 26 80 20" fill="none" stroke={C.white} strokeOpacity={0.45} strokeWidth={5} strokeLinecap="round" />
          <circle cx={108} cy={15} r={4} fill={C.khakiDeep} {...thin} />
        </g>
      );
    case "english":
      return (
        <g>
          <path d="M99 31 L102 19" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
          <path d="M99 31 L102 19" stroke={C.forestDeep} strokeWidth={3.4} strokeLinecap="round" />
          <ellipse cx={96} cy={51} rx={72} ry={22} fill={C.forest} transform="rotate(-10 96 51)" {...gear} />
          <path d="M34 67 C64 74 122 70 158 51" fill="none" stroke={C.forestDeep} strokeWidth={4} strokeLinecap="round" />
          <ellipse cx={76} cy={41} rx={18} ry={4.5} fill={C.white} fillOpacity={0.22} transform="rotate(-12 76 41)" />
        </g>
      );
    case "graduate":
      return (
        <g transform="rotate(-6 108 62)">
          <path d="M62 62 L62 76 C90 89 130 89 154 76 L154 62Z" fill={C.cap} {...gear} />
          <path d="M30 56 L108 31 L188 56 L108 80Z" fill={C.capTop} {...gear} />
          <path d="M56 54 L108 38 L142 48" fill="none" stroke={C.white} strokeOpacity={0.18} strokeWidth={3} strokeLinecap="round" />
          <path d="M108 55 L178 62 L180 94" fill="none" stroke={C.gold} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M174 92 L186 92 L188 110 L172 110Z" fill={C.gold} {...thin} />
          <circle cx={108} cy={55} r={4} fill={C.gold} {...thin} />
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
    <g fill={C.liquid} stroke={C.ink} strokeWidth={1}>
      {[0, 0.6, 1.2].map((delay, i) => (
        <motion.circle
          key={i}
          cx={i === 1 ? 4 : -3}
          r={i === 1 ? 3.4 : 2.6}
          initial={{ cy: -30, opacity: 0 }}
          animate={{ cy: [-30, -54], opacity: [0, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, delay, ease: "easeOut" }}
        />
      ))}
    </g>
  );
}

/** Held item, drawn around the grip point (0,0). `still`: Tavi is resting or off screen, so the flask stops bubbling. */
export function Prop({ outfit, still }: { outfit: Outfit; still: boolean }) {
  switch (outfit) {
    case "science":
      return (
        <g>
          {!still && <Bubbles />}
          <rect x={-5.5} y={-31} width={11} height={16} rx={2} fill={C.glass} {...thin} />
          <path d="M-5.5 -17 L-18 6 C-20 11 -17 15 -12 15 L12 15 C17 15 20 11 18 6 L5.5 -17Z" fill={C.glass} {...thin} />
          <path d="M-12.5 -2 L12.5 -2 L16 6 C17.5 10 15 12.6 11 12.6 L-11 12.6 C-15 12.6 -17.5 10 -16 6Z" fill={C.liquid} />
          <path d="M-9 2 L-12 8" stroke={C.white} strokeWidth={2.4} strokeLinecap="round" opacity={0.7} />
        </g>
      );
    case "math":
      return (
        <g transform="rotate(-28)">
          <rect x={-6} y={-44} width={12} height={50} fill={C.pencil} {...thin} />
          <path d="M-2 -44 V6 M2 -44 V6" stroke={C.goldDeep} strokeWidth={1.2} />
          <rect x={-6} y={-54} width={12} height={9} rx={3} fill={C.eraser} {...thin} />
          <rect x={-6.5} y={-46} width={13} height={5} fill={C.metal} {...thin} />
          <path d="M-6 6 L6 6 L0 21Z" fill={C.paperShade} {...thin} />
          <path d="M-2.2 15.6 L2.2 15.6 L0 21Z" fill={C.ink} />
        </g>
      );
    case "history":
      return (
        <g transform="rotate(-10)">
          <path d="M-24 -18 L-8 -21 L8 -18 L24 -21 L24 15 L8 18 L-8 15 L-24 18Z" fill={C.map} {...thin} />
          <path d="M-8 -21 L-8 15 M8 -18 L8 18" stroke={C.route} strokeOpacity={0.6} strokeWidth={1.4} />
          <path d="M-18 9 C-10 -3 1 7 13 -7" fill="none" stroke={C.route} strokeWidth={2} strokeDasharray="3 3" strokeLinecap="round" />
          <path d="M13 -5 C9 -9 9 -15 13 -15 C17 -15 17 -9 13 -5Z" fill={C.pin} {...thin} strokeWidth={1.4} />
        </g>
      );
    case "english":
      return (
        <g transform="rotate(-8)">
          <rect x={12} y={-20} width={7} height={37} rx={1.5} fill={C.paper} {...thin} />
          <rect x={-17} y={-23} width={33} height={42} rx={3} fill={C.forest} {...thin} />
          <rect x={-17} y={-23} width={6} height={42} rx={2} fill={C.forestDeep} />
          <Sprout x={-7} y={-11} size={18} />
        </g>
      );
    case "graduate":
      return (
        <g transform="rotate(-35)">
          <rect x={-27} y={-8} width={54} height={16} rx={8} fill={C.paper} {...thin} />
          <ellipse cx={-23} cy={0} rx={4} ry={7} fill={C.paperShade} />
          <rect x={-4} y={-8.6} width={8} height={17.2} fill={C.forest} {...thin} strokeWidth={1.4} />
          <path d="M0 -9 C-10 -22 -14 -6 0 -9Z M0 -9 C10 -22 14 -6 0 -9Z" fill={C.forest} {...thin} strokeWidth={1.4} />
        </g>
      );
    default:
      return null;
  }
}


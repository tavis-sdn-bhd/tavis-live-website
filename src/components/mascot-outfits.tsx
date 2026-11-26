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
/** The lab coat has sleeves, which the arms draw over themselves down to the cuff. */
export const outfitHasSleeves = (o: Outfit) => o === "science";

/** Gear outlines: the same ink, a touch lighter than the body's. */
const gear = { ...outlined, strokeWidth: LINE * 1.6 } as const;
const thin = { stroke: C.ink, strokeWidth: 2.2, strokeLinejoin: "round" } as const;

function Sprout({ x, y, size, fill = C.white }: { x: number; y: number; size: number; fill?: string }) {
  return <path transform={`translate(${x} ${y}) scale(${size / 32})`} d={sprout} fill={fill} />;
}

/**
 * The school backpack, after the sheets: worn on the back, so in the 3/4 view it shows past the body's right side,
 * a padded bag with a grab loop on top, a zip round its crown and a pale front pocket with the sprout. The strap
 * is on the body layer.
 */
export function OutfitBack({ outfit }: { outfit: Outfit }) {
  if (outfit !== "school") return null;
  return (
    <g>
      <path d="M204.5 167 C204 155 218 153.5 219.5 166" fill="none" stroke={C.ink} strokeWidth={7.6} strokeLinecap="round" />
      <path d="M204.5 167 C204 155 218 153.5 219.5 166" fill="none" stroke={C.forest} strokeWidth={3.8} strokeLinecap="round" />
      <path d="M170 166 C182 157 206 156 217 167 C226 177 230 199 230 222 C230 240 225 254 212 258 C199 261 185 259 174 254Z" fill={C.forest} {...gear} />
      <path d="M186 166 C198 161 211 163 219 172 C224 180 227 192 228 204" fill="none" stroke={C.forestDeep} strokeWidth={2.6} strokeLinecap="round" />
      <path d="M190 164 C199 161 207 162 213 166" fill="none" stroke={C.white} strokeOpacity={0.3} strokeWidth={3.4} strokeLinecap="round" />
      <path d="M200 210 C211 205 223 207 228 214 C230 228 229 242 223 250 C215 254 205 254 199 250 C196 238 196 222 200 210Z" fill={C.pocket} {...thin} />
      <path d="M199 219 C208 214 220 214 228.6 219" fill="none" stroke={C.ink} strokeWidth={2} strokeLinecap="round" />
      <Sprout x={205} y={226} size={16} fill={C.forest} />
    </g>
  );
}

/** The lab coat's two fronts, open over the belly, under the sleeves the arms draw. */
const coat = {
  left: "M26.5 152 L59 152 C61 176 59 200 57 222 C56 232 55 240 53 247 C46 244 40 237 35 227 C29 213 25.5 194 25.3 176 C25.1 166 25.6 158 26.5 152Z",
  right: "M150 152 L192 152 C197 180 192 212 183 232 C178 240 171 246 152 249 C150.5 228 149.5 206 149.3 186 C149.2 172 149.5 160 150 152Z",
  folds: "M57 166 C51 176 48.5 188 50 200 M152 168 C157 178 159 190 158 204",
};

export function OutfitBody({ outfit }: { outfit: Outfit }) {
  switch (outfit) {
    case "school":
      // The strap comes out from under the jaw, inside the right arm, runs down the chest past a slider and wraps
      // round the side to the bag, narrowing as it turns away.
      return (
        <g>
          <path d="M148.5 182 L163 182 C164.5 195 168.5 206 175 214 C178.5 218.5 182 220.5 185.6 222 L183.3 228.5 C176 227 168 222 162 214 C155 205 150 195 148.5 182Z" fill={C.forest} {...thin} />
          <path d="M151.4 199.6 L166.4 197.2 L168.9 204.2 L154.4 207.2Z" fill={C.forestDeep} {...thin} strokeWidth={1.6} />
        </g>
      );
    case "science":
      return (
        <g>
          {/* An open lab coat over the sides, the belly logo showing between */}
          <path d={coat.left} fill={C.white} {...gear} />
          <path d={coat.right} fill={C.white} {...gear} />
          <path d={coat.folds} fill="none" stroke={C.whiteShade} strokeWidth={3} strokeLinecap="round" />
          <rect x={162} y={212} width={17} height={17} rx={3} fill={C.white} {...thin} />
          <rect x={165} y={215} width={11} height={11} rx={2.5} fill={C.brand} />
          <Sprout x={164.5} y={214.5} size={12} />
        </g>
      );
    default:
      return null;
  }
}

const goggles =
  "M34 116 C34 104 45 99 58 99 C72 99 84 103 99 103.5 C114 104 126 102 140 102 C154 102 163 109 163 119 C163 130 154 136.5 141 136.5 C128 136.5 120 131 112 125.5 C107 122.5 103 121.5 99 121.5 C95 121.5 91 122.5 86 125.5 C79 130 70 133.5 58 133.5 C44 133.5 34 128 34 116Z";

export function OutfitHead({ outfit }: { outfit: Outfit }) {
  switch (outfit) {
    case "science":
      // Safety goggles after the sheets: one clear shield with a lobe over each eye and a notch over the beak, a
      // soft rim, and the strap running back round the head. The glass is faint so the eyes keep their black.
      return (
        <g>
          <path d="M13.2 112 L36 114 M161 117 C177 116 191 113.5 202.8 112" fill="none" stroke={C.ink} strokeWidth={8.4} />
          <path d="M13.2 112 L36 114 M161 117 C177 116 191 113.5 202.8 112" fill="none" stroke={C.forest} strokeWidth={5} />
          <path d={goggles} fill={C.glass} fillOpacity={0.16} stroke={C.ink} strokeWidth={LINE * 2.2} strokeLinejoin="round" />
          <path d={goggles} fill="none" stroke={C.whiteShade} strokeWidth={3.2} strokeLinejoin="round" />
          <path d="M44 109 C48 104 54 102 60 102 M132 106 C137 104.5 143 104.5 148 106" fill="none" stroke={C.white} strokeWidth={3.2} strokeLinecap="round" />
          <path d="M42 120 L45 116" stroke={C.white} strokeOpacity={0.8} strokeWidth={2.4} strokeLinecap="round" />
          <circle cx={99} cy={106.5} r={2} fill={C.whiteShade} stroke={C.ink} strokeWidth={1.2} />
        </g>
      );
    case "math":
      // Round wire glasses after the sheets: lenses wide enough to ring the eye with room to spare, the far one
      // narrower as it turns away, a bridge over the beak, hinges, temples back to the head's edge, and glare.
      return (
        <g fill="none" stroke={C.frame} strokeLinecap="round">
          <circle cx={56} cy={118} r={18.5} fill={C.white} fillOpacity={0.18} strokeWidth={2.8} />
          <ellipse cx={142.5} cy={121.5} rx={16.5} ry={18.5} fill={C.white} fillOpacity={0.18} strokeWidth={2.8} />
          <path d="M74 114.5 C86 107 112 107 126.3 116.5" strokeWidth={2.8} />
          <path d="M37.6 114.5 L13.6 109.5 M158.8 117.5 L201.6 111.5" strokeWidth={2.4} />
          <path d="M37.8 112 L37.6 117.5 M158.7 114.8 L159 120.4" stroke={C.ink} strokeWidth={4} />
          <path d="M44.5 108 C47.5 104.6 51.6 102.8 56 102.6 M133 109 C135.5 106 139 104.4 142.5 104.2" stroke={C.white} strokeOpacity={0.85} strokeWidth={2.6} />
          <path d="M67 127 C68.5 125 69.5 123 70 120.6" stroke={C.white} strokeOpacity={0.6} strokeWidth={2} />
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

/**
 * Held item, drawn around the grip point (0,0), where the fingers close over it: the flask by its neck, the map and
 * the book by their lower edge, the pencil near its point and the diploma beside its ribbon. `still`: Tavi is
 * resting or off screen, so the flask stops bubbling.
 */
export function Prop({ outfit, still }: { outfit: Outfit; still: boolean }) {
  switch (outfit) {
    case "science":
      return (
        <g transform="translate(0 20)">
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
        <g transform="translate(0 -13) rotate(-10)">
          <path d="M-24 -18 L-8 -21 L8 -18 L24 -21 L24 15 L8 18 L-8 15 L-24 18Z" fill={C.map} {...thin} />
          <path d="M-8 -21 L-8 15 M8 -18 L8 18" stroke={C.route} strokeOpacity={0.6} strokeWidth={1.4} />
          <path d="M-18 9 C-10 -3 1 7 13 -7" fill="none" stroke={C.route} strokeWidth={2} strokeDasharray="3 3" strokeLinecap="round" />
          <path d="M13 -5 C9 -9 9 -15 13 -15 C17 -15 17 -9 13 -5Z" fill={C.pin} {...thin} strokeWidth={1.4} />
        </g>
      );
    case "english":
      return (
        <g transform="translate(0 -15) rotate(-8)">
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
          <g transform="translate(-14 0)">
            <rect x={-4} y={-8.6} width={8} height={17.2} fill={C.forest} {...thin} strokeWidth={1.4} />
            <path d="M0 -9 C-10 -22 -14 -6 0 -9Z M0 -9 C10 -22 14 -6 0 -9Z" fill={C.forest} {...thin} strokeWidth={1.4} />
          </g>
        </g>
      );
    default:
      return null;
  }
}


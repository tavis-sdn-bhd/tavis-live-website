"use client";

import { animate, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform, useVelocity, type MotionValue, type SpringOptions } from "motion/react";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import { OutfitBack, OutfitBody, OutfitHead, Prop, outfitHasProp, type Outfit } from "./mascot-outfits";
import { C, LINE, inked, logo, outlined } from "./mascot-palette";
import { cx } from "./ui";
import { easeOutExpo, playful, standard } from "./motion";
import { useAmbientStill, useMotionPaused } from "./motion-pause";

export type { Outfit } from "./mascot-outfits";

/**
 * Tavi, the Tavis dolphin, redrawn in code from the client's Tavvy character sheets: a squat egg of a head on a
 * bean body that tapers to stubby legs, with the face low and to the left.
 *
 * Built as a rig, not a set of drawings. Each arm is one limb that turns about a shoulder on the body's side, below
 * the jaw, and changing mood swings it there on a spring. The arm's outline is drawn twice: once behind the body,
 * so its outer edge runs on into the body's outline at any angle, and once on top, fading out toward the shoulder,
 * so the arm reads against the face and belly while the joint itself shows no line (as in the sheets). A held prop
 * rides in the hand and stays upright. The head tilts about the neck, the fin follows a beat late, the tail sways,
 * and the body breathes with the feet planted. One light source shades every mint part, so parts that move over
 * each other match.
 */

export type Mood = "idle" | "wave" | "cheer" | "sad" | "think" | "swim" | "thumbs" | "go";

/**
 * How many Tavis are on screen, not counting the roaming companion. There is
 * one Tavi, so the companion steps aside whenever another one is visible.
 */
let onStage = 0;
const stageListeners = new Set<() => void>();
function enterStage() {
  onStage += 1;
  stageListeners.forEach((l) => l());
  return () => {
    onStage -= 1;
    stageListeners.forEach((l) => l());
  };
}
function subscribeStage(listener: () => void) {
  stageListeners.add(listener);
  return () => stageListeners.delete(listener);
}
export function useTaviOnStage() {
  return useSyncExternalStore(subscribeStage, () => onStage > 0, () => false);
}

type EyeState = "open" | "happy" | "wink" | "sad";
type MouthShape = "grin" | "smile" | "frown" | "o";
type Point = { x: number; y: number };
/** The sheets' hands: a relaxed mitt, an open palm with the thumb out ("hi"), a fist, and a fist with the thumb up. */
type Hand = "mitt" | "open" | "fist" | "thumb";

type Pose = {
  eyes: readonly [left: EyeState, right: EyeState];
  mouth: MouthShape;
  /** Head tilt in degrees about the neck; positive turns clockwise. */
  tilt: number;
  /** Arm angles in degrees from hanging straight down; positive swings the hand toward screen left. */
  arms: readonly [left: number, right: number];
  hands: readonly [left: Hand, right: Hand];
  /** Yellow strokes by the raised hands. */
  burst: boolean;
};

/**
 * Each mood as one row. wave ("hi"), cheer ("yay"), thumbs ("you can do it") and go ("let's go") are the sheets' own
 * poses; sad, think and swim are drawn to match.
 */
const poses: Record<Mood, Pose> = {
  idle: { eyes: ["open", "open"], mouth: "smile", tilt: 0, arms: [18, -18], hands: ["mitt", "mitt"], burst: false },
  wave: { eyes: ["open", "wink"], mouth: "grin", tilt: 4, arms: [162, -18], hands: ["open", "mitt"], burst: true },
  cheer: { eyes: ["happy", "happy"], mouth: "grin", tilt: 0, arms: [146, -146], hands: ["open", "open"], burst: true },
  sad: { eyes: ["sad", "sad"], mouth: "frown", tilt: -4, arms: [4, -4], hands: ["mitt", "mitt"], burst: false },
  // Hand to the cheek: "hmm".
  think: { eyes: ["open", "open"], mouth: "o", tilt: -5, arms: [18, -160], hands: ["mitt", "fist"], burst: false },
  swim: { eyes: ["open", "wink"], mouth: "grin", tilt: 0, arms: [58, -58], hands: ["open", "open"], burst: false },
  // Thumb up beside the face, the other hand on the hip.
  thumbs: { eyes: ["open", "wink"], mouth: "grin", tilt: 3, arms: [168, -26], hands: ["thumb", "mitt"], burst: true },
  // One fist up by the face, the other pumped at the chest.
  go: { eyes: ["open", "wink"], mouth: "grin", tilt: 2, arms: [150, 60], hands: ["fist", "fist"], burst: true },
};
/** The right arm when it holds a prop and its pose would let it hang: across the belly. */
const HOLD = 18;

const THINK_GAZE = { x: -3, y: -3 };

/**
 * The box runs from x −17 (where the first, longer arms' cheering hand reached) to the tail tip (x 264) at the old
 * 260:300 aspect, so callers' layouts keep their shape and renders that clip to the viewBox (the port's OG cards)
 * lose nothing. Swimming arms reach past it; browsers draw the overflow.
 */
const VIEWBOX = "-17 -25 288 332.3";
/** Mirrors the drawing about the box's centre line (x 127). */
const MIRROR = "translate(254 0) scale(-1 1)";
/** Turns the belly logo back about its own centre line (x 99.5), so a mirrored Tavi's logo still reads. */
const LOGO_UNMIRROR = "translate(199 0) scale(-1 1)";

/* ── Joints ─────────────────────────────────────────────────────────────── */

const joints = {
  neck: { x: 107, y: 180 },
  fin: { x: 172, y: 62 },
  tail: { x: 172, y: 242 },
  /**
   * On the body's sides, level with the jaw: the arm's root bulges a little past the side, as a shoulder. As high as
   * the sheets', so the short arm still lifts its hand to the eyes.
   */
  leftShoulder: { x: 34, y: 177 },
  rightShoulder: { x: 182, y: 177 },
  feet: { x: 115, y: 288 },
} satisfies Record<string, Point>;

/** A CSS transform pivot in drawing units: it resolves in the part's own coordinates (checked in Chrome). */
const at = (p: Point) => ({ originX: `${p.x}px`, originY: `${p.y}px`, transformBox: "view-box" }) as const;
/**
 * The same turn as an SVG attribute. In a browser the animated CSS transform overrides it. resvg can't read CSS
 * turns, so the port's OG cards strip them and draw each pose from this.
 */
const rot = (deg: number, p: Point) => `rotate(${deg} ${p.x} ${p.y})`;

/**
 * The arm is a damped rotor about its shoulder. The short arm keeps less of its mass far from the joint, so its
 * moment of inertia is about 0.6 of the long one's (mass 0.9 → 0.55): with the same stiffness it swings quicker,
 * ω = √(k/m) ≈ 17.6 rad/s. Damping ratio ζ = c / 2√(km) ≈ 0.67 lets a pose change overshoot about 6%: on the
 * largest upward swing (sad to thumbs, 164°) that is 10°, which leaves the raised thumb's tip about 24 units from
 * the eye's centre (ζ ≈ 0.62 let it graze the eye).
 */
const armSpring: SpringOptions = { stiffness: 170, damping: 13, mass: 0.55 };
/**
 * Flesh on the arm: a fast swing stretches it along its length (the centripetal pull grows with ω², so
 * `stretchPerOmega2` is per rad²/s²) and it thins to keep its volume, then the stretch rings out on an underdamped
 * spring (ζ ≈ 0.47), the jiggle that makes a chubby arm read as soft.
 */
const flesh = { stretchPerOmega2: 0.0003, maxStretch: 0.1, spring: { stiffness: 420, damping: 13.5, mass: 0.47 } satisfies SpringOptions };
/** Hand-arc lengths are kept from the long arm, so loops turn the short arm further, and quicker as a pendulum: T ∝ √L. */
const ARC = 56 / Math.hypot(3.5, 35);
const headSpring: SpringOptions = { stiffness: 220, damping: 18 };
/** Softer and bouncier than the head, so the fin lags and settles after it. */
const finSpring: SpringOptions = { stiffness: 120, damping: 7 };

/**
 * How far an arm turning at `angle` is stretched by its own swing: 1 at rest, up to 1 + `flesh.maxStretch`.
 * With reduced motion it stays 1.
 */
function useFlesh(angle: MotionValue<number>, reduce: boolean | null) {
  const speed = useVelocity(angle);
  const pull = useTransform(speed, (v) => (reduce ? 1 : 1 + Math.min(flesh.maxStretch, flesh.stretchPerOmega2 * ((v * Math.PI) / 180) ** 2)));
  return useSpring(pull, flesh.spring);
}

/** A spring that follows `target`; with reduced motion it jumps. */
function useSprung(target: number, options: SpringOptions, reduce: boolean | null) {
  const value = useSpring(target, options);
  useEffect(() => {
    if (reduce) value.jump(target);
    else value.set(target);
  }, [target, reduce, value]);
  return value;
}

type Props = {
  mood?: Mood;
  /** Eyes follow the pointer. */
  follow?: boolean;
  className?: string;
  title?: string;
  /** Pure ornament: hidden from assistive tech. */
  decorative?: boolean;
  /** What Tavi is wearing. Props are held in the right hand. */
  outfit?: Outfit;
  /** Pins the eyes to an offset (about ±3.5 per axis), overriding `follow`. */
  look?: { x: number; y: number };
  /** The scroll companion: doesn't count as Tavi being on stage. */
  roaming?: boolean;
  /** Which way Tavi faces. The drawing faces left; `right` mirrors it, with the belly logo turned back to read. */
  facing?: "left" | "right";
};

function useBlink(enabled: boolean) {
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let wait: number;
    let open: number;
    const loop = () => {
      wait = window.setTimeout(() => {
        setClosed(true);
        open = window.setTimeout(() => setClosed(false), 130);
        loop();
      }, 2600 + Math.random() * 2600);
    };
    loop();
    return () => {
      window.clearTimeout(wait);
      window.clearTimeout(open);
      setClosed(false);
    };
  }, [enabled]);
  return closed;
}

type Gaze = { x: MotionValue<number>; y: MotionValue<number> };

/**
 * Eye offset as springs. Pointer moves write motion values directly, so
 * following the cursor never re-renders the SVG. `fixed` pins the gaze
 * (e.g. looking up while thinking).
 */
/** `flip` is -1 when the drawing is mirrored: the eyes move in drawing units, so screen x runs backwards there. */
function useGaze(follow: boolean, ref: RefObject<SVGSVGElement | null>, fixed: { x: number; y: number } | null, flip: 1 | -1): Gaze {
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  // Eyes chase a moving pointer, so they land without overshoot: a bouncy spring reads as jitter.
  const x = useSpring(tx, standard);
  const y = useSpring(ty, standard);

  useEffect(() => {
    if (fixed) {
      tx.set(fixed.x * flip);
      ty.set(fixed.y);
      return;
    }
    tx.set(0);
    ty.set(0);
    if (!follow) return;
    let rect: DOMRect | null = null;
    const invalidate = () => (rect = null);
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      rect ??= el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width * 0.4);
      const dy = e.clientY - (rect.top + rect.height * 0.43);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 260);
      tx.set((dx / d) * 3.4 * k * flip);
      ty.set((dy / d) * 2.8 * k);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
    };
  }, [follow, ref, fixed?.x, fixed?.y, flip, tx, ty]);

  return { x, y };
}

/* ── Shapes ─────────────────────────────────────────────────────────────── */

/**
 * A squat egg, widest low at the cheeks. Its underside hides in the body; on the left it lifts into a jaw that
 * ends above the resting arm, so the throat below is the body's and the arm passes in front of it.
 */
const headShape =
  "M105 42 C155 42 194 72 201 110 C205 132 203 152 194 168 C176 188 150 194 108 194 C82 194 64 191 59 184 C56 178 55 172 50 169 C42 165 32 166 24 168 C14 154 9 132 13 110 C20 72 56 42 105 42Z";
/** The head's outline stops where the jaw meets the shoulders; the arms and body carry it on from there. */
const headEdge = "M23.5 169 C14 154 9 132 13 110 C20 72 56 42 105 42 C155 42 194 72 201 110 C205 132 203 152 194 168";
/** White muzzle and chin, running on into the belly; it keeps off both shoulders, so the arms come out from under mint. */
const faceWhite =
  "M21 141 C28 135 44 133 55 136.5 C58 142 62 145 67 144 C88 139 112 140 130 149 C135 148.5 139 146.5 141 143.5 C150 140 156 139 162 141 C166 152 160 166 156 176 C154 182 153 188 152 194 L62 194 C59 190 57 184 56 178 C55 173 52 170 47 168 C38 164 28 156 21 141Z";
const fin = "M114 52 C126 36 146 22 166 17 C174 15 178 19 176 27 C173 38 172 52 176 68Z";
/** A bean that tapers from under the head to two stubby legs. */
const body =
  "M28 150 L190 150 C196 180 190 212 182 232 C178 242 176 252 176 262 C176 270 178 276 179 280 C181 285 178 288 173 288 L139 288 C135 288 133 285 133 281 C132 272 131 262 127 256 C121 251 111 251 104 256 C100 262 99 272 98 281 C98 285 96 288 92 288 L62 288 C57 288 54 285 56 280 C58 276 59 270 59 262 C58 252 54 244 47 236 C35 218 27 196 26 176 C25.5 168 26 158 28 150Z";
const belly =
  "M36 150 L156 150 C152 180 150 210 151 236 C152 252 156 262 159 272 C161 280 161 286 160 288.3 L139 288 C135 288 133 285 133 281 C132 272 131 262 127 256 C121 251 111 251 104 256 C100 262 99 272 98 281 C98 285 96 288 92 288 L62 288 C57 288 54 285 56 280 C58 276 59 270 59 262 C58 252 54 244 48 237 C41 222 37 196 37 176Z";
const soles = "M56 280 C54 285 57 288 62 288 L92 288 C96 288 98 285 98 281 C86 276 68 276 56 280Z M133 281 C133 285 135 288 139 288 L160 288.3 L160 278 C151 276 140 277 133 281Z";
const tail =
  "M166 228 C182 230 196 226 205 216 C206 204 214 194 228 190 C232 189 235 189 236 191 C236 201 232 211 227 219 C239 216 252 220 260 228 C265 234 259 243 248 247 C236 253 222 252 212 247 C200 251 186 254 174 253 L164 250Z";

/**
 * One arm, hanging from its shoulder at (0,0), with +x toward the body. Proportioned on the sheets' relaxed arms:
 * about 1.4 times as long as it is wide (the first rig's was 2.6), so it ends at the hip rather than the crotch.
 * A thick root narrows a little, then swells into a round mitt wider than the wrist, tucked toward the body as a
 * slight bend.
 */
const arm = {
  shine: "M-12 11 C-13 18 -13.2 24 -12.4 30",
  /** The mitt's centre: a held prop is drawn here. */
  hand: { x: 3.5, y: 35 },
};

/**
 * The whole limb's outline for each hand. Every outline runs the same commands (the outer side, five segments
 * round the hand, the inner side, the cap over the shoulder), so a change of hand morphs one into the next instead
 * of swapping drawings. `lines` are the creases inside the hand.
 */
const hands: Record<Hand, { outline: string; lines: string }> = {
  mitt: {
    outline: "M-17 0 C-17 10 -16.5 16 -17 23 C-17.5 34 -13 50 4 50 C12 50 17 47 19.6 42 C21.6 38.5 22 32.5 21.5 27 C21 23 19 19 18 15 C17 10.5 16.8 5 17 0 C17 -10 -17 -10 -17 0Z",
    // Where the thumb meets the hand, on the side toward the body.
    lines: "M15 41.5 C18.5 39 20 35 19.3 30.5",
  },
  // Wider and flatter, palm out. Its thumb stands off the outer side, which faces up once the arm is lifted past
  // horizontal: at the face when raised (wave, cheer), upward when held out (swim), as in the sheets.
  open: {
    outline: "M-17 0 C-17 8 -17 14 -18 19 C-24 19.5 -29 22 -27.5 27.5 C-26 33 -22 37 -18.5 37 C-20 44 -16 56 -1 56 C9 56 15 52 18 46 C21 38 18.5 14 17 0 C17 -10 -17 -10 -17 0Z",
    lines: "M-18.5 37 C-16.3 34.5 -15.6 31 -16 27.5",
  },
  // A ball, smaller than the mitt: knuckles at the end and the thumb folded across them.
  fist: {
    outline: "M-17 0 C-17 10 -16.5 16 -17 23 C-17.5 33 -16 46 -6 49 C0 51 8 51 13 48.5 C18 46 21.5 41 21.5 35 C21.5 29 20 24 18.5 18 C17.5 13 16.8 6 17 0 C17 -10 -17 -10 -17 0Z",
    lines: "M-7 46.5 C-6 44 -6.3 41.5 -7.5 40 M1.5 48.5 C2.3 46 2 43.5 0.8 42 M19.5 31 C13 30.5 7 33 3.5 37.5",
  },
  // The fist with a big thumb out past it, along the arm and leaning 12° to the outer side, so the raised arm in
  // `thumbs` (168°) holds it upright.
  thumb: {
    outline: "M-17 0 C-17 10 -16.5 16 -17 23 C-17.5 33 -12.5 42 -11 48 C-10 56 -9.5 70.5 -4 70.5 C1.5 70.5 2.5 60 3 52 C10 52.5 22 44 21.5 33 C21 24 16.8 9 17 0 C17 -10 -17 -10 -17 0Z",
    lines: "M-9.5 50.5 C-5.5 49 -1 49.5 2.5 52 M10.5 51 C10 48.5 10.3 46 11.5 44.5",
  },
};
const handMorph = { duration: 0.16, ease: easeOutExpo } as const;
/** The right hand, which holds props: the right arm is the left one mirrored. */
const grip = { x: -arm.hand.x, y: arm.hand.y };
/**
 * The top outline fades out over the arm's root, between these depths below the shoulder, so the joint shows no
 * line while the sides keep theirs almost to the shoulder. (A fade by radius left the root's sides unlined for 22
 * units, a smudge where a chubby arm crosses the white belly.)
 */
const shoulderFade = { from: 2, to: 9 } as const;

/* ── Face ───────────────────────────────────────────────────────────────── */

const eyes = { left: { x: 56, y: 118 }, right: { x: 142, y: 122 } } as const;

function Eye({ x, y, state, closed, gaze, side }: { x: number; y: number; state: EyeState; closed: boolean; gaze: Gaze; side: "left" | "right" }) {
  if (state === "happy") {
    return <path d={`M${x - 10} ${y + 3.5} Q${x} ${y - 11.5} ${x + 10} ${y + 3.5}`} fill="none" stroke={C.eye} strokeWidth={4.6} strokeLinecap="round" />;
  }
  if (state === "wink") {
    return (
      <path
        d={`M${x + 9} ${y - 7.5} Q${x - 3} ${y - 3} ${x - 11} ${y + 2} Q${x - 2} ${y + 5} ${x + 10.5} ${y + 9}`}
        fill="none"
        stroke={C.eye}
        strokeWidth={4.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }
  // A worried brow: its inner end, toward the beak, sits higher.
  const brow = side === "left" ? `M${x - 11} ${y - 14} L${x + 9} ${y - 20}` : `M${x - 9} ${y - 20} L${x + 11} ${y - 14}`;
  return (
    <>
      <motion.g style={{ x: gaze.x, y: gaze.y }}>
        <motion.g animate={{ scaleY: closed ? 0.08 : 1 }} transition={{ duration: 0.08, ease: easeOutExpo }}>
          <ellipse cx={x} cy={y} rx={10} ry={11.8} fill={C.eye} />
          <circle cx={x - 3} cy={y - 5.2} r={3.9} fill={C.white} />
          <circle cx={x + 3.6} cy={y + 5.4} r={1.6} fill={C.white} opacity={0.85} />
        </motion.g>
      </motion.g>
      {state === "sad" && <path d={brow} fill="none" stroke={C.crease} strokeWidth={3.4} strokeLinecap="round" />}
    </>
  );
}

const mouthTop = "M67 144 C88 139 112 140 130 149";
/** Open mouths share one structure, so a change of mood opens or closes the mouth instead of swapping it. */
const openMouths = {
  grin: {
    lip: `${mouthTop} C127 166 113 178 97 178 C80 178 69 163 67 144Z`,
    tongue: "M75 164 C84 153 112 152 122 163 C116 173 107 178 97 178 C87 178 80 172 75 164Z",
  },
  smile: {
    lip: `${mouthTop} C125 158 113 166 98 166 C82 166 71 157 67 144Z`,
    tongue: "M79 157 C87 151 108 150 116 156 C110 162 104 166 98 166 C90 166 84 162 79 157Z",
  },
};
const mouthMove = { duration: 0.28, ease: easeOutExpo } as const;

function Mouth({ shape }: { shape: MouthShape }) {
  if (shape === "frown") return <path d="M82 159 Q99 147 116 159" {...inked} />;
  if (shape === "o") return <ellipse cx={101} cy={155} rx={5.5} ry={6.5} fill={C.mouth} {...outlined} strokeWidth={LINE * 1.6} />;
  const open = openMouths[shape];
  return (
    <g>
      <motion.path initial={false} animate={{ d: open.lip }} transition={mouthMove} fill={C.mouth} />
      <motion.path initial={false} animate={{ d: open.tongue }} transition={mouthMove} fill={C.tongue} />
      <motion.path initial={false} animate={{ d: open.lip }} transition={mouthMove} {...inked} strokeWidth={LINE * 0.86} />
      <path d="M55 136.5 C58 142 62 145 67 144 M130 149 C135 148.5 139 146.5 141 143.5" {...inked} strokeWidth={LINE * 0.86} />
      <circle cx={55} cy={136.3} r={1.9} fill={C.ink} />
      <circle cx={141.1} cy={143.3} r={1.9} fill={C.ink} />
    </g>
  );
}

/* ── Limbs ──────────────────────────────────────────────────────────────── */

type ArmPass = "ink" | "fill";

/**
 * One arm, drawn in one of its two passes. Both passes read the same motion values, so they never part.
 * `ink`: the outline as a solid shape, placed behind the body, so outside the body it rims the arm and inside it
 * hides, which joins the arm's outer edge to the body's outline. `fill`: the arm itself, over the body and head,
 * with a top outline that fades out near the shoulder.
 */
function Arm({ side, pass, hand, reduce, angle, stretch, rest, paint, fade, children }: { side: "left" | "right"; pass: ArmPass; hand: Hand; reduce: boolean | null; angle: MotionValue<number>; stretch: MotionValue<number>; rest: number; paint: string; fade: string; children?: ReactNode }) {
  const outline = { initial: false, animate: { d: hands[hand].outline }, transition: reduce ? { duration: 0 } : handMorph } as const;
  // A hand's creases only fit its own outline, so they wait out the morph rather than hang outside the hand.
  const [settled, setSettled] = useState(hand);
  useEffect(() => {
    const t = window.setTimeout(() => setSettled(hand), reduce ? 0 : handMorph.duration * 1000);
    return () => window.clearTimeout(t);
  }, [hand, reduce]);
  const shoulder = side === "left" ? joints.leftShoulder : joints.rightShoulder;
  // Volume kept: a limb stretched by s along its length thins by √s across it. The right arm is mirrored as well,
  // and the CSS scale replaces the attribute's mirror in a browser, so it carries the sign.
  const mirror = side === "right" ? -1 : 1;
  const across = useTransform(stretch, (s) => mirror / Math.sqrt(s));
  // What the hand holds moves out with the stretched hand, without being stretched itself.
  const handShift = useTransform(stretch, (s) => (s - 1) * arm.hand.y);
  return (
    <motion.g transform={rot(rest, shoulder)} style={{ ...at(shoulder), rotate: angle }}>
      <g transform={`translate(${shoulder.x} ${shoulder.y})`}>
        {/* The right arm is the left one mirrored, so its thumb also faces the body */}
        <motion.g transform={side === "right" ? "scale(-1 1)" : undefined} style={{ ...at({ x: 0, y: 0 }), scaleX: across, scaleY: stretch }}>
          {pass === "ink" ? (
            <motion.path {...outline} fill={C.ink} stroke={C.ink} strokeWidth={LINE * 2} strokeLinejoin="round" />
          ) : (
            <>
              <motion.path {...outline} fill="none" stroke={C.ink} strokeWidth={LINE * 2} strokeLinejoin="round" mask={fade} />
              <motion.path {...outline} fill={paint} />
              <path d={arm.shine} fill="none" stroke={C.white} strokeOpacity={0.5} strokeWidth={3.4} strokeLinecap="round" />
              {settled === hand && <path d={hands[hand].lines} {...inked} strokeWidth={LINE * 0.8} />}
            </>
          )}
        </motion.g>
        {children && <motion.g style={{ y: handShift }}>{children}</motion.g>}
      </g>
    </motion.g>
  );
}

type Loop = { keyframes: number[]; duration: number; repeatDelay?: number } | null;

/** A looping offset, as a motion value that every layer can read. `null` settles it back to 0. */
function useLoop(loop: Loop) {
  const value = useMotionValue(0);
  const key = loop ? `${loop.keyframes.join()}/${loop.duration}/${loop.repeatDelay ?? 0}` : "";
  useEffect(() => {
    const controls = loop
      ? animate(value, loop.keyframes, { duration: loop.duration, repeat: Infinity, repeatDelay: loop.repeatDelay ?? 0, ease: "easeInOut" })
      : animate(value, 0, playful);
    return () => controls.stop();
    // `key` stands for `loop`: a new object each render with the same numbers is the same loop.
  }, [key, value]);
  return value;
}

/* ── Tavi ───────────────────────────────────────────────────────────────── */

export function Mascot({ mood = "idle", follow = false, className, title = "Tavi, the Tavis dolphin", decorative = false, outfit = "none", look, roaming = false, facing = "left" }: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const uid = useId().replace(/[^\w-]/g, "");
  // Gradient and mask ids are per instance: a page holds many Tavis, and some sit in hidden subtrees.
  const id = (name: string) => `${uid}-${name}`;
  // Not a template literal: the port's i18n scanner reads a template with a word in it as copy to translate.
  const paint = (name: string) => "url(#" + id(name) + ")";
  // Loops and listeners only run while Tavi is on screen and the visitor is around and hasn't paused animations.
  // A resting Tavi holds its pose and keeps blinking (not when paused), which costs a few frames every few seconds.
  const inView = useInView(ref);
  const ambientStill = useAmbientStill();
  const paused = useMotionPaused();
  const still = ambientStill || !inView;
  const blink = useBlink(!reduce && !paused && inView && mood !== "cheer");
  const mirrored = facing === "right";
  const gaze = useGaze(follow && !still, ref, look ?? (mood === "think" ? THINK_GAZE : null), mirrored ? -1 : 1);
  useEffect(() => (roaming || !inView ? undefined : enterStage()), [roaming, inView]);

  const pose = poses[mood];
  const hasProp = outfitHasProp(outfit);
  const holding = hasProp && Math.abs(pose.arms[1]) < 30;
  const leftTarget = pose.arms[0];
  const rightTarget = holding ? HOLD : pose.arms[1];
  const finTarget = -pose.tilt * 0.8 + (mood === "sad" ? -8 : 0);
  const live = !still && !reduce;
  const cheering = live && mood === "cheer";
  const hop = { duration: 0.62, repeat: Infinity, repeatDelay: 0.22, ease: "easeOut" } as const;

  // Poses ride springs; loops ride on top. Every layer of a part reads the same values.
  const leftPose = useSprung(leftTarget, armSpring, reduce);
  const rightPose = useSprung(rightTarget, armSpring, reduce);
  // Cheer and swim keep their timing, which the hop and the stroke set; only the free wave swings at the arm's own rate.
  // A thumbs-up nudges the thumb at the viewer now and then; "let's go" punches both fists in short beats.
  const leftSwing = useLoop(
    !live ? null
    : mood === "wave" ? { keyframes: [0, -14 * ARC, 0], duration: 0.75 / Math.sqrt(ARC) }
    : mood === "cheer" ? { keyframes: [0, 10 * ARC, 0], duration: 0.62, repeatDelay: 0.22 }
    : mood === "swim" ? { keyframes: [0, 16 * ARC, 0], duration: 0.55 }
    : mood === "thumbs" ? { keyframes: [0, 5 * ARC, 0], duration: 0.5, repeatDelay: 1.4 }
    : mood === "go" ? { keyframes: [0, 9 * ARC, 0], duration: 0.42, repeatDelay: 0.18 }
    : null,
  );
  const rightSwing = useLoop(
    !live ? null
    : mood === "cheer" ? { keyframes: [0, -10 * ARC, 0], duration: 0.62, repeatDelay: 0.22 }
    : mood === "swim" ? { keyframes: [0, -16 * ARC, 0], duration: 0.55 }
    : mood === "go" ? { keyframes: [0, 6 * ARC, 0], duration: 0.42, repeatDelay: 0.18 }
    : null,
  );
  const leftArm = useTransform(() => leftPose.get() + leftSwing.get());
  const rightArm = useTransform(() => rightPose.get() + rightSwing.get());
  const leftFlesh = useFlesh(leftArm, reduce);
  const rightFlesh = useFlesh(rightArm, reduce);
  // The prop counter-turns against the arm, so it stays upright in the hand at any angle.
  const propTurn = useTransform(() => -rightArm.get());
  const tilt = useSprung(pose.tilt, headSpring, reduce);
  const finTurn = useSprung(finTarget, finSpring, reduce);
  // Breathing: the body swells from the feet while everything above it rises with the chest.
  const breath = useLoop(live && mood !== "cheer" && mood !== "swim" ? { keyframes: [0, 1, 0], duration: 3.2 } : null);
  const chestRise = useTransform(breath, (b) => -1.8 * b);
  const swell = useTransform(breath, (b) => 1 + 0.014 * b);

  const skin = paint("skin");
  const fade = paint("fade");
  const arms = (pass: ArmPass) => (
    <>
      <Arm side="left" pass={pass} hand={pose.hands[0]} reduce={reduce} angle={leftArm} stretch={leftFlesh} rest={leftTarget} paint={skin} fade={fade} />
      <Arm side="right" pass={pass} hand={hasProp ? "fist" : pose.hands[1]} reduce={reduce} angle={rightArm} stretch={rightFlesh} rest={rightTarget} paint={skin} fade={fade}>
        {pass === "fill" && hasProp && (
          <motion.g transform={rot(-rightTarget, grip)} style={{ ...at(grip), rotate: propTurn }}>
            <g transform={`translate(${grip.x} ${grip.y + 2})`}>
              <Prop outfit={outfit} still={still} />
            </g>
          </motion.g>
        )}
      </Arm>
    </>
  );

  return (
    <svg
      ref={ref}
      viewBox={VIEWBOX}
      overflow="visible"
      className={cx("select-none", className)}
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-labelledby": titleId })}
    >
      {!decorative && <title id={titleId}>{title}</title>}
      <defs>
        {/* One light from the upper left for every mint part, in drawing units, so parts that move over each other match */}
        <radialGradient id={id("skin")} gradientUnits="userSpaceOnUse" cx={82} cy={78} r={205}>
          <stop offset={0} stopColor={C.skinLight} />
          <stop offset={0.35} stopColor={C.skin} />
          <stop offset={0.68} stopColor={C.skinMid} />
          <stop offset={0.88} stopColor={C.skinShade} />
          <stop offset={1} stopColor={C.skinEdge} />
        </radialGradient>
        {/* In each arm's own coordinates: hides the top outline over the shoulder, shows it below */}
        <linearGradient id={id("fadeRamp")} gradientUnits="userSpaceOnUse" x1={0} y1={shoulderFade.from} x2={0} y2={shoulderFade.to}>
          <stop offset={0} stopColor="#000" />
          <stop offset={1} stopColor="#fff" />
        </linearGradient>
        <mask id={id("fade")} maskUnits="userSpaceOnUse" x={-40} y={-40} width={80} height={130}>
          <rect x={-40} y={-40} width={80} height={130} fill={paint("fadeRamp")} />
        </mask>
      </defs>

      <g transform={mirrored ? MIRROR : undefined}>
        {mood !== "swim" && (
          <motion.ellipse
            cx={116}
            cy={288}
            rx={86}
            ry={8}
            fill={C.shadow}
            fillOpacity={0.13}
            style={at(joints.feet)}
            animate={cheering ? { scaleX: [1, 0.78, 1] } : { scaleX: 1 }}
            transition={cheering ? hop : playful}
          />
        )}

        {/* Every loop needs a resting target: an empty `animate` would leave a repeating animation running. */}
        <motion.g
          animate={cheering ? { y: [0, -16, 0] } : mood === "swim" && live ? { y: [0, -4, 0] } : { y: 0 }}
          transition={cheering ? hop : mood === "swim" && live ? { duration: 0.55, repeat: Infinity, ease: "easeInOut" } : playful}
        >
          <motion.g
            style={at(joints.tail)}
            animate={!live ? { rotate: 0 } : mood === "swim" ? { rotate: [-9, 12, -9] } : cheering ? { rotate: [0, 9, 0] } : { rotate: [0, 6, 0] }}
            transition={!live ? playful : mood === "swim" ? { duration: 0.55, repeat: Infinity, ease: "easeInOut" } : cheering ? hop : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <path d={tail} fill={skin} {...outlined} />
            <path d="M170 251 C188 251 202 248 212 244 C204 249 188 254 172 254.5Z" fill={C.white} />
            <path d="M214 200 C219 195 224 192 229 191" fill="none" stroke={C.white} strokeOpacity={0.6} strokeWidth={3} strokeLinecap="round" />
          </motion.g>

          <OutfitBack outfit={outfit} />

          <motion.g style={{ y: chestRise }}>{arms("ink")}</motion.g>

          <motion.g style={{ ...at(joints.feet), scaleY: swell }}>
            <path d={body} fill={skin} {...outlined} />
            <path d={belly} fill={C.white} />
            <path d={soles} fill={C.whiteShade} />
            <path d="M81 253 C94 250 111 250 126 254" {...inked} />
            {/* The real logo as paths, so it reads the same in every renderer, fonts or not */}
            <g transform={`${mirrored ? LOGO_UNMIRROR : ""} translate(55 204) scale(${23 / logo.height})`}>
              <path d={logo.chip} fill={C.brand} />
              <path d={logo.word} fill={C.word} />
            </g>
            <OutfitBody outfit={outfit} />
          </motion.g>

          <motion.g style={{ y: chestRise }}>
            <motion.g transform={rot(pose.tilt, joints.neck)} style={{ ...at(joints.neck), rotate: tilt }} animate={{ y: mood === "sad" ? 3 : 0 }} transition={playful}>
              <motion.g transform={rot(finTarget, joints.fin)} style={{ ...at(joints.fin), rotate: finTurn }}>
                <motion.g style={at(joints.fin)} animate={cheering ? { rotate: [0, -7, 3, 0] } : { rotate: 0 }} transition={cheering ? hop : playful}>
                  <path d={fin} fill={C.fin} {...outlined} />
                  <path d="M148 31 C156 25 164 21 171 21" fill="none" stroke={C.white} strokeOpacity={0.6} strokeWidth={4} strokeLinecap="round" />
                </motion.g>
              </motion.g>
              <path d={headShape} fill={skin} />
              <path d={faceWhite} fill={C.white} />
              <path d="M20 128 C18 100 34 72 62 56" fill="none" stroke={C.rim} strokeWidth={5} strokeLinecap="round" opacity={0.85} />
              <path d={headEdge} {...inked} />
              <ellipse cx={80} cy={62} rx={20} ry={7} fill={C.white} fillOpacity={0.6} transform="rotate(-14 80 62)" />
              <ellipse cx={54} cy={76} rx={3.5} ry={2.2} fill={C.white} fillOpacity={0.6} transform="rotate(-34 54 76)" />

              {/* Beak: a soft bump above the mouth with a crease along its top */}
              <path d="M74 131 C77 117 116 115 120 134 C108 126 86 125 74 131Z" fill={C.skinMid} />
              <path d="M76 130 Q97 118 118 133" fill="none" stroke={C.crease} strokeWidth={2.4} strokeLinecap="round" />

              <Eye {...eyes.left} side="left" state={pose.eyes[0]} closed={blink} gaze={gaze} />
              <Eye {...eyes.right} side="right" state={pose.eyes[1]} closed={blink} gaze={gaze} />

              <ellipse cx={34} cy={134} rx={10} ry={6.5} fill={C.cheek} opacity={0.9} />
              <ellipse cx={166} cy={141} rx={10.5} ry={7} fill={C.cheek} opacity={0.9} />

              <Mouth shape={pose.mouth} />
              <OutfitHead outfit={outfit} />
            </motion.g>

            {arms("fill")}
          </motion.g>

          {pose.burst && (
            <motion.g initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={playful} stroke={C.sun} strokeWidth={5.5} strokeLinecap="round">
              {mood === "cheer" ? (
                <>
                  <path d="M-23 118 L-11 118" />
                  <path d="M-19 94 L-8 102" />
                  <path d="M-5 74 L1 87" />
                  <path d="M239 118 L227 118" />
                  <path d="M235 94 L224 102" />
                  <path d="M221 74 L215 87" />
                </>
              ) : (
                <>
                  <path d="M-22 112 L-9 115" />
                  <path d="M-16 88 L-5 99" />
                  <path d="M2 72 L6 87" />
                </>
              )}
            </motion.g>
          )}
        </motion.g>
      </g>
    </svg>
  );
}

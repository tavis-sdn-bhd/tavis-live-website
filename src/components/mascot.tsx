"use client";

import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useSpring, type MotionValue, type Transition } from "motion/react";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { OutfitBack, OutfitBody, OutfitHead, Prop, outfitHasProp, outfitHidesLogo, type Outfit } from "./mascot-outfits";
import { C } from "./mascot-palette";
import { cx } from "./ui";
import { easeOutExpo, playful, standard } from "./motion";
import { useAmbientStill, useMotionPaused } from "./motion-pause";

export type { Outfit } from "./mascot-outfits";

/**
 * Tavi, the Tavis dolphin, drawn flat in code after the 3D original.
 *
 * Built like an illustration, not a puppet: resting arms sit behind the body
 * so shoulders never show a joint, and each pose has its own arm drawing that
 * grows out of the shoulder. Pose changes cross-fade those drawings, tilt the
 * head and shift the stance. Colours sit in the brand's green family; eyes use
 * the brand forest instead of black.
 *
 * What keeps it a dolphin and not a shark: a beak that sits proud of the face,
 * a white jaw inset so green wraps the cheeks, a curved fin with a rounded tip,
 * a blowhole, and a two-lobed fluke.
 */

export type Mood = "idle" | "wave" | "cheer" | "sad" | "think" | "swim";

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


const THINK_GAZE = { x: -3, y: -3.5 };

// Pose arms cross-fade, so the outgoing drawing leaves as fast as the new one arrives: no see-through gap.
const fade: Transition = { duration: 0.18, ease: easeOutExpo };

/** Motion pivots SVG parts on their bounding box: fractions are (pivot − box start) / box size. */
const pivots = {
  head: { originX: 0.48, originY: 0.96 }, // neck (130,184) in x 44–224, y 6–192
  tail: { originX: 0.07, originY: 0.82 }, // root (172,246) in x 166–254, y 197–257
  fin: { originX: 0.36, originY: 0.86 }, // base (164,52) in x 142–203, y 2–60
  raisedLeft: { originX: 0.79, originY: 0.96 }, // shoulder (90,188) in x 31–106, y 94–192
  raisedRight: { originX: 0.21, originY: 0.96 }, // shoulder (170,188) in x 154–229, y 94–192
};

type Props = {
  mood?: Mood;
  /** Pupils follow the pointer. */
  follow?: boolean;
  className?: string;
  title?: string;
  /** Pure ornament: hidden from assistive tech. */
  decorative?: boolean;
  /** What Tavi is wearing. Props are held in the right hand. */
  outfit?: Outfit;
  /** Pins the pupils to an offset (about ±3.5 per axis), overriding `follow`. */
  look?: { x: number; y: number };
  /** The scroll companion: doesn't count as Tavi being on stage. */
  roaming?: boolean;
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
 * Pupil offset as springs. Pointer moves write motion values directly, so
 * following the cursor never re-renders the SVG. `fixed` pins the gaze
 * (e.g. looking up while thinking).
 */
function useGaze(follow: boolean, ref: RefObject<SVGSVGElement | null>, fixed: { x: number; y: number } | null): Gaze {
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  // Pupils chase a moving pointer, so they land without overshoot: a bouncy spring reads as jitter.
  const x = useSpring(tx, standard);
  const y = useSpring(ty, standard);

  useEffect(() => {
    if (fixed) {
      tx.set(fixed.x);
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
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height * 0.33);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 260);
      tx.set((dx / d) * 3.4 * k);
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
  }, [follow, ref, fixed?.x, fixed?.y, tx, ty]);

  return { x, y };
}

/* ── Arms: one drawing per pose ─────────────────────────────────────────── */

/** Resting arm, tucked behind the torso so the shoulder reads as one shape. */
const restLeft = "M104 180 C82 180 60 192 52 214 C48 228 56 238 66 234 C78 230 92 216 100 204Z";
const restRight = "M156 180 C178 180 200 192 208 214 C212 228 204 238 194 234 C182 230 168 216 160 204Z";
/** Raised arm: grows from the side of the chest up past the cheek to a round hand. */
const raisedLeft = "M102 186 C92 192 80 186 70 172 C58 156 44 136 36 118 C31 104 43 94 53 102 C61 110 70 128 80 146 C88 160 98 170 106 176Z";
const raisedRight = "M158 186 C168 192 180 186 190 172 C202 156 216 136 224 118 C229 104 217 94 207 102 C199 110 190 128 180 146 C172 160 162 170 154 176Z";
/** Holding something in front of the belly; the prop is drawn over the hand at the grip. */
const holdRight = "M186 176 C206 180 220 200 216 218 C212 232 196 238 182 234 C172 231 170 222 178 218 C188 214 198 208 198 198 C196 190 190 184 182 182Z";
const grip = { hold: "translate(172 214) scale(1.3)", raised: "translate(214 90) scale(1.2)" } as const;
/** Hand to chin. */
const thinkRight = "M172 220 C190 210 194 190 184 180 C176 172 160 174 150 180 C142 185 145 194 154 193 C162 192 168 190 170 198Z";

function Eye({ cx, state, gaze }: { cx: number; state: "open" | "closed" | "happy"; gaze: Gaze }) {
  if (state === "happy") {
    return <path d={`M${cx - 11} 99 Q${cx} 85 ${cx + 11} 99`} fill="none" stroke={C.eye} strokeWidth="5" strokeLinecap="round" />;
  }
  return (
    <motion.g animate={{ scaleY: state === "closed" ? 0.08 : 1 }} transition={{ duration: 0.08, ease: easeOutExpo }}>
      <ellipse cx={cx} cy={96} rx={11.5} ry={13.5} fill={C.eye} />
      <motion.g style={{ x: gaze.x, y: gaze.y }}>
        <circle cx={cx - 3.8} cy={90.5} r={5} fill={C.white} />
        <circle cx={cx + 4} cy={101.5} r={2} fill={C.white} opacity={0.85} />
      </motion.g>
    </motion.g>
  );
}

function Mouth({ mood }: { mood: Mood }) {
  if (mood === "sad") return <path d="M116 166 Q130 155 144 166" fill="none" stroke={C.mouth} strokeWidth="4.5" strokeLinecap="round" />;
  if (mood === "think") return <ellipse cx={140} cy={160} rx={5.5} ry={4.5} fill={C.mouth} />;
  if (mood === "idle")
    return (
      <g>
        <path d="M104 150 Q130 180 156 150 Q130 157 104 150Z" fill={C.mouth} />
        <path d="M116 162 Q130 156 144 162 Q138 172 130 172 Q122 172 116 162Z" fill={C.tongue} />
      </g>
    );
  return (
    <g>
      <path d="M100 149 Q130 192 160 149 Q130 158 100 149Z" fill={C.mouth} />
      <path d="M113 167 Q130 158 147 167 Q141 181 130 181 Q119 181 113 167Z" fill={C.tongue} />
    </g>
  );
}

export function Mascot({ mood = "idle", follow = false, className, title = "Tavi, the Tavis dolphin", decorative = false, outfit = "none", look, roaming = false }: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<SVGSVGElement>(null);
  const titleId = useId();
  // Loops and listeners only run while Tavi is on screen and the visitor is around and hasn't paused animations.
  // A resting Tavi holds its pose and keeps blinking (not when paused), which costs a few frames every few seconds.
  const inView = useInView(ref);
  const ambientStill = useAmbientStill();
  const paused = useMotionPaused();
  const still = ambientStill || !inView;
  const blink = useBlink(!reduce && !paused && inView && mood !== "cheer");
  const gaze = useGaze(follow && !still, ref, look ?? (mood === "think" ? THINK_GAZE : null));
  useEffect(() => (roaming || !inView ? undefined : enterStage()), [roaming, inView]);

  const leftEye = blink ? "closed" : mood === "cheer" ? "happy" : "open";
  const rightEye = blink ? "closed" : mood === "cheer" || mood === "wave" ? "happy" : "open";
  const headTilt = mood === "wave" ? 5 : mood === "think" ? -6 : mood === "sad" ? -3 : 0;

  const leftArm = mood === "wave" || mood === "cheer" ? "raised" : "rest";
  const hasProp = outfitHasProp(outfit);
  const rightArm = mood === "cheer" ? "raised" : mood === "think" ? "think" : hasProp ? "hold" : "rest";

  return (
    <svg
      ref={ref}
      viewBox="0 0 260 300"
      overflow="visible"
      className={cx("select-none", className)}
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-labelledby": titleId })}
    >
      {!decorative && <title id={titleId}>{title}</title>}

      {/* Every loop needs a resting target: an empty `animate` would leave a repeating animation running. */}
      <motion.g
        animate={
          still
            ? { y: mood === "sad" ? 4 : 0, transition: playful }
            : mood === "cheer"
              ? { y: [0, -14, 0], transition: { duration: 0.6, repeat: Infinity, repeatDelay: 0.25, ease: "easeOut" } }
              : mood === "sad"
                ? { y: 4, transition: playful }
                : { y: [0, -2.5, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } }
        }
      >
        {/* Tail */}
        <motion.g
          style={pivots.tail}
          animate={still ? { rotate: 0 } : mood === "swim" ? { rotate: [-10, 14, -10] } : { rotate: [0, 7, 0] }}
          transition={still ? playful : { duration: mood === "swim" ? 0.55 : 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M168 236 C190 248 206 242 216 226 L228 232 C218 254 192 262 166 254Z" fill={C.shade} />
          <path
            transform="translate(222 228) rotate(37) scale(0.85)"
            d="M0 4 C-4 -2 -12 -8 -24 -10 C-32 -11 -34 -16 -28 -20 C-18 -24 -6 -20 0 -12 C6 -20 18 -24 28 -20 C34 -16 32 -11 24 -10 C12 -8 4 -2 0 4Z"
            fill={C.shade}
          />
        </motion.g>

        {/* Resting arms sit behind the torso */}
        <AnimatePresence initial={false}>
          {leftArm === "rest" && (
            <motion.path key="rest-left" d={restLeft} fill={C.shade} initial={{ opacity: 0 }} animate={{ opacity: 1, rotate: mood === "sad" ? -6 : mood === "swim" ? 14 : 0 }} exit={{ opacity: 0 }} transition={fade} />
          )}
          {rightArm === "rest" && (
            <motion.path key="rest-right" d={restRight} fill={C.shade} initial={{ opacity: 0 }} animate={{ opacity: 1, rotate: mood === "sad" ? 6 : mood === "swim" ? -14 : 0 }} exit={{ opacity: 0 }} transition={fade} />
          )}
        </AnimatePresence>

        {/* Feet, planted with a little stance */}
        <g>
          <ellipse cx={107} cy={273} rx={22} ry={14} fill={C.whiteShade} transform="rotate(-8 107 273)" />
          <ellipse cx={153} cy={273} rx={22} ry={14} fill={C.whiteShade} transform="rotate(8 153 273)" />
          <ellipse cx={105} cy={268} rx={15} ry={7} fill={C.white} transform="rotate(-8 105 268)" />
          <ellipse cx={155} cy={268} rx={15} ry={7} fill={C.white} transform="rotate(8 155 268)" />
        </g>

        <OutfitBack outfit={outfit} />

        {/* Body: soft pear, white front */}
        <path d="M88 160 C70 186 62 222 70 246 C78 266 102 272 130 272 C158 272 182 266 190 246 C198 222 190 186 172 160Z" fill={C.body} />
        <path d="M172 168 C190 194 196 230 186 252 C178 266 160 271 146 272 C170 266 184 248 184 224 C184 200 178 182 168 166Z" fill={C.shade} />
        <path d="M96 176 C84 202 84 236 96 254 C106 266 154 266 164 254 C176 236 176 202 164 176 C150 186 110 186 96 176Z" fill={C.white} />
        <path d="M92 236 C102 260 158 260 168 236 C164 262 150 266 130 266 C110 266 96 262 92 236Z" fill={C.whiteShade} />

        {!outfitHidesLogo(outfit) && (
          <g transform="translate(98 210)">
            <rect width={21} height={21} rx={5} fill={C.brand} />
            <path
              transform="scale(0.66)"
              d="M7 8H13C15.5 8 16 10.5 16 12.5C16 10.5 16.5 8 19 8H25V11.5H20.5C18.3 11.5 17.6 13.2 17.6 15.2V25H14.4V15.2C14.4 13.2 13.7 11.5 11.5 11.5H7Z"
              fill={C.white}
            />
            {!hasProp && (
              <text x={25} y={16} fontFamily="var(--font-display)" fontSize={16} fill={C.word}>
                tavis
              </text>
            )}
          </g>
        )}

        <OutfitBody outfit={outfit} />

        {/* Head */}
        <motion.g style={pivots.head} animate={{ rotate: headTilt, y: mood === "sad" ? 3 : 0 }} transition={playful}>
          <motion.path
            d="M142 36 C150 16 172 4 196 2 C204 2 206 8 200 12 C188 22 182 40 184 60Z"
            fill={C.shade}
            style={pivots.fin}
            animate={{ rotate: mood === "sad" ? -10 : 0 }}
            transition={playful}
          />
          <ellipse cx={130} cy={104} rx={86} ry={82} fill={C.body} />
          <ellipse cx={90} cy={52} rx={24} ry={11} fill={C.light} transform="rotate(-24 90 52)" />

          {/* White lower jaw, continuous with the chest */}
          <path d="M78 136 C92 148 110 152 130 152 C150 152 168 148 182 136 C184 172 160 194 130 194 C100 194 76 172 78 136Z" fill={C.white} />

          {/* Beak, with a crease where it meets the forehead */}
          <ellipse cx={130} cy={135} rx={36} ry={19} fill={C.whiteShade} />
          <ellipse cx={130} cy={129} rx={36} ry={19} fill={C.body} />
          <path d="M97 122 Q130 100 163 122" fill="none" stroke={C.shade} strokeWidth={4} strokeLinecap="round" />
          <ellipse cx={116} cy={121} rx={12} ry={4} fill={C.light} />
          <path d="M112 34 Q120 29 128 34" fill="none" stroke={C.deep} strokeWidth={3.5} strokeLinecap="round" />

          <Eye cx={96} state={leftEye} gaze={gaze} />
          <Eye cx={164} state={rightEye} gaze={gaze} />
          {mood === "sad" && (
            <g stroke={C.deep} strokeWidth={4.5} strokeLinecap="round">
              <path d="M82 74 L104 69" />
              <path d="M156 69 L178 74" />
            </g>
          )}

          <ellipse cx={76} cy={130} rx={12} ry={7.5} fill={C.cheek} opacity={0.8} />
          <ellipse cx={184} cy={130} rx={12} ry={7.5} fill={C.cheek} opacity={0.8} />

          <Mouth mood={mood} />
          <OutfitHead outfit={outfit} />
        </motion.g>

        {/* Pose arms, in front */}
        <AnimatePresence initial={false}>
          {leftArm === "raised" && (
            <motion.g key="raised-left" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade}>
              <motion.path
                d={raisedLeft}
                fill={C.body}
                style={pivots.raisedLeft}
                animate={mood === "wave" && !still ? { rotate: [0, -12, 0] } : { rotate: 0 }}
                transition={mood === "wave" && !still ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" } : playful}
              />
              <ellipse cx={44} cy={104} rx={5} ry={3} fill={C.light} transform="rotate(-40 44 104)" />
            </motion.g>
          )}
          {rightArm === "raised" && (
            <motion.path key="raised-right" d={raisedRight} fill={C.shade} style={pivots.raisedRight} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade} />
          )}
          {rightArm === "hold" && (
            <motion.path key="hold-right" d={holdRight} fill={C.shade} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade} />
          )}
          {rightArm === "think" && (
            <motion.path key="think-right" d={thinkRight} fill={C.shade} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade} />
          )}
        </AnimatePresence>

        {/* Held prop, in front of the hand */}
        {hasProp && (rightArm === "hold" || rightArm === "raised") && (
          <motion.g key={rightArm} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={fade}>
            <g transform={grip[rightArm]}>
              <Prop outfit={outfit} still={still} />
            </g>
          </motion.g>
        )}

        {(mood === "wave" || mood === "cheer") && (
          <motion.g
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={playful}
            stroke="#f6c445"
            strokeWidth="7"
            strokeLinecap="round"
          >
            <path d="M8 104 L22 110" />
            <path d="M14 78 L26 92" />
            <path d="M36 62 L40 78" />
          </motion.g>
        )}
      </motion.g>
    </svg>
  );
}

/* The student avatars from the app's avatar shop. They are painted in the app's own style (generated to match the
   client's screenshots, then cut out and aligned in `public/assets/students/`), so they are raster art in an SVG
   frame: the frame keeps every look on one 200 × 512 canvas with the feet on one line, and `head` crops the same
   picture to a square portrait, so the tab bar and the home greeting never drift from the full figure. */

export type Look = "pink" | "green" | "blue";
/** The shop's hijab outfits: the sage one the student owns, and the colours still locked. */
export type HijabTone = "sage" | "olive" | "rose" | "grey" | "plum";

const art = "/assets/students";

/** A player with no avatar: a plain figure in the current text colour. */
function Placeholder() {
  return (
    <g fill="currentColor">
      <ellipse cx="100" cy="128" rx="54" ry="58" />
      <path d="M58 214c0-12 14-18 42-18s42 6 42 18l8 150c0 8-6 14-14 14h-12l-4 112H96v-112h-8l-4 112H66l-4-112H54c-8 0-14-6-14-14Z" />
    </g>
  );
}

type StudentProps = {
  /** null draws the empty placeholder the app shows for a player without an avatar. */
  look: Look | null;
  /** Crop to a square portrait of the head (its own small file). */
  head?: boolean;
  /** Drawn small (a shop tile, the podium): a 160px-wide file instead of the full art. */
  small?: boolean;
  /** A small thumbnail of the hijab outfit in this colour, for the shop's tiles; the other looks ignore it. */
  tone?: HijabTone;
  /** Names the figure for screen readers; without it the drawing is decorative. */
  label?: string;
  className?: string;
};

export function Student({ look, head, small, tone, label, className }: StudentProps) {
  // The head is its own square crop; a small figure or a hijab colour, a 160 or 96px-wide copy of the same canvas
  const file = !look ? null : head ? `${look}-head` : look === "green" && tone ? `hijab-${tone}` : small ? `${look}-small` : look;
  return (
    <svg
      viewBox={head ? "10 10 180 180" : "0 0 200 512"}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      className={className}
    >
      {!file ? (
        <Placeholder />
      ) : head ? (
        <image href={`${art}/${file}.webp`} x="10" y="10" width="180" height="180" />
      ) : (
        <image href={`${art}/${file}.webp`} width="200" height="512" />
      )}
    </svg>
  );
}

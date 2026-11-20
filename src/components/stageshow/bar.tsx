import type { HTMLAttributes } from 'react'
import './bar.css'

// The kit's placeholder line (kit/window.tsx's Bar), on its own: this site
// uses no Window.

const INK = ['var(--ss-ink-1)', 'var(--ss-ink-2)', 'var(--ss-ink-3)', 'var(--ss-ink-4)', 'var(--ss-ink-5)']

export interface BarProps extends HTMLAttributes<HTMLSpanElement> {
  w: number | string
  h?: number
  /** 1 (faintest) to 5 */
  tone?: 1 | 2 | 3 | 4 | 5
  r?: number
  /** Let it narrow in a row too tight for it, never past its container. On
   * by default for a line (a numeric `w` over three times `h`); an icon slot,
   * a dot or a percentage width keeps its size. */
  shrink?: boolean
}

/** A placeholder: a line of text, a value, an icon slot or a pill. */
export function Bar({ w, h = 6, tone = 3, r = 2, shrink, className, style, ...rest }: BarProps) {
  const gives = shrink ?? (typeof w === 'number' && w > h * 3)
  return <span {...rest} className={`ss-bar${className ? ` ${className}` : ''}`} data-shrink={gives || undefined} style={{ width: w, height: h, borderRadius: r, background: INK[tone - 1], ...style }} />
}

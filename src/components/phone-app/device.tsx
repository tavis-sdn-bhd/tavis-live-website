import type { ReactNode } from "react";

/**
 * A realistic phone, drawn at true iPhone size (393 × 852 pt screen) so the app
 * inside has real proportions. `zoom` scales the whole device per breakpoint,
 * which keeps layout size and hit-testing correct without measuring.
 */

const SCREEN = { w: 393, h: 852 } as const;
const BEZEL = 12;

/** The device's outer size: the screen plus its bezel each side. */
export const DEVICE = { w: SCREEN.w + BEZEL * 2, h: SCREEN.h + BEZEL * 2 } as const;

function StatusBar() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-40 flex h-[54px] items-center justify-between px-[34px] pt-[6px]"
      style={{ color: "var(--status-ink)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif" }}
    >
      <span className="w-[60px] text-center text-[17px] font-semibold tracking-[-0.02em]">9:41</span>
      <span className="flex items-center gap-[6px]">
        <svg width="19" height="12" viewBox="0 0 19 12" fill="currentColor">
          <rect x="0" y="8" width="3.2" height="4" rx="1" />
          <rect x="5" y="5.5" width="3.2" height="6.5" rx="1" />
          <rect x="10" y="3" width="3.2" height="9" rx="1" />
          <rect x="15" y="0" width="3.2" height="12" rx="1" opacity="0.35" />
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
          <path d="M8.5 2.6c2.4 0 4.6.9 6.3 2.5l1.2-1.2A10.6 10.6 0 0 0 8.5.9 10.6 10.6 0 0 0 1 3.9l1.2 1.2a9 9 0 0 1 6.3-2.5Z" />
          <path d="M8.5 6c1.4 0 2.7.5 3.7 1.4l1.2-1.2a7 7 0 0 0-9.8 0l1.2 1.2c1-.9 2.3-1.4 3.7-1.4Z" />
          <path d="M8.5 9.3c.6 0 1.1.2 1.5.6L8.5 11.5 7 9.9c.4-.4.9-.6 1.5-.6Z" />
        </svg>
        <span className="relative flex h-[13px] w-[27px] items-center rounded-[4px] border-[1.5px] border-current/35 p-[1.5px]">
          <span className="h-full w-[85%] rounded-[2px] bg-current" />
          <span className="absolute -right-[4px] top-1/2 h-[4px] w-[1.5px] -translate-y-1/2 rounded-r bg-current/40" />
        </span>
      </span>
    </div>
  );
}

/** `status` off leaves the status bar to the screen itself, as a screenshot carries its own. */
export function Device({ children, status = true }: { children: ReactNode; status?: boolean }) {
  return (
    <div className="relative" style={{ width: DEVICE.w, height: DEVICE.h }}>
      {/* Side buttons */}
      <span aria-hidden="true" className="absolute -left-[3px] top-[118px] h-[32px] w-[4px] rounded-l-[3px] bg-[#2b302e]" />
      <span aria-hidden="true" className="absolute -left-[3px] top-[176px] h-[62px] w-[4px] rounded-l-[3px] bg-[#2b302e]" />
      <span aria-hidden="true" className="absolute -left-[3px] top-[252px] h-[62px] w-[4px] rounded-l-[3px] bg-[#2b302e]" />
      <span aria-hidden="true" className="absolute -right-[3px] top-[200px] h-[98px] w-[4px] rounded-r-[3px] bg-[#2b302e]" />

      {/* Titanium frame, then the black bezel */}
      <div className="absolute inset-0 rounded-[68px] bg-[#3a3f3d] p-[3px]">
        <div className="relative size-full rounded-[65px] bg-[#0b0d0c] p-[9px] ring-1 ring-inset ring-white/10">
          {/* Screen. A screen marked data-status="light" (a dark background) turns the status bar and home indicator white. */}
          <div
            className="relative size-full overflow-hidden rounded-[56px] bg-white [--status-ink:#0b0f0d] has-[[data-status=light]]:[--status-ink:#fff]"
            style={{ isolation: "isolate" }}
          >
            {children}
            {status && <StatusBar />}
            {/* Dynamic Island */}
            <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[11px] z-50 h-[37px] w-[125px] -translate-x-1/2 rounded-full bg-black" />
            {/* Home indicator */}
            <div aria-hidden="true" className="pointer-events-none absolute bottom-[8px] left-1/2 z-50 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-(--status-ink) opacity-85 transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
}

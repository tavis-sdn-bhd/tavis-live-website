"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { Screen } from "@/lib/content";
import { DEVICE } from "./phone-app/device";
import { AppScene } from "./phone-app/tavis-app";
import { cx } from "./ui";

/**
 * A moment of the Tavis app on a real-proportioned iPhone, scaled to its
 * column. The screen is the coded app frozen at `screen.scene`, so it is
 * sharp at any size and never drifts from the live phone. The device is
 * drawn at true size and zoomed to the measured width; the box keeps the
 * phone's ratio, so nothing moves when the zoom lands. Resizing only
 * updates a CSS variable, so the scene never re-renders, and a box with no
 * width (hidden at this breakpoint) never mounts the scene at all.
 */
export function Phone({ screen, className }: { screen: Screen; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [sized, setSized] = useState(false);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      if (!el.clientWidth) return;
      el.style.setProperty("--zoom", String(el.clientWidth / DEVICE.w));
      setSized(true);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} role="img" aria-label={screen.alt} className={cx("relative select-none", className)} style={{ aspectRatio: `${DEVICE.w} / ${DEVICE.h}` }}>
      {sized && (
        <div inert className="absolute left-0 top-0" style={{ zoom: "var(--zoom)" }}>
          <AppScene scene={screen.scene} />
        </div>
      )}
    </div>
  );
}

"use client";

import { type ComponentProps, type MouseEvent, useRef } from "react";

const easeOutQuart = "cubic-bezier(0.25, 1, 0.5, 1)";
const opening: KeyframeAnimationOptions = { duration: 280, easing: easeOutQuart };
const closing: KeyframeAnimationOptions = { duration: 170, easing: easeOutQuart };

/** A native <details> whose height eases open and shut instead of jumping. Until it hydrates, and with reduced motion,
    it opens the way the browser opens it. While it shuts it carries `data-closing`, so its marker can turn at the tap
    rather than when the height lands. A tap mid-animation reverses it from where it is. */
export function EasedDetails({ onClick, ...props }: ComponentProps<"details">) {
  const ref = useRef<HTMLDetailsElement>(null);
  const running = useRef<Animation | null>(null);

  function toggle(event: MouseEvent<HTMLDetailsElement>) {
    onClick?.(event);
    const details = ref.current;
    const summary = details?.querySelector(":scope > summary");
    if (event.defaultPrevented || !details || !(summary instanceof HTMLElement)) return;
    if (!(event.target instanceof Element) || event.target.closest("summary") !== summary) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    event.preventDefault();

    const from = details.offsetHeight;
    running.current?.cancel();
    const show = !details.open || "closing" in details.dataset;
    if (show) {
      delete details.dataset.closing;
      details.open = true;
    } else {
      details.dataset.closing = "";
    }
    const to = show ? details.offsetHeight : summary.offsetHeight + details.offsetHeight - details.clientHeight;
    details.style.overflow = "hidden";
    const animation = details.animate({ height: [`${from}px`, `${to}px`] }, show ? opening : closing);
    running.current = animation;
    animation.onfinish = () => {
      if (running.current !== animation) return;
      running.current = null;
      details.style.overflow = "";
      if (show) return;
      details.open = false;
      delete details.dataset.closing;
    };
  }

  return <details ref={ref} onClick={toggle} {...props} />;
}

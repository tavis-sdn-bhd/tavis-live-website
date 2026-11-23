"use client";

import { Image } from "@/components/image";
import { usePathname } from "@/lib/pathname";
import { AnimatePresence, motion } from "motion/react";
import { type ComponentType, type RefObject, type SVGProps, useEffect, useId, useRef, useState } from "react";
import { hero as home, links } from "@/lib/content";
import { type DesignId, type PagePath, navOf } from "@/lib/site";
import { BookOpen, Brain, CaretRight, Check, Gift, Newspaper, PlayCircle, SealCheck, Student } from "../icons";
import { easeOutExpo, exitAfter } from "../motion";
import { NewTab, cx } from "../ui";
import { GetButton } from "./get-button";
import { useInDesign } from "../design-link";
import { LanguageSwitch } from "../language-switch";
import { Button } from "./ui";

/** True once the page's hero (`#top`) has scrolled up behind the header; true at once on a page without one. */
function usePastHero(header: RefObject<HTMLElement | null>, pathname: string) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero || !header.current) {
      setPast(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => setPast(entry ? !entry.isIntersecting : false), {
      rootMargin: `-${header.current.offsetHeight}px 0px 0px 0px`,
    });
    io.observe(hero);
    return () => io.disconnect();
  }, [header, pathname]);
  return past;
}

/** Each page's tile in the menu: its icon on one of the brand fills, the way the feature tiles are drawn. Keyed by path
    rather than PagePath, so a page only the Astro port has (its blog) can have a tile in this shared file. */
const pageTiles: Partial<Record<PagePath | "/blog", { icon: ComponentType<SVGProps<SVGSVGElement>>; fill: string }>> = {
  "/question-universe": { icon: Brain, fill: "bg-sky-ink text-white" },
  "/rewards": { icon: Gift, fill: "bg-sun text-forest" },
  "/online-tuition": { icon: PlayCircle, fill: "bg-brand text-forest" },
  "/tutors": { icon: Student, fill: "bg-sky-ink text-white" },
  "/parents": { icon: SealCheck, fill: "bg-sun text-forest" },
  "/blog": { icon: Newspaper, fill: "bg-sky-ink text-white" },
  "/about": { icon: BookOpen, fill: "bg-brand text-forest" },
};

/** The pages the bar lists on wide screens: the student's way in, and the parents'. The rest (tutors, the blog, about)
    are a step away: in the menu, the footer and the pages that lead to them. */
const barPages: readonly PagePath[] = ["/question-universe", "/rewards", "/online-tuition", "/parents"];

/** The header's Get Tavis label, split before its last word so a narrow bar can drop it ("free"). A label longer than
    English's ("Muat turun percuma") needs a wider bar before its last word fits. */
const ctaCut = home.cta.lastIndexOf(" ");
const [ctaLead, ctaLast] = ctaCut > 0 ? [home.cta.slice(0, ctaCut), home.cta.slice(ctaCut)] : [home.cta, ""];
const ctaLastHidden = home.cta.length > 16 ? "max-md:hidden" : "max-[359px]:hidden";

/** Three bars that fold into a cross: the middle one fades while the outer two turn onto it. */
function MenuGlyph() {
  const bar = "absolute left-0 h-[3px] w-full rounded-full bg-current transition-[translate,rotate,opacity] duration-300 ease-out-quart motion-reduce:transition-none";
  return (
    <span aria-hidden="true" className="relative block h-3.5 w-[1.125rem]">
      <span className={cx(bar, "top-0 group-aria-expanded:translate-y-[5.5px] group-aria-expanded:rotate-45")} />
      <span className={cx(bar, "top-[5.5px] group-aria-expanded:opacity-0")} />
      <span className={cx(bar, "bottom-0 group-aria-expanded:-translate-y-[5.5px] group-aria-expanded:-rotate-45")} />
    </span>
  );
}

/** Duolingo's bar: white and borderless over the hero, a 2px hairline fading in once the hero is gone. From xl it lists
    the main pages beside the logo; below xl the pages move into a menu: a sheet under the bar with every page as a chunky row, and the two actions (get the app,
    sign in) pinned at its foot. The page behind leaves the tab order while it is open. */
export function Header({ design }: { design: DesignId }) {
  const pathname = usePathname();
  const inDesign = useInDesign();
  const ref = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const pastHero = usePastHero(ref, pathname);
  const items = navOf(design).map((item) => {
    const href = inDesign(item.href);
    return { ...item, page: item.href, tile: pageTiles[item.href], href, current: pathname === href };
  });
  const barItems = items.filter((item) => barPages.includes(item.page));

  // A link in the sheet changes the page; the sheet goes with the old one.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    const behind = [document.getElementById("main"), document.getElementById("contact"), document.getElementById("floating-chat")];
    for (const el of behind) el?.setAttribute("inert", "");
    sheet.current?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    const wide = matchMedia("(min-width: 80rem)");
    const onWide = () => wide.matches && setOpen(false);
    addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      root.style.overflow = overflow;
      for (const el of behind) el?.removeAttribute("inert");
      removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  return (
    <>
      <header
        ref={ref}
        className={cx(
          "sticky top-0 z-40 border-b-2 bg-paper pt-[env(safe-area-inset-top)] transition-[border-color] duration-300 [view-transition-name:site-header]",
          pastHero || open ? "border-line" : "border-transparent",
        )}
      >
        <div className="shell flex h-16 items-center gap-2 sm:h-[4.5rem] sm:gap-3">
          <a href={inDesign("/")} className="tap flex min-h-11 shrink-0 items-center rounded-lg" aria-label="Tavis home">
            <Image src="/assets/tavis-logo.svg" alt="" width={749} height={194} unoptimized priority className="h-7 w-auto sm:h-8" />
          </a>
          <nav aria-label="Primary" className="ml-6 hidden xl:block">
            <ul className="flex items-center gap-1">
              {barItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={item.current ? "page" : undefined}
                    className={cx(
                      "tap inline-flex h-10 items-center whitespace-nowrap rounded-xl px-3 font-display text-body-sm font-bold",
                      item.current ? "bg-cream text-forest" : "text-muted hover:bg-cream hover:text-forest",
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-2 whitespace-nowrap sm:gap-3">
            {/* In the bar from 640px; on a phone the bar has no room, so the menu carries it. */}
            <LanguageSwitch className="max-sm:hidden" />
            <a
              href={links.signIn}
              target="_blank"
              rel="noopener noreferrer"
              className="tap inline-flex h-10 items-center rounded-xl px-3 font-display text-body-sm font-bold text-sky-ink hover:bg-cream max-sm:hidden"
            >
              Sign in
              <NewTab />
            </a>
            {/* The full label from 360px (768px for a long one); narrower, the bar only has room for it without its last word. */}
            <GetButton size="sm" className="xl:min-h-[3.125rem] xl:px-5 xl:text-body-sm">
              <span>
                {ctaLead}
                <span className={ctaLastHidden}>{ctaLast}</span>
              </span>
            </GetButton>
            <button
              ref={toggle}
              type="button"
              aria-expanded={open}
              aria-controls={menuId}
              aria-label="Menu"
              onClick={() => setOpen((v) => !v)}
              className="ledge group relative grid size-10 place-items-center rounded-xl bg-paper text-forest shadow-[0_4px_0_var(--color-line-strong)] ring-2 ring-inset ring-line-strong [--ledge-hover:0.95] before:absolute before:-inset-1 before:content-[''] aria-expanded:bg-cream xl:hidden"
            >
              <MenuGlyph />
            </button>
          </div>
        </div>
      </header>

      {/* Outside the bar, so it layers over the floating chat button (z-40) rather than inside the bar's own stack. */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={sheet}
            id={menuId}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: exitAfter(0.35) }}
            transition={{ duration: 0.35, ease: easeOutExpo }}
            className="fixed inset-x-0 bottom-0 top-[calc(4rem+2px+env(safe-area-inset-top))] z-50 flex flex-col overflow-y-auto overscroll-contain bg-paper sm:top-[calc(4.5rem+2px+env(safe-area-inset-top))] xl:hidden"
          >
            <nav aria-label="Pages" className="shell w-full flex-1 py-5">
              <LanguageSwitch labelled className="mx-auto mb-4 max-w-[36rem] sm:hidden" />
              <ul className="mx-auto grid max-w-[36rem] gap-2.5">
                {items.map((item, i) => {
                  const Icon = item.tile?.icon;
                  return (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.03 * i + 0.04, duration: 0.4, ease: easeOutExpo }}
                    >
                      <a
                        href={item.href}
                        aria-current={item.current ? "page" : undefined}
                        onClick={() => setOpen(false)}
                        className={cx(
                          "press flex min-h-16 items-center gap-4 rounded-2xl border-2 border-b-4 px-3 py-2.5",
                          item.current ? "border-sky bg-sky/10" : "border-line bg-paper active:bg-cream",
                        )}
                      >
                        {Icon && (
                          <span aria-hidden="true" className={cx("grid size-11 shrink-0 place-items-center rounded-xl shadow-[inset_0_-4px_0_rgb(0_0_0/0.15)]", item.tile?.fill)}>
                            <Icon className="size-6" />
                          </span>
                        )}
                        <span className={cx("flex-1 font-display text-[1.125rem] font-extrabold leading-tight", item.current ? "text-sky-ink" : "text-forest")}>{item.label}</span>
                        {item.current ? (
                          <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full bg-sky-ink text-white">
                            <Check className="size-3.5" />
                          </span>
                        ) : (
                          <CaretRight aria-hidden="true" className="size-4 text-muted" />
                        )}
                      </a>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>
            <div className="sticky bottom-0 border-t-2 border-line bg-paper pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
              <div className="shell mx-auto grid max-w-[36rem] gap-3 sm:max-w-[40rem] sm:grid-cols-2">
                <GetButton size="lg" className="w-full">
                  {home.cta}
                </GetButton>
                <Button href={links.signIn} tone="white" size="lg" target="_blank" rel="noopener noreferrer" className="w-full">
                  Sign in
                  <NewTab />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

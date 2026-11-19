"use client";

import { useEffect, useState } from "react";
import { q17 } from "@/lib/questions";
import { Mascot } from "./mascot";
import { TavisPhone } from "./phone-app/tavis-app";
import { useApp } from "./phone-app/state";

/** Where Tavi stands: tucked behind the phone's edge (A's hero), or beside it, touching only the bezel, and only from
    lg, where the column leaves room for him beside the phone (BA's practice band). */
type Tavi = "tucked" | "beside";

const taviSpot: Record<Tavi, string> = {
  tucked: "-mr-10 max-sm:hidden",
  beside: "-mr-3 max-lg:hidden",
};

/** Tavi beside the phone. Mood is read from the app's state, so it can't drift from it. */
function HeroMascot({ tavi }: { tavi: Tavi }) {
  const { picked, screen } = useApp();
  const [greeting, setGreeting] = useState(true);
  useEffect(() => {
    const id = window.setTimeout(() => setGreeting(false), 3200);
    return () => window.clearTimeout(id);
  }, []);

  // React only while the answer is on screen; elsewhere Tavi relaxes.
  const answering = picked !== null && (screen === "question" || screen === "done");
  const mood = answering ? (picked === q17.answer ? "cheer" : "sad") : greeting ? "wave" : "idle";
  return (
    <Mascot
      mood={mood}
      outfit="science"
      follow
      decorative
      className={`pointer-events-none absolute -bottom-2 right-full w-[240px] ${taviSpot[tavi]}`}
    />
  );
}

/**
 * The hero's working phone. Phone and mascot share one zoom, so they scale together.
 * On phones it shrinks to leave room to swipe past it, and Tavi is hidden in CSS so
 * the server HTML matches every viewport.
 */
export function HeroPhone({ tavi = "tucked" }: { tavi?: Tavi }) {
  return (
    <TavisPhone className="mx-auto [zoom:0.7] sm:[zoom:0.78] xl:[zoom:0.8]">
      <HeroMascot tavi={tavi} />
    </TavisPhone>
  );
}

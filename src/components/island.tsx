import type { ComponentType } from "react";
import { PathnameContext } from "@/lib/pathname";
import { MotionProvider } from "./motion";

/** A component as an Astro island root. Islands share no React context, so each one brings the path being viewed, which
    Astro passes as `path`, and the site's motion settings. */
export function island(Component: ComponentType) {
  function Island({ path }: { path: string }) {
    return (
      <PathnameContext value={path}>
        <MotionProvider>
          <Component />
        </MotionProvider>
      </PathnameContext>
    );
  }
  Island.displayName = `Island(${Component.displayName ?? Component.name})`;
  return Island;
}

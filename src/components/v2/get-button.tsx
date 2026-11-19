"use client";

import type { ComponentProps } from "react";
import { useStoreLink } from "@/lib/use-store-link";
import { StoreBadgeRow } from "../store-badges";
import { cx } from "../ui";
import { Button } from "./ui";

/** "Get Tavis": a phone goes straight to its store, a desktop scrolls to the download block. */
export function GetButton(props: Omit<ComponentProps<typeof Button>, "href">) {
  return <Button {...props} href={useStoreLink()} />;
}

/** A page's main "get the app" call to action: on a phone-width screen, the two stores' own badges, which parents know
    on sight and which open the store in one tap; from sm, the big green button, which on a desktop scrolls to the QR. */
export function GetTavis({ children, className }: { children: string; className?: string }) {
  return (
    <>
      <GetButton size="lg" className={cx("max-sm:hidden", className)}>
        {children}
      </GetButton>
      <StoreBadgeRow className="w-full sm:hidden" />
    </>
  );
}

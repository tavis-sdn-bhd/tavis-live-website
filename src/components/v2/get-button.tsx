"use client";

import type { ComponentProps, ReactNode } from "react";
import { links } from "@/lib/content";
import { useClientValue } from "@/lib/use-client-value";
import { storeFor, usePlatform } from "@/lib/use-store-link";
import { StoreBadgeRow } from "../store-badges";
import { cx, NewTab } from "../ui";
import { Button } from "./ui";

type GetButtonProps = Omit<ComponentProps<typeof Button>, "href" | "target" | "rel"> & {
  /** On a desktop, open the web app (BA) instead of scrolling to the download block (B). */
  webApp?: boolean;
};

/** "Get Tavis": a phone goes straight to its store. A desktop opens the web app's sign-up form in a new tab, as Sign
    in opens its sign-in page, or with `webApp` unset scrolls to the download block. Until the page hydrates a phone
    can't be told from a desktop, so a `webApp` button links to /get, which sends a phone to its store as it loads
    and shows a desktop the download page; otherwise an early tap on a phone would open the sign-up form. */
export function GetButton({ webApp, children, ...props }: GetButtonProps) {
  const platform = usePlatform();
  const hydrated = useClientValue(() => true, false);
  if (platform) return <Button {...props} href={storeFor[platform]}>{children}</Button>;
  if (!webApp) return <Button {...props} href="#download">{children}</Button>;
  if (!hydrated) return <Button {...props} href="/get">{children}</Button>;
  return (
    <Button {...props} href={links.signUp} target="_blank" rel="noopener noreferrer">
      {children}
      <NewTab />
    </Button>
  );
}

/** A BA page's main "get the app" call to action. On a phone, the two stores' own badges, which parents know on sight
    and which open the store in one tap. From sm, the big green button leads, opening the web app on a desktop, then the
    page's `secondary` button, then the badges under an "or get the app" rule at the stores' minimum height, 40px, so
    they read as a second way in rather than a third button. `secondary` sits between them in the markup, so keyboard
    and screen-reader order match what is on screen; it should hide itself below sm, where the badges lead. */
export function GetTavis({ children, secondary, className }: { children: string; secondary?: ReactNode; className?: string }) {
  return (
    <>
      <GetButton webApp size="lg" className={cx("max-sm:hidden", className)}>
        {children}
      </GetButton>
      {secondary}
      <div className="grid gap-2.5 sm:mt-3">
        <p className="flex items-center gap-3 text-[0.8125rem] font-bold uppercase tracking-[0.06em] text-muted max-sm:hidden">
          <span aria-hidden="true" className="h-0.5 flex-1 rounded-full bg-line" />
          or get the app
          <span aria-hidden="true" className="h-0.5 flex-1 rounded-full bg-line" />
        </p>
        <StoreBadgeRow className="w-full sm:[--badge:2.5rem]" />
      </div>
    </>
  );
}

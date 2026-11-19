import type { AnchorHTMLAttributes } from "react";
import { usePathname } from "@/lib/pathname";
import { defaultDesign, designOf, hrefIn } from "@/lib/site";

/** Resolves a deck path ("/rewards#earn") inside the design being viewed, so a section shared between designs keeps
    visitors in this one. Outside every design it resolves in the default one. Other hrefs pass through. */
export function useInDesign() {
  const design = designOf(usePathname()) ?? defaultDesign;
  return (href: string) => hrefIn(design, href);
}

const bare = (path: string) => path.replace(/\/$/, "") || "/";

/** A link whose deck paths stay inside the design being viewed. A link to the page being viewed, with no #section,
    is marked `aria-current="page"`. */
export function DesignLink({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const inDesign = useInDesign();
  const pathname = usePathname();
  const target = inDesign(href);
  const current = target.startsWith("/") && !target.includes("#") && bare(target) === bare(pathname);
  return <a href={target} aria-current={current ? "page" : undefined} {...props} />;
}

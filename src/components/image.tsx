import type { ImgHTMLAttributes } from "react";
import manifest from "@/lib/image-variants.json";

type Variants = { readonly base: string; readonly widths: readonly number[]; readonly full: number };

const variants: Readonly<Record<string, Variants>> = manifest;

/** The smallest pre-rendered WebP at least `width` wide. Sources without variants (SVG) pass through. */
function variantUrl(src: string, width: number): string {
  const entry = variants[src];
  if (!entry) return src;
  const w = entry.widths.find((candidate) => candidate >= width) ?? entry.full;
  return `${entry.base}-${w}.webp`;
}

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height" | "srcSet"> & {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Above the fold: load now, at high priority. */
  priority?: boolean;
  /** Serve `src` as is, with no srcset. */
  unoptimized?: boolean;
};

/** An <img> with a srcset of the pre-rendered variants: by viewport width when `sizes` is set, else 1x and 2x. */
export function Image({ src, width, height, sizes, priority = false, unoptimized = false, loading, style, ...rest }: Props) {
  let srcSet: string | undefined;
  let url = src;
  const entry = unoptimized ? undefined : variants[src];
  if (entry) {
    if (sizes) {
      srcSet = [...entry.widths, entry.full].map((w) => `${entry.base}-${w}.webp ${w}w`).join(", ");
      url = `${entry.base}-${entry.full}.webp`;
    } else {
      srcSet = `${variantUrl(src, width)} 1x, ${variantUrl(src, width * 2)} 2x`;
      url = variantUrl(src, width * 2);
    }
  }
  return (
    <img
      {...rest}
      src={url}
      srcSet={srcSet}
      sizes={sizes}
      width={width}
      height={height}
      loading={priority ? "eager" : (loading ?? "lazy")}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      style={{ color: "transparent", ...style }}
    />
  );
}

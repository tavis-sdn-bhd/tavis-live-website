import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { renderToStaticMarkup } from "react-dom/server";
import satori from "satori";
import sharp from "sharp";
import { Mascot } from "@/components/mascot";
import { type OgCard, type OgVisual, ogSize, plain } from "@/og/cards";

/*
 * Renders a page's Open Graph card in design BA's look: Nunito Black, a green accent line, art on a soft sky disc, and
 * the solid ledge shadow BA puts under its phones and buttons. scripts/og-cards.tsx runs this in Node before dev and
 * build, so none of it runs on the Worker. Satori decodes PNG but not WebP, so photos are cut from public/assets at
 * exactly the pixels they are drawn at; phone screens are PNGs beside this file. The cards themselves are
 * described in src/og/cards.ts. Output stays under ~300 KB, the size
 * above which WhatsApp is known to drop link previews.
 */

const ink = "#363636";
const brandInk = "#269a4b";
const brand = "#65cd7d";
const brandLedge = "#3d9c56";
const skySoft = "#ddf4ff";
const ledge = "rgba(30, 37, 45, 0.9)";
const muted = "#595959";

const here = join(process.cwd(), "scripts/og");
const fontDir = join(process.cwd(), "node_modules/@fontsource/nunito/files");

// Satori reads WOFF but not WOFF2; the site's variable Nunito ships only WOFF2, so the static cuts come from @fontsource/nunito.
const fonts = Promise.all([
  readFile(join(fontDir, "nunito-latin-900-normal.woff")),
  readFile(join(fontDir, "nunito-latin-800-normal.woff")),
]).then(([black, extraBold]) => [
  { name: "Nunito", data: black, weight: 900 as const, style: "normal" as const },
  { name: "Nunito", data: extraBold, weight: 800 as const, style: "normal" as const },
]);

function pngData(bytes: Buffer) {
  return `data:image/png;base64,${bytes.toString("base64")}`;
}

async function png(file: string) {
  const bytes = await readFile(join(here, file));
  return { src: pngData(bytes), width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

/** An asset resized to `width`, as PNG. */
async function asset(name: string, width: number) {
  const { data, info } = await sharp(join(process.cwd(), "public/assets", name)).resize({ width }).png().toBuffer({ resolveWithObject: true });
  return { src: pngData(data), width: info.width, height: info.height };
}

function svgData(markup: string) {
  return `data:image/svg+xml;base64,${Buffer.from(markup).toString("base64")}`;
}

const disc = { right: 70, top: 55, size: 520 } as const;

async function art(visual: OgVisual) {
  switch (visual.kind) {
    case "tavi": {
      const markup = renderToStaticMarkup(<Mascot mood={visual.mood} outfit={visual.outfit} decorative />).replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
      return <img src={svgData(markup)} width={390} height={450} style={{ position: "absolute", right: 135, top: 100 }} />;
    }
    case "phone": {
      const { src, width, height } = await png(visual.file);
      return (
        <div
          style={{
            position: "absolute",
            right: 205,
            top: 62,
            display: "flex",
            padding: 10,
            borderRadius: 46,
            background: "#242424",
            transform: "rotate(4deg)",
            boxShadow: `14px 16px 0 ${ledge}`,
          }}
        >
          <img src={src} width={width * 0.86} height={height * 0.86} style={{ borderRadius: 36 }} />
        </div>
      );
    }
    case "photo": {
      const { src, width, height } = await asset(visual.asset, 470);
      return (
        <img
          src={src}
          width={width}
          height={height}
          style={{ position: "absolute", right: 95, top: 160, borderRadius: 28, border: "10px solid #ffffff", transform: "rotate(3deg)", boxShadow: `14px 16px 0 ${ledge}` }}
        />
      );
    }
    case "cutout": {
      const { src, width, height } = await asset(visual.asset, 580);
      return <img src={src} width={width} height={height} style={{ position: "absolute", right: 40, bottom: 0 }} />;
    }
  }
}

const column = 560;

/** Nunito Black runs about 0.56em per character: the longest line fills the column, between 54 and 92px. */
function headlineSize(lines: readonly string[]) {
  const longest = Math.max(...lines.map((line) => line.length));
  return Math.max(54, Math.min(92, Math.floor(column / (longest * 0.56))));
}

export async function renderOgCard({ title, accent, visual }: OgCard): Promise<Buffer> {
  const lines = title.map(plain);
  const accentLine = accent ? plain(accent) : undefined;
  const fontSize = headlineSize(accentLine ? [...lines, accentLine] : lines);
  const logo = await readFile(join(process.cwd(), "public/assets/tavis-logo.svg"), "utf8");

  const svg = await satori(
    <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", background: "#ffffff", fontFamily: "Nunito", color: ink }}>
      <div style={{ position: "absolute", right: disc.right, top: disc.top, width: disc.size, height: disc.size, borderRadius: disc.size / 2, background: skySoft }} />
      {await art(visual)}
      <div style={{ position: "absolute", left: 80, top: 70, bottom: 70, width: column, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <img src={svgData(logo)} width={216} height={56} />
        <div style={{ display: "flex", flexDirection: "column", fontWeight: 900, fontSize, lineHeight: 1.02, letterSpacing: -1.5 }}>
          {lines.map((line) => (
            <div key={line}>{line}</div>
          ))}
          {accentLine && <div style={{ color: brandInk }}>{accentLine}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              padding: "14px 26px",
              borderRadius: 18,
              background: brand,
              color: "#242424",
              fontWeight: 900,
              fontSize: 24,
              letterSpacing: 1.5,
              boxShadow: `0 5px 0 ${brandLedge}`,
            }}
          >
            GET TAVIS FREE
          </div>
          <div style={{ fontWeight: 800, fontSize: 26, color: muted }}>tavis.live</div>
        </div>
      </div>
    </div>,
    { ...ogSize, fonts: await fonts },
  );

  const raw = new Resvg(svg, { fitTo: { mode: "width", value: ogSize.width } }).render().asPng();
  // A 256-colour palette keeps flat art exact and photos close, at a fraction of resvg's truecolour bytes.
  return sharp(raw).png({ palette: true, quality: 95, effort: 10, compressionLevel: 9 }).toBuffer();
}

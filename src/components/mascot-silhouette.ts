/** Point-in-shape tests on Tavi's own paths, so the rig can ask where a limb leaves the body. */

export type Point = { x: number; y: number };

/**
 * An absolute path of M, L, C and Z commands (as every mascot path is written) as points along it: `steps` per
 * curve, which is plenty for shapes a few hundred units across.
 */
export function points(d: string, steps = 16): Point[] {
  const tokens = d.match(/[MLCZ]|-?\d*\.?\d+/g) ?? [];
  const out: Point[] = [];
  let i = 0;
  let cmd = "M";
  let cur: Point = { x: 0, y: 0 };
  let start = cur;
  const pt = (): Point => ({ x: Number(tokens[i++]), y: Number(tokens[i++]) });
  while (i < tokens.length) {
    const token = tokens[i] ?? "";
    if (/[MLCZ]/.test(token)) {
      cmd = token;
      i++;
    }
    if (cmd === "M") {
      cur = start = pt();
      out.push(cur);
      cmd = "L";
    } else if (cmd === "L") {
      cur = pt();
      out.push(cur);
    } else if (cmd === "C") {
      const [p0, a, b, c] = [cur, pt(), pt(), pt()];
      for (let k = 1; k <= steps; k++) {
        const t = k / steps;
        const u = 1 - t;
        const [w0, w1, w2, w3] = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
        out.push({ x: w0 * p0.x + w1 * a.x + w2 * b.x + w3 * c.x, y: w0 * p0.y + w1 * a.y + w2 * b.y + w3 * c.y });
      }
      cur = c;
    } else {
      cur = start;
    }
  }
  return out;
}

/** Even-odd test against a closed outline given as points. */
export function contains(shape: readonly Point[], p: Point): boolean {
  let inside = false;
  for (let a = 0, b = shape.length - 1; a < shape.length; b = a++) {
    const pa = shape[a];
    const pb = shape[b];
    if (!pa || !pb) continue;
    if (pa.y > p.y !== pb.y > p.y && p.x < ((pb.x - pa.x) * (p.y - pa.y)) / (pb.y - pa.y) + pa.x) inside = !inside;
  }
  return inside;
}
